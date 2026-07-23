import logging
from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter

from rag.config import (
	CHUNK_OVERLAP,
	CHUNK_SIZE,
	DATA_DIR,
	EMBEDDING_MODEL,
	PROJECT_ROOT,
	VECTOR_STORE_DIR,
)

logger = logging.getLogger(__name__)


def discover_pdf_files(data_dir: Path | None = None) -> list[Path]:
	root = data_dir or DATA_DIR
	if not root.exists():
		raise FileNotFoundError(f"Data directory not found: {root}")

	pdf_files = sorted(root.rglob("*.pdf"))
	if not pdf_files:
		raise FileNotFoundError(f"No PDF files found under: {root}")

	return pdf_files


def load_pdf_documents(pdf_files: list[Path]) -> list[Document]:
	documents: list[Document] = []

	for pdf_path in pdf_files:
		relative_source = pdf_path.relative_to(PROJECT_ROOT).as_posix()
		try:
			pages = PyPDFLoader(str(pdf_path)).load()
		except Exception as exc:
			logger.warning("Skipping unreadable PDF %s: %s", relative_source, exc)
			continue

		for page in pages:
			text = (page.page_content or "").strip()
			if not text:
				continue

			page.metadata["source"] = relative_source
			page.metadata["file_name"] = pdf_path.name
			documents.append(page)

		logger.info("Loaded %s (%d pages with text)", relative_source, len(pages))

	return documents


def split_documents(documents: list[Document]) -> list[Document]:
	splitter = RecursiveCharacterTextSplitter(
		chunk_size=CHUNK_SIZE,
		chunk_overlap=CHUNK_OVERLAP,
		length_function=len,
	)
	return splitter.split_documents(documents)


def get_embeddings() -> HuggingFaceEmbeddings:
	return HuggingFaceEmbeddings(
		model_name=EMBEDDING_MODEL,
		model_kwargs={"device": "cpu", "local_files_only": True},
		encode_kwargs={"normalize_embeddings": True},
	)



def build_vector_store(
	data_dir: Path | None = None,
	output_dir: Path | None = None,
) -> FAISS:
	pdf_files = discover_pdf_files(data_dir)
	logger.info("Found %d PDF files", len(pdf_files))

	documents = load_pdf_documents(pdf_files)
	if not documents:
		raise RuntimeError("No text could be extracted from the PDF documents.")

	chunks = split_documents(documents)
	logger.info("Created %d text chunks from %d document pages", len(chunks), len(documents))

	embeddings = get_embeddings()
	vector_store = FAISS.from_documents(chunks, embeddings)

	target_dir = output_dir or VECTOR_STORE_DIR
	target_dir.mkdir(parents=True, exist_ok=True)
	vector_store.save_local(str(target_dir))
	logger.info("Saved FAISS index to %s", target_dir)

	return vector_store
