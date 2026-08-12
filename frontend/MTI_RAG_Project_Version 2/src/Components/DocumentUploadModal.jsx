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
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function UploadCloudIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"></polyline>
      <line x1="12" y1="12" x2="12" y2="21"></line>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
      <polyline points="16 16 12 12 8 16"></polyline>
    </svg>
  );
}

function PdfFileIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
    } catch {
      // Ignored
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadDocuments();
      setSelectedFile(null);
      setErrorMessage("");
      setSuccessMessage("");
      setUploadProgress(0);
    }
  }, [open]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
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
    setUploadStage("Uploading PDF...");
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const timer1 = setTimeout(() => {
        setUploadProgress(45);
        setUploadStage("Extracting text and charts...");
      }, 1200);

      const timer2 = setTimeout(() => {
        setUploadProgress(75);
        setUploadStage("Computing vector embeddings...");
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "14px",
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
          pt: 1.75,
          px: 2.25,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
              MTI Knowledge Library & Ingestion
            </Typography>
            <Chip label="RAG Vector Store" size="small" color="primary" sx={{ height: 17, fontSize: "0.575rem", fontWeight: 700 }} />
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6875rem" }}>
            Upload new meteorological manuals to automatically index them into the active assistant knowledge base.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" disabled={uploading} sx={{ color: "text.secondary", p: 0.4 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 2.25, pt: 0.5, borderBottom: "1px solid", borderColor: "divider" }}>
        <Tabs value={tabIndex} onChange={(_, val) => setTabIndex(val)} textColor="primary" indicatorColor="primary">
          <Tab label="Upload & Index PDF" sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", minHeight: 36, py: 0.5 }} />
          <Tab
            label={`Indexed Manuals (${documents.length})`}
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.75rem", minHeight: 36, py: 0.5 }}
          />
        </Tabs>
      </Box>

      <DialogContent sx={{ p: 2.25 }}>
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "6px", fontSize: "0.75rem", py: 0.5 }} onClose={() => setErrorMessage("")}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert
            severity="success"
            icon={<CheckCircleIcon />}
            sx={{ mb: 2, borderRadius: "6px", fontSize: "0.75rem", py: 0.5, bgcolor: "rgba(34, 197, 94, 0.1)", color: "#15803d", fontWeight: 600 }}
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
                p: 3,
                textAlign: "center",
                cursor: uploading ? "not-allowed" : "pointer",
                borderRadius: "10px",
                borderStyle: "dashed",
                borderWidth: 1.5,
                borderColor: isDragging ? "primary.main" : "divider",
                bgcolor: isDragging ? "rgba(37, 99, 235, 0.05)" : "action.hover",
                transition: "all 0.15s ease-in-out",
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

              <Box sx={{ color: "primary.main", mb: 1, display: "flex", justifyContent: "center" }}>
                <UploadCloudIcon />
              </Box>

              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.825rem", color: "text.primary", mb: 0.25 }}>
                {selectedFile ? selectedFile.name : "Drag & Drop your MTI PDF manual here"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem", display: "block" }}>
                {selectedFile
                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for RAG embedding`
                  : "or browse PDF files from your device"}
              </Typography>
            </Paper>

            {/* Upload Progress */}
            {uploading && (
              <Box sx={{ mt: 2, p: 1.5, borderRadius: "8px", bgcolor: "action.hover", border: "1px solid", borderColor: "divider" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.75rem", color: "text.primary" }}>
                    {uploadStage}
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.75rem", color: "primary.main" }}>
                    {uploadProgress}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 5, borderRadius: 2.5 }} />
              </Box>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 2.25 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={onClose}
                disabled={uploading}
                sx={{ textTransform: "none", borderRadius: "6px", fontWeight: 600, fontSize: "0.725rem", py: "3px", px: "10px" }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                sx={{
                  textTransform: "none",
                  borderRadius: "6px",
                  fontWeight: 650,
                  fontSize: "0.725rem",
                  py: "3px",
                  px: "12px",
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 1px 4px rgba(37, 99, 235, 0.2)",
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
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress size={22} />
              </Box>
            ) : documents.length === 0 ? (
              <Box sx={{ py: 3, textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                  No documents found in knowledge repository.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {documents.map((doc, idx) => (
                  <Paper
                    key={idx}
                    variant="outlined"
                    sx={{
                      p: 1.25,
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderColor: "divider",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                      <PdfFileIcon />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.785rem" }} noWrap>
                          {doc.filename}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.675rem" }}>
                          {doc.size_mb} MB {doc.updated_at ? `• ${new Date(doc.updated_at * 1000).toLocaleDateString()}` : ""}
                        </Typography>
                      </Box>
                    </Box>

                    <Tooltip title="Remove manual" placement="left">
                      <IconButton size="small" onClick={() => handleDelete(doc.filename)} sx={{ color: "text.secondary", p: 0.4, "&:hover": { color: "#ef4444" } }}>
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
