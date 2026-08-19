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


import re


def _clean_pdf_text(text: str) -> str:
	if not text:
		return ""
	# Strip non-printable PUA font symbols (e.g. \uf072, \uf020) and control codes
	text = re.sub(r"[\uE000-\uF8FF\uFFF0-\uFFFF]", "", text)
	# Fix hyphenated words broken across lines: e.g., "tem-\nperature" -> "temperature"
	text = re.sub(r"(\w+)-\n(\w+)", r"\1\2", text)
	# Normalize spaces and multi-lines
	text = re.sub(r"[ \t]+", " ", text)
	text = re.sub(r"\n{3,}", "\n\n", text)
	return text.strip()


import json
import fitz

from rag.config import (
	CHUNK_OVERLAP,
	CHUNK_SIZE,
	DATA_DIR,
	EMBEDDING_MODEL,
	EXTRACTED_IMAGES_DIR,
	PROJECT_ROOT,
	VECTOR_STORE_DIR,
)


def load_pdf_documents(pdf_files: list[Path]) -> list[Document]:
	documents: list[Document] = []
	EXTRACTED_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

	for pdf_path in pdf_files:
		relative_source = pdf_path.relative_to(PROJECT_ROOT).as_posix()
		try:
			pages = PyPDFLoader(str(pdf_path)).load()
		except Exception as exc:
			logger.warning("Skipping unreadable PDF %s: %s", relative_source, exc)
			continue

		# Open with PyMuPDF for image extraction
		fitz_doc = None
		try:
			fitz_doc = fitz.open(str(pdf_path))
		except Exception as exc:
			logger.warning("Could not open %s with PyMuPDF for image extraction: %s", relative_source, exc)

		pdf_slug = re.sub(r"[^a-zA-Z0-9_-]", "_", pdf_path.stem)
		pdf_image_dir = EXTRACTED_IMAGES_DIR / pdf_slug
		pdf_image_dir.mkdir(parents=True, exist_ok=True)

		for page_idx, page in enumerate(pages):
			raw_text = (page.page_content or "").strip()
			text = _clean_pdf_text(raw_text)
			if not text:
				continue

			page.page_content = text
			page.metadata["source"] = relative_source
			page.metadata["file_name"] = pdf_path.name

			# Extract images from this page if fitz_doc is open
			extracted_urls = []
			if fitz_doc and page_idx < len(fitz_doc):
				try:
					fitz_page = fitz_doc[page_idx]
					image_list = fitz_page.get_images(full=True)
					for img_idx, img_info in enumerate(image_list):
						xref = img_info[0]
						base_img = fitz_doc.extract_image(xref)
						img_bytes = base_img["image"]
						img_ext = base_img["ext"]
						width = base_img.get("width", 0)
						height = base_img.get("height", 0)

						# Ignore tiny icons/logos
						if width > 0 and height > 0 and (width < 90 or height < 90):
							continue

						img_filename = f"page_{page_idx + 1}_img_{img_idx + 1}.{img_ext}"
						img_save_path = pdf_image_dir / img_filename
						with open(img_save_path, "wb") as f:
							f.write(img_bytes)

						rel_url = f"/static/extracted_images/{pdf_slug}/{img_filename}"
						extracted_urls.append(rel_url)
				except Exception as exc:
					logger.debug("Failed extracting images from page %d of %s: %s", page_idx + 1, relative_source, exc)

			page.metadata["extracted_images"] = json.dumps(extracted_urls)
			documents.append(page)

		if fitz_doc:
			fitz_doc.close()

		logger.info("Loaded %s (%d pages with text)", relative_source, len(pages))

	return documents


def split_documents(documents: list[Document]) -> list[Document]:
	splitter = RecursiveCharacterTextSplitter(
		chunk_size=CHUNK_SIZE,
		chunk_overlap=CHUNK_OVERLAP,
		length_function=len,
		separators=["\n\n", "\n", ". ", " ", ""],
	)
	return splitter.split_documents(documents)


from functools import lru_cache

@lru_cache(maxsize=1)
def get_embeddings() -> HuggingFaceEmbeddings:
	try:
		import torch
		torch.set_num_threads(1)
		torch.set_num_interop_threads(1)
	except Exception:
		pass

	# Check if model is cached locally to avoid slow network checks
	import os
	cache_dir = Path(os.path.expanduser("~/.cache/huggingface/hub"))
	model_slug = "models--" + EMBEDDING_MODEL.replace("/", "--")
	is_cached = (cache_dir / model_slug).exists()

	model_kwargs = {"device": "cpu"}
	if is_cached:
		model_kwargs["local_files_only"] = True

	return HuggingFaceEmbeddings(
		model_name=EMBEDDING_MODEL,
		model_kwargs=model_kwargs,
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

	try:
		from rag.pipeline import _load_vector_store
		_load_vector_store.cache_clear()
	except Exception:
		pass

	return vector_store


def ingest_single_pdf(
	pdf_path: Path,
	output_dir: Path | None = None,
) -> dict:
	if not pdf_path.exists():
		raise FileNotFoundError(f"PDF file not found: {pdf_path}")

	documents = load_pdf_documents([pdf_path])
	if not documents:
		raise RuntimeError(f"No readable text extracted from {pdf_path.name}")

	chunks = split_documents(documents)
	if not chunks:
		raise RuntimeError(f"Could not generate text chunks from {pdf_path.name}")

	target_dir = output_dir or VECTOR_STORE_DIR
	target_dir.mkdir(parents=True, exist_ok=True)

	try:
		embeddings = get_embeddings()
		index_file = target_dir / "index.faiss"
		if index_file.exists():
			vector_store = FAISS.load_local(
				str(target_dir),
				embeddings,
				allow_dangerous_deserialization=True,
			)
			vector_store.add_documents(chunks)
		else:
			vector_store = FAISS.from_documents(chunks, embeddings)

		vector_store.save_local(str(target_dir))
		logger.info("Successfully ingested %s: %d pages, %d chunks", pdf_path.name, len(documents), len(chunks))

		try:
			from rag.pipeline import _load_vector_store
			_load_vector_store.cache_clear()
		except Exception:
			pass

		return {
			"filename": pdf_path.name,
			"pages": len(documents),
			"chunks": len(chunks),
			"status": "success",
		}
	except Exception as exc:
		logger.warning("Embeddings or FAISS update failed for %s (%s). Text loaded.", pdf_path.name, exc)
		return {
			"filename": pdf_path.name,
			"pages": len(documents),
			"chunks": len(chunks),
			"status": "text_extracted",
			"warning": str(exc),
		}


def list_knowledge_documents(data_dir: Path | None = None) -> list[dict]:
	root = data_dir or DATA_DIR
	if not root.exists():
		return []

	pdf_files = sorted(root.rglob("*.pdf"))
	results = []
	for pdf in pdf_files:
		try:
			stat = pdf.stat()
			results.append({
				"filename": pdf.name,
				"size_bytes": stat.st_size,
				"size_mb": round(stat.st_size / (1024 * 1024), 2),
				"updated_at": int(stat.st_mtime),
				"relative_path": pdf.relative_to(PROJECT_ROOT).as_posix() if pdf.is_relative_to(PROJECT_ROOT) else pdf.name,
			})
		except Exception:
			continue
	return results

