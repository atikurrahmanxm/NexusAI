# 🛡️ NexusAI — Autonomous Cybersecurity & ML Anomaly Intelligence Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Orchestrated-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**NexusAI** is an enterprise-grade SecOps intelligence platform engineered to bridge the gap between **Cybersecurity Telemetry**, **Data Science / Analytics**, and **Machine Learning Outlier Detection**. It processes security event streams, visualizes attack vectors across global geospatials, flags anomalies via statistical Z-score algorithms, and provides actionable incident containment via an integrated AI SecOps Copilot.

---

## 🚀 Key Architectural Pillars

- 🔍 **Real-Time Threat Telemetry**: Streaming security event parser for Auth, Nginx, Apache, and Firewall logs.
- 📊 **Data Science & Visualization**: High-fidelity dual-axis time-series charts, threat distribution heatmaps, and severity gauges.
- 🌍 **Global Threat Geo-Radar**: Interactive world map projecting inbound attack vector trajectories from foreign subnets to protected clusters.
- 🧠 **ML Anomaly Detection**: Statistical Z-Score ($Z = \frac{X - \mu}{\sigma}$) and IQR outlier detection engine with interactive sensitivity threshold controls.
- 🤖 **AI SecOps Copilot**: Autonomous threat synthesis, MITRE ATT&CK mapping (T1499, T1190, T1110), and automated containment triggers.
- 🛡️ **Automated Security Policy Compiler**: Generates executable `iptables`, Ubuntu `UFW`, `Cloudflare WAF`, `AWS NACL` (JSON), and `Nginx` blocklists.
- 📑 **Executive Audit Dossier**: Printable white-paper PDF threat intelligence reports with compliance ratings and cryptographic sign-offs.
- 🐳 **Cloud-Native Containerization**: Multi-stage Docker builds and `docker-compose` orchestration for production deployment.

---

## 🗺️ Engineering Roadmap

- [x] **Milestone 1**: Core architecture scaffolding, cyberpunk design system & responsive layout.
- [x] **Milestone 2**: Telemetry domain models, executive KPI cards & interactive attack simulation engine.
- [x] **Milestone 3**: Dual-axis Recharts time-series telemetry & categorical vector distribution analytics.
- [x] **Milestone 4**: Parametric ML Z-score outlier detection algorithm with interactive sensitivity slider.
- [x] **Milestone 5**: AI SecOps Copilot assistant with MITRE ATT&CK integration and bidirectional node isolation.
- [x] **Milestone 6**: Forensic Deep Packet Investigation table with multi-field search and CSV audit exporter.
- [x] **Milestone 7**: Python 3.10 FastAPI backend microservice with Scikit-Learn outlier inference pipeline.
- [x] **Milestone 8**: Real dataset parser supporting raw Nginx, Apache & Linux SSH auth logs with scenario presets.
- [x] **Milestone 9**: Interactive Global Cyber Threat Radar with geospatial trajectory laser arcs & country leaderboard.
- [x] **Milestone 10**: Automated firewall policy compiler for `iptables`, `UFW`, `Cloudflare WAF`, and `AWS NACL`.
- [x] **Milestone 11**: Executive threat intelligence audit dossier generator with print-ready PDF styling.
- [x] **Milestone 12**: Multi-service Docker containerization (`Dockerfile`, `nginx.conf`, `docker-compose.yml`).
- [x] **Milestone 13**: SecOps Chaos Lab simulation range and localStorage state persistence.
- [x] **Milestone 14**: Cloud deployment configs (Vercel, Netlify) & GitHub Actions automated CI/CD pipeline.

---

## 🛠️ Getting Started

### Option A: Run with Docker Compose (Recommended)
```bash
# Clone the repository
git clone https://github.com/atikurrahmanxm/NexusAI.git
cd NexusAI

# Spin up both Frontend (Nginx) and Backend (Python FastAPI)
docker compose up -d --build
```
Access the dashboard at `http://localhost:3000` and API docs at `http://localhost:8000/docs`.

### Option B: Local Development
```bash
# 1. Install frontend dependencies
npm install

# 2. Run local development server
npm run dev

# 3. (Optional) Run Python FastAPI Backend
cd backend
pip install -r requirements.txt
python main.py
```

---

## 📜 License
Distributed under the MIT License. Built with ❤️ by Atikur Rahman.
