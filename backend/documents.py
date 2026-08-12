import logging
import os
import re
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from rag.config import DATA_DIR
from rag.ingest import ingest_single_pdf, list_knowledge_documents, build_vector_store

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])


def _sanitize_filename(filename: str) -> str:
	name = re.sub(r"[^\w\s.-]", "", filename).strip()
	return name.replace(" ", "_")


@router.get("", response_model=dict)
def get_documents():
	"""
	Returns a list of all indexed PDF documents in the MTI Knowledge Base.
	"""
	try:
		docs = list_knowledge_documents(DATA_DIR)
		return {"status": "success", "total": len(docs), "documents": docs}
	except Exception as exc:
		logger.error("Failed to list knowledge documents: %s", exc)
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Unable to list documents: {str(exc)}",
		)


@router.post("/upload", response_model=dict)
async def upload_document(file: UploadFile = File(...)):
	"""
	Uploads a new meteorological PDF manual, extracts text/diagrams,
	computes semantic vector embeddings, and immediately indexes it into the live RAG store.
	"""
	if not file.filename or not file.filename.lower().endswith(".pdf"):
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Only PDF (.pdf) documents are supported.",
		)

	DATA_DIR.mkdir(parents=True, exist_ok=True)
	safe_filename = _sanitize_filename(file.filename)
	destination_path = DATA_DIR / safe_filename

	try:
		content = await file.read()
		if len(content) == 0:
			raise HTTPException(
				status_code=status.HTTP_400_BAD_REQUEST,
				detail="Uploaded file is empty.",
			)

		with open(destination_path, "wb") as f:
			f.write(content)

		logger.info("Saved uploaded PDF to %s (%d bytes)", destination_path, len(content))

		# Automatically apply RAG ingestion and update vector store
		ingest_result = ingest_single_pdf(destination_path)

		return {
			"status": "success",
			"message": f"Successfully processed and indexed '{safe_filename}' into MTI Knowledge Assistant.",
			"data": ingest_result,
		}
	except HTTPException:
		raise
	except Exception as exc:
		logger.error("Failed ingesting uploaded PDF %s: %s", safe_filename, exc, exc_info=True)
		# Clean up corrupt file if failed
		if destination_path.exists():
			try:
				destination_path.unlink()
			except Exception:
				pass
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to process and index PDF: {str(exc)}",
		)


@router.delete("/{filename}", response_model=dict)
def delete_document(filename: str):
	"""
	Deletes a PDF manual from the knowledge base and rebuilds the vector index.
	"""
	safe_name = _sanitize_filename(filename)
	target_file = DATA_DIR / safe_name

	if not target_file.exists():
		raise HTTPException(
			status_code=status.HTTP_404_NOT_FOUND,
			detail=f"Document '{safe_name}' not found.",
		)

	try:
		target_file.unlink()
		logger.info("Deleted document %s", target_file)

		# Rebuild index with remaining documents if any
		remaining_docs = list_knowledge_documents(DATA_DIR)
		if remaining_docs:
			try:
				build_vector_store(DATA_DIR)
			except Exception as exc:
				logger.warning("Could not automatically rebuild index after delete: %s", exc)

		return {
			"status": "success",
			"message": f"Document '{safe_name}' removed from MTI Knowledge Base.",
			"remaining_documents": len(remaining_docs),
		}
	except Exception as exc:
		logger.error("Failed to delete document %s: %s", safe_name, exc)
		raise HTTPException(
			status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
			detail=f"Failed to delete document: {str(exc)}",
		)
