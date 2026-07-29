# DevOps & Infrastructure Architecture

## 1. Cloud Provider & IaC
*   **Provider:** AWS (Region: `ap-south-1` Mumbai) for data residency compliance.
*   **Infrastructure as Code (IaC):** Terraform to manage and version control all cloud resources, ensuring reproducible environments (Dev, Staging, Prod).

## 2. Core Infrastructure Components
*   **Frontend (Next.js Web & Admin):** 
    *   Deployed via Vercel (preferred for Next.js optimizations) or AWS ECS/Fargate (for complete network isolation).
    *   CDN: Cloudflare for edge caching, WAF, and DDoS mitigation.
*   **Backend (NestJS API):** 
    *   Containerized using Docker.
    *   Orchestration: AWS ECS (Elastic Container Service) with AWS Fargate for serverless container execution. Auto-scaling based on CPU and memory utilization.
*   **Databases:**
    *   **Relational:** AWS RDS (PostgreSQL) - Multi-AZ deployment for high availability.
    *   **Vector DB:** Qdrant Cloud or Pinecone (GCP/AWS integration) for RAG embeddings.
    *   **Caching & Queue:** Amazon ElastiCache (Redis) for session management, semantic caching, rate limiting, and BullMQ background jobs.
*   **Storage:** Amazon S3 for storing consultant KYC documents, PDF exports, and RAG `.gov.in` raw HTML/PDF dumps.

## 3. CI/CD Pipeline (GitHub Actions)
1.  **PR Checks:** Linting (ESLint), Type Checking (tsc), Unit Tests (Jest), CodeQL (Security).
2.  **Build:** Turborepo handles cached, parallel builds for affected micro-apps.
3.  **Preview:** Automatic ephemeral preview environments for web/admin apps on Pull Requests.
4.  **Deploy:** On merge to `main`, Docker images are built, pushed to AWS ECR, and an ECS rolling update is triggered via Terraform/AWS CLI.

## 4. Observability & Monitoring
*   **Logs:** Datadog or ELK Stack (Elasticsearch, Logstash, Kibana) for centralized structured logging.
*   **Metrics:** Prometheus & Grafana to monitor ECS cluster health, Redis hit rates, and Vector DB query latencies.
*   **Tracing:** OpenTelemetry integrated into NestJS to trace requests through the API, PostgreSQL, and external LLM calls.
*   **Alerting:** PagerDuty / Slack integrations for anomaly detection (e.g., API error rates > 1%, LLM latency > 5s).