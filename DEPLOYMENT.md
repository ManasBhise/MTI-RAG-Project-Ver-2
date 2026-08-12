# 🚀 MTI Knowledge Assistant - Production Deployment Guide (IMD Physical Server)

This guide explains how to deploy the **MTI Knowledge Assistant (Version 2)** onto India Meteorological Department (IMD) on-premise physical servers running an existing **LAMP (Linux, Apache, MySQL, PHP)** stack.

---

## 🏛️ Architecture Overview

The MTI Assistant runs inside isolated **Docker containers** alongside the existing LAMP applications. The host server's **Apache HTTP Server** routes incoming user traffic via a **Reverse Proxy** to the containers.

```
                   [ Internet / IMD Forecasters ]
                                 │
                                 ▼
                     HTTPS Port 443 (SSL/TLS)
                                 │
                  ┌──────────────┴──────────────┐
                  │  IMD Physical Linux Server  │
                  │  (Host Apache Web Server)   │
                  └──────────────┬──────────────┘
                                 │
       ┌─────────────────────────┴─────────────────────────┐
       │                                                   │
  [ ProxyPass ]                                    [ Local Filesystem ]
       │                                                   │
       ▼                                                   ▼
┌───────────────────────────────┐               ┌─────────────────────┐
│  Docker Stack (Bridge Network)│               │ Existing LAMP Site  │
│                               │               │ (PHP, MySQL, etc.)  │
│ ┌───────────────────────────┐ │               └─────────────────────┘
│ │ Frontend (Nginx Container)│ │
│ │ Port 3000 -> 80           │ │
│ └─────────────┬─────────────┘ │
│               │ (Internal)    │
│ ┌─────────────▼─────────────┐ │
│ │ Backend (FastAPI + RAG)   │ │
│ │ Port 8000                 │ │
│ └─────────────┬─────────────┘ │
│               │               │
│ ┌─────────────▼─────────────┐ │
│ │ FAISS Index & SQLite DB   │ │
│ │ (Mounted Host Volumes)    │ │
│ └───────────────────────────┘ │
└───────────────────────────────┘
```

---

## 📋 Prerequisites on IMD Server

1. **Operating System**: Linux (Ubuntu 20.04/22.04 LTS, RHEL 8/9, CentOS 8/9, Rocky Linux).
2. **Docker & Docker Compose**:
   - Install Docker Engine:
     ```bash
     # Ubuntu / Debian
     sudo apt-get update
     sudo apt-get install -y docker.io docker-compose-v2

     # RHEL / CentOS / Rocky Linux
     sudo yum install -y docker-ce docker-compose-plugin
     ```
   - Enable & start Docker service:
     ```bash
     sudo systemctl enable docker
     sudo systemctl start docker
     ```
3. **Outbound Network Whitelist**:
   - The server must allow outbound HTTPS (Port 443) traffic to:
     - `api.groq.com` (Groq API)
     - `generativelanguage.googleapis.com` (Google Gemini API)

---

## 🛠️ Step 1: Transfer Project Files to Server

1. Copy the project folder to the server (e.g., via SCP, SFTP, or Git):
   ```bash
   scp -r MTI-RAG-Project-Ver-2 user@imd-server-ip:/opt/mti-assistant
   ```

2. Navigate to the deployment directory:
   ```bash
   cd /opt/mti-assistant
   ```

---

## ⚙️ Step 2: Configure Environment Variables

Create or edit `backend/.env`:
```env
# Application Security
JWT_SECRET_KEY=generate_a_secure_random_string_here
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Database (SQLite by default, or connect to MySQL)
DATABASE_URL=sqlite:///./mti_assistant.db

# LLM Providers (Multi-provider dynamic cascade)
PRIMARY_LLM_PROVIDER=gemini
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

OPENAI_API_KEY=optional_openai_key

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id_if_applicable

# RAG Settings
RAG_DATA_DIR=/app/data
RAG_VECTOR_STORE_DIR=/app/rag/store
```

---

## 🚀 Step 3: Build & Start Docker Containers

1. Build and start both containers in detached mode:
   ```bash
   docker compose up --build -d
   ```

2. Verify that containers are running and healthy:
   ```bash
   docker compose ps
   ```

3. Check logs to ensure vector store and backend initialized:
   ```bash
   docker compose logs -f backend
   ```

4. Test local container response on the server:
   ```bash
   curl http://localhost:8000/health
   # Expected output: {"status":"ok"}
   ```

---

## 🌐 Step 4: Configure Apache Reverse Proxy

The IMD System Administrator should configure Apache to route web requests to the Docker container.

### 1. Enable Required Apache Modules
```bash
# Ubuntu / Debian
sudo a2enmod proxy proxy_http proxy_wstunnel headers rewrite ssl
sudo systemctl restart apache2

# RHEL / CentOS (Modules are usually built-in, ensure mod_proxy is enabled in httpd.conf)
sudo systemctl restart httpd
```

### 2. Add Apache Site Configuration

Copy the template from `deploy/apache-imd-reverse-proxy.conf`:

```apache
<VirtualHost *:443>
    ServerName assistant.imd.gov.in

    # SSL Certificates
    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/imd_ssl.crt
    SSLCertificateKeyFile /etc/ssl/private/imd_ssl.key

    # Reverse Proxy to MTI Docker Frontend (Port 3000)
    ProxyPreserveHost On
    ProxyRequests Off

    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    # Forward headers
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"

    ErrorLog ${APACHE_LOG_DIR}/mti_assistant_error.log
    CustomLog ${APACHE_LOG_DIR}/mti_assistant_access.log combined
</VirtualHost>
```

### 3. Reload Apache
```bash
# Ubuntu / Debian
sudo a2ensite mti-assistant.conf
sudo systemctl reload apache2

# RHEL / CentOS
sudo systemctl reload httpd
```

---

## 🔄 Step 5: Updating / Ingesting New Training PDFs

Whenever IMD uploads new training notes or syllabus PDFs:

1. Place new PDF files in `./data/`.
2. Re-run the ingestion pipeline inside the running backend container:
   ```bash
   docker compose exec backend python -m rag.build_index
   ```
3. The index will update in `./rag/store/` without needing a container restart.

---

## 🛠️ Management & Maintenance Commands

| Action | Command |
| :--- | :--- |
| **Start services** | `docker compose up -d` |
| **Stop services** | `docker compose down` |
| **Restart services** | `docker compose restart` |
| **View real-time logs** | `docker compose logs -f` |
| **Check container health** | `docker compose ps` |
| **Rebuild after code changes** | `docker compose up --build -d` |
| **Backup SQLite database** | `cp mti_assistant.db mti_assistant_backup_$(date +%F).db` |
| **Backup FAISS Vector Store** | `tar -czvf vector_store_backup_$(date +%F).tar.gz rag/store/` |
