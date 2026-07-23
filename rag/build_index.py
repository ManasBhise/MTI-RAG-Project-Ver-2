"""Build the FAISS vector index from PDFs in the data/ folder.

Usage:
    python -m rag.build_index
"""

import logging
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
	sys.path.insert(0, str(PROJECT_ROOT))

from rag.ingest import build_vector_store  # noqa: E402


def main() -> None:
	logging.basicConfig(
		level=logging.INFO,
		format="%(asctime)s | %(levelname)s | %(message)s",
	)

	build_vector_store()
	print("RAG index build completed successfully.")


if __name__ == "__main__":
	main()
