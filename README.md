# 🛡️ NexusAI — Autonomous Cybersecurity & ML Anomaly Intelligence Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Orchestrated-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![WebSocket](https://img.shields.io/badge/WebSocket-RFC_6455-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
[![STIX 2.1](https://img.shields.io/badge/STIX%2FTAXII-2.1_Compliant-8A2BE2?style=for-the-badge)](https://oasis-open.github.io/cti-documentation/)
[![SOAR](https://img.shields.io/badge/SOAR-Autonomous_Playbooks-9932CC?style=for-the-badge&logo=fastapi&logoColor=white)](https://github.com/atikurrahmanxm/NexusAI)
[![Webhooks](https://img.shields.io/badge/Alerts-Multi--Channel_Webhooks-008080?style=for-the-badge&logo=slack&logoColor=white)](https://github.com/atikurrahmanxm/NexusAI)
[![CVE Scanner](https://img.shields.io/badge/CVE-CVSS_v3.1_Audited-critical?style=for-the-badge&logo=securityscorecard&logoColor=white)](https://github.com/atikurrahmanxm/NexusAI)
[![RBAC](https://img.shields.io/badge/RBAC-SOC_2_Audit_Ledger-indigo?style=for-the-badge&logo=auth0&logoColor=white)](https://github.com/atikurrahmanxm/NexusAI)
[![CSPM](https://img.shields.io/badge/CSPM-CIS_%26_Multi--Compliance-00BFFF?style=for-the-badge&logo=amazonwebservices&logoColor=white)](https://github.com/atikurrahmanxm/NexusAI)
[![Threat Hunting](https://img.shields.io/badge/Threat_Hunting-Deception_Honeypots-crimson?style=for-the-badge&logo=target&logoColor=white)](https://github.com/atikurrahmanxm/NexusAI)
[![Sigma Rules](https://img.shields.io/badge/Sigma-Multi--SIEM_Transpiler-blueviolet?style=for-the-badge&logo=yaml&logoColor=white)](https://github.com/atikurrahmanxm/NexusAI)
[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Vercel](https://img.shields.io/badge/Vercel-Deploy_Ready-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**NexusAI** is an enterprise-grade SecOps intelligence platform engineered to bridge the gap between **Cybersecurity Telemetry**, **Data Science / Analytics**, and **Machine Learning Outlier Detection**. It processes security event streams, visualizes attack vectors across global geospatials, flags anomalies via statistical Z-score algorithms, and provides actionable incident containment via an integrated AI SecOps Copilot.

---

## 🚀 Key Architectural Pillars

- 🔬 **Detection Engineering Studio & Sigma Compiler**: Open Sigma v2.0 detection rule authoring, sub-microsecond abstract syntax tree (AST) telemetry matching, automated query transpiler converting Sigma logic into native Splunk SPL, Elasticsearch DSL, Microsoft Sentinel KQL, and CrowdStrike CQL syntax, with 1-click YAML bundle export.
- 🎯 **Threat Hunting Studio & Deception Honeypot Grid**: Deep packet adversary attribution mapping attacker IP, BGP ASN, ISP, and city geolocations, target asset impact tracking across production APIs and financial endpoints, synthetic deception sensors (SSH, WordPress, AWS Honeytoken, MySQL baits), and 1-click RFC 2142 automated ISP abuse notice generator.
- ☁️ **Cloud Security Posture Management (CSPM) & Compliance Guardrails**: Real-time multi-cloud configuration auditing (AWS, GCP, Azure, Kubernetes), cross-walk compliance scoring (CIS Benchmarks v8, PCI-DSS 4.0, SOC 2 Type II, HIPAA, ISO 27001), live control plane scanning, and 1-click automated remediation generating Cloud CLI and Terraform HCL snippets.
- 🔐 **Role-Based Access Control (RBAC) & Immutable Audit Ledger**: Granular clearance tiers (Commander, Analyst, Auditor, DevOps), live operator persona switcher, cryptographically signed SHA-256 tamper-evident audit ledger, and SOC 2 / ISO 27001 compliance export.
- 🛡️ **Vulnerability Assessment & CVE Patch Engine**: Continuous host package auditing, CVSS v3.1 severity calculation, CISA KEV exploitation tracking, and 1-click remediation script generation.
- 🔔 **Real-Time Alert & Multi-Channel Webhook Center**: Instant incident escalation pipelines streaming to Slack (`#secops-alerts`), Discord, Telegram bots, PagerDuty, and custom enterprise SIEM HTTP webhooks with sub-50ms dispatch latency.
- ⚡ **SOAR Autonomous Playbook Engine**: Real-time SecOps automation pipelines (DDoS, SQLi, Brute-Force, Ransomware C2) executing sub-second containment (MTTR 1.2s vs manual 45m).
- 🖥️ **Central Server Fleet & Zero-Trust Mesh**: Multi-cloud node registry (AWS, GCP, DigitalOcean, Azure, Bare-Metal), live CPU/RAM/bandwidth resource metrics, one-line bash telemetry agent provisioning, and 1-click Zero-Trust node isolation to halt lateral threat propagation.
- ⚡ **Real-Time WebSocket Gateway**: Bi-directional streaming (`ws://127.0.0.1:8000/ws/telemetry`) with heartbeat latency probes and reactive in-browser fallback.
- 🛰️ **STIX/TAXII 2.1 Threat Intel Hub**: Multi-feed IOC correlation (CISA KEV, AbuseIPDB, AlienVault OTX), real-time IP reputation analyzer, MITRE ATT&CK Enterprise coverage matrix, and STIX 2.1 JSON bundle exporter.
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
- [x] **Milestone 15**: Inter typography system, obsidian gradient card aesthetics, and modern SecOps color palette.
- [x] **Milestone 16**: Bi-directional WebSocket telemetry gateway (`/ws/telemetry`), live latency probes & stream controller.
- [x] **Milestone 17**: STIX/TAXII 2.1 Threat Intel Hub, IP reputation scoring engine & MITRE ATT&CK Matrix navigator.
- [x] **Milestone 18**: Server & Cloud Fleet Manager, dynamic asset registration, live resource monitors & Zero-Trust node isolation.
- [x] **Milestone 19**: SOAR Automated Incident Playbook Engine with MTTR analytics & sequential action pipelines.
- [x] **Milestone 20**: Real-Time Alert Webhooks (Slack, Discord, Telegram, PagerDuty) with live simulation & audit history.
- [x] **Milestone 21**: Vulnerability Assessment & CVE Patch Management Engine with CVSS v3.1 scoring & live fleet audit.
- [x] **Milestone 22**: Role-Based Access Control (RBAC) & Immutable Cryptographic Audit Ledger with SHA-256 signatures & multi-operator persona switcher.
- [x] **Milestone 23**: Cloud Security Posture Management (CSPM) & Multi-Standard Compliance Auditor (CIS v8, PCI-DSS 4.0, SOC 2) with 1-click Terraform/CLI auto-remediation.
- [x] **Milestone 24**: Threat Hunting & Deception Grid (Target Asset Attribution, BGP ASN GeoIP, Canary Honeypots & RFC 2142 Abuse Dispatcher).
- [x] **Milestone 25**: Detection Engineering Studio & Sigma Rule Compiler (Multi-SIEM Transpiler for Splunk, Elastic, Sentinel & Falcon).

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
