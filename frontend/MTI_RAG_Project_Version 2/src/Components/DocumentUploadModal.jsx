import { useEffect, useState, useRef } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import { fetchKnowledgeDocuments, uploadPdfDocument, deleteKnowledgeDocument } from "../services/api";

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function UploadCloudIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"></polyline>
      <line x1="12" y1="12" x2="12" y2="21"></line>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
      <polyline points="16 16 12 12 8 16"></polyline>
    </svg>
  );
}

function PdfFileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
  );
}

function DocumentUploadModal({ open, onClose }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const fileInputRef = useRef(null);

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetchKnowledgeDocuments();
      if (res && res.documents) {
        setDocuments(res.documents);
      }
    } catch (err) {
      console.warn("Could not load knowledge documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadDocuments();
      setSuccessMessage("");
      setErrorMessage("");
      setSelectedFile(null);
      setUploading(false);
      setUploadProgress(0);
    }
  }, [open]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setErrorMessage("Please select a valid PDF file.");
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
      setSuccessMessage("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setErrorMessage("Only PDF (.pdf) files are supported.");
        return;
      }
      setSelectedFile(file);
      setErrorMessage("");
      setSuccessMessage("");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(15);
    setUploadStage("Uploading PDF to knowledge repository...");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const timer1 = setTimeout(() => {
        setUploadProgress(45);
        setUploadStage("Extracting text and high-resolution diagrams...");
      }, 1200);

      const timer2 = setTimeout(() => {
        setUploadProgress(75);
        setUploadStage("Computing semantic vector embeddings & updating FAISS...");
      }, 2800);

      const res = await uploadPdfDocument(selectedFile, (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 40) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      setUploadProgress(100);
      setUploadStage("✅ Knowledge Integrated Successfully!");
      setSuccessMessage(
        res?.message || `Successfully indexed '${selectedFile.name}' (${res?.data?.pages || 0} pages, ${res?.data?.chunks || 0} chunks).`
      );
      setSelectedFile(null);
      await loadDocuments();
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || "Failed to process and index PDF.";
      setErrorMessage(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    try {
      await deleteKnowledgeDocument(filename);
      setDocuments((prev) => prev.filter((d) => d.filename !== filename));
    } catch (err) {
      setErrorMessage(err?.response?.data?.detail || "Failed to remove document.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={uploading ? undefined : onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "16px",
          bgcolor: "background.paper",
          backgroundImage: "none",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          pt: 2.5,
          px: 3,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
              MTI Knowledge Library & Ingestion
            </Typography>
            <Chip label="RAG Vector Store" size="small" color="primary" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }} />
          </Box>
          <Typography variant="caption" color="text.secondary">
            Upload new meteorological manuals to automatically index them into the active assistant knowledge base.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={uploading} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pt: 1, borderBottom: "1px solid", borderColor: "divider" }}>
        <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} textColor="primary" indicatorColor="primary">
          <Tab label="Upload & Index PDF" sx={{ textTransform: "none", fontWeight: 650, fontSize: "0.85rem" }} />
          <Tab
            label={`Indexed Manuals (${documents.length})`}
            sx={{ textTransform: "none", fontWeight: 650, fontSize: "0.85rem" }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 3 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: "8px", fontSize: "0.835rem" }} onClose={() => setErrorMessage("")}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{ mb: 2.5, borderRadius: "8px", fontSize: "0.835rem", bgcolor: "rgba(34, 197, 94, 0.12)", color: "#15803d", fontWeight: 600 }}
            onClose={() => setSuccessMessage("")}
          >
            {successMessage}
          </Alert>
        )}

        {tabIndex === 0 && (
          <Box>
            {/* Dropzone */}
            <Paper
              variant="outlined"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
              sx={{
                p: 4,
                textAlign: "center",
                cursor: uploading ? "not-allowed" : "pointer",
                borderRadius: "12px",
                borderStyle: "dashed",
                borderWidth: 2,
                borderColor: isDragging ? "primary.main" : "divider",
                bgcolor: isDragging ? "rgba(37, 99, 235, 0.05)" : "action.hover",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  borderColor: uploading ? "divider" : "primary.main",
                  bgcolor: uploading ? "action.hover" : "rgba(37, 99, 235, 0.04)",
                },
              }}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,application/pdf"
                style={{ display: "none" }}
              />

              <Box sx={{ color: "primary.main", mb: 1.5, display: "flex", justifyContent: "center" }}>
                <UploadCloudIcon />
              </Box>

              <Typography variant="body1" sx={{ fontWeight: 650, fontSize: "0.925rem", color: "text.primary", mb: 0.5 }}>
                {selectedFile ? selectedFile.name : "Drag & Drop your MTI PDF manual here"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.775rem", display: "block" }}>
                {selectedFile
                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Click "Index Document" to apply RAG embeddings`
                  : "or browse files from your computer (Supports official IMD observation handbooks, radar guides, etc.)"}
              </Typography>
            </Paper>

            {/* Upload & Indexing Progress */}
            {uploading && (
              <Box sx={{ mt: 3, p: 2, borderRadius: "10px", bgcolor: "action.hover", border: "1px solid", borderColor: "divider" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.825rem", color: "text.primary" }}>
                    {uploadStage}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "primary.main" }}>
                    {uploadProgress}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 6, borderRadius: 3 }} />
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3 }}>
              <Button
                variant="outlined"
                onClick={onClose}
                disabled={uploading}
                sx={{ textTransform: "none", borderRadius: "8px", fontWeight: 600 }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <UploadCloudIcon />}
                sx={{
                  textTransform: "none",
                  borderRadius: "8px",
                  fontWeight: 650,
                  px: 2.5,
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 2px 8px rgba(37, 99, 235, 0.25)",
                }}
              >
                {uploading ? "Indexing RAG..." : "Index into Knowledge Base"}
              </Button>
            </Box>
          </Box>
        )}

        {tabIndex === 1 && (
          <Box>
            {loadingDocs ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : documents.length === 0 ? (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  No documents found in knowledge repository. Upload a PDF manual to start indexing.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {documents.map((doc, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{
                      p: 1.75,
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderColor: "divider",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                      <PdfFileIcon />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.85rem" }} noWrap>
                          {doc.filename}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.725rem" }}>
                          {doc.size_mb} MB {doc.updated_at ? `• Modified: ${new Date(doc.updated_at * 1000).toLocaleDateString()}` : ""}
                        </Typography>
                      </Box>
                    </Box>

                    <Tooltip title="Remove document & rebuild index" placement="left">
                      <IconButton size="small" onClick={() => handleDelete(doc.filename)} sx={{ color: "text.secondary", "&:hover": { color: "#ef4444" } }}>
                        <TrashIcon />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default DocumentUploadModal;
