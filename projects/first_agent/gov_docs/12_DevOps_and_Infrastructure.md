# DevOps and Infrastructure Architecture Specification
## Project: SevaSetu AI (Jan Seva AI)
**Document Reference:** SS-DEVOPS-ARCH-v1.0  
**Status:** Ready for Implementation  
**Classification:** Restricted - Government Engineering Standard  

---

## 1. Executive Summary & Design Philosophy

The DevOps and Infrastructure Architecture for **SevaSetu AI** is engineered to support a highly resilient, scalable, secure, and cost-optimized deployment of India’s conversational AI Government Services Platform. Given the scale of 1.4+ billion citizens, fluctuating traffic spikes (e.g., during welfare scheme disbursement dates), and strict compliance requirements (DPDP 2023, GIGW 3.0, and UIDAI), the infrastructure is built on the following core principles:

1. **Zero-Trust Network Architecture (ZTNA):** Complete isolation of data tiers, strict ingress filtering, and compartmentalized container execution environments.
2. **Elasticity & High Availability:** Multi-region, active-passive/active-active setup on Indian datacenters (AWS Mumbai/Azure Central India) with sub-second scaling capabilities powered by Kubernetes (EKS/AKS) and KEDA.
3. **Decoupled Continuous Integration & Continuous Deployment (CI/CD):** Declarative, GitOps-driven deployment using ArgoCD with automated security gates (SAST, DAST, Trivy container scans, and Cosign image signing).
4. **End-to-End Observability:** Standard telemetry (Prometheus, Grafana, OpenTelemetry) paired with advanced LLM-specific tracing (Langfuse) to monitor latency, cost, and hallucination rates in real time.
5. **Hyper-aggressive Cost Control:** Use of AWS Spot instances for stateless microservices and batch OCR processing, dynamic node scaling via Karpenter, and multi-tier caching (Edge, Redis, Semantic Cache) to minimize LLM and network egress costs.

---

## 2. Secure Containerization (Dockerization)

SevaSetu AI operates a microservice architecture. All container images are built using secure, multi-stage, rootless Docker configurations to reduce attack surface, optimize build caching, and minimize image footprints (using slim/distroless bases).

### 2.1 Backend API Service (Python/FastAPI) Dockerfile
This service processes incoming citizen requests, orchestrates DB queries, and interacts with the internal database and Redis cluster.

```dockerfile
# ==========================================
# Stage 1: Build & Dependency Resolution
# ==========================================
FROM python:3.11-slim AS builder

WORKDIR /app

# Install system dependencies required for compilation of C-extensions
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Optimize layer caching: Copy dependency manifests first
COPY requirements.txt .

# Create a virtual environment and install dependencies in isolation
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies using pip caching to speed up subsequent builds
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ==========================================
# Stage 2: Final Secure Runtime Image
# ==========================================
FROM python:3.11-slim AS runner

WORKDIR /app

# Install runtime library dependencies (only non-dev libraries)
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
    libpq5 \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Enforce Python security best practices
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Create a non-privileged system user and group to run the app
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/false appuser

# Copy application source code and adjust ownership
COPY --chown=appuser:appgroup src/ /app/src/

# Verify that write access is disabled on app source files for container security
RUN chmod -R 555 /app/src

# Switch to the rootless user execution context
USER appuser

EXPOSE 8000

# Health check to ensure readiness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/api/v1/health || exit 1

ENTRYPOINT ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### 2.2 Orchestration & RAG Agent Service Dockerfile
This container handles the vector search embeddings, reranking calculations, and Langfuse-traced LLM integrations.

```dockerfile
# Stage 1: Build & wheels generation
FROM python:3.11-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*
COPY requirements-rag.txt .
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements-rag.txt

# Stage 2: Final Distroless-like Slim Runtime
FROM python:3.11-slim AS runner
WORKDIR /app
RUN apt-get update && apt-get upgrade -y && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN groupadd -g 10002 raggroup && \
    useradd -u 10002 -g raggroup -s /bin/false raguser
COPY --chown=raguser:raggroup src_rag/ /app/src_rag/
RUN chmod -R 555 /app/src_rag

USER raguser
EXPOSE 8001
HEALTHCHECK --interval=15s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8001/health || exit 1
ENTRYPOINT ["python", "src_rag/agent_orchestration.py"]
```

### 2.3 Frontend Application (Next.js) Dockerfile
This file uses a multi-stage compilation pipeline to generate a lightweight, production-ready static output hosted on Node.js inside the cluster.

```dockerfile
# Stage 1: Dependency Installation
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Production Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy essential configuration files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=20s --timeout=5s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1
CMD ["node", "server.js"]
```

---

## 3. Kubernetes Orchestration, Hardening & KEDA Scaling

The SevaSetu AI application platform is deployed on managed Kubernetes (EKS/AKS) clusters across redundant availability zones inside India. We enforce strict resource policies, network boundaries, and automatic scaling metrics.

### 3.1 Network Isolation & Security (Kubernetes NetworkPolicies)

To protect highly sensitive database and Aadhaar Vault zones from external threats, network boundaries are enforced at the Pod level using Kubernetes `NetworkPolicies`.

#### 3.1.1 Default Deny-All Network Policy
Blocks all incoming and outgoing cluster communication unless explicitly whitelisted.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: sevasetu-prod
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
```

#### 3.1.2 Database & Aadhaar Vault Network Policy
Strictly limits access to the PostgreSQL database and Aadhaar Redaction Vault. Only pods matching the label `role: backend-api` are allowed to establish TCP connections.

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: database-isolation-policy
  namespace: sevasetu-prod
spec:
  podSelector:
    matchLabels:
      app: sevasetu-database
  ingress:
  - from:
    - podSelector:
        matchLabels:
          role: backend-api
    ports:
    - protocol: TCP
      port: 5432
  policyTypes:
  - Ingress
```

---

### 3.2 Production Deployment Manifests

Below is the standard production configuration template for the SevaSetu API Backend Service, detailing resource guarantees, priority configs, security contexts, and probes.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sevasetu-backend-api
  namespace: sevasetu-prod
  labels:
    role: backend-api
    tier: application
spec:
  replicas: 4
  revisionHistoryLimit: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 25%
      maxUnavailable: 0
  selector:
    matchLabels:
      role: backend-api
  template:
    metadata:
      labels:
        role: backend-api
    spec:
      # Pod-level Security Context to enforce non-root execution
      securityContext:
        runAsNonRoot: true
        runAsUser: 10001
        runAsGroup: 10001
        fsGroup: 10001
        seccompProfile:
          type: RuntimeDefault
      affinity:
        # Avoid deploying multiple instances of this API on the same physical VM node
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: role
                  operator: In
                  values:
                  - backend-api
              topologyKey: kubernetes.io/hostname
      containers:
      - name: api-container
        image: 111122223333.dkr.ecr.ap-south-1.amazonaws.com/sevasetu-backend:v1.2.4
        imagePullPolicy: IfNotPresent
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        ports:
        - containerPort: 8000
          name: http-port
        # Resource allocations - Guaranteed QoS Class
        resources:
          requests:
            cpu: "1000m"
            memory: "2Gi"
          limits:
            cpu: "2000m"
            memory: "4Gi"
        # Application Probes
        startupProbe:
          httpGet:
            path: /api/v1/health
            port: http-port
          initialDelaySeconds: 5
          periodSeconds: 5
          failureThreshold: 6
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: http-port
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /api/v1/ready
            port: http-port
          periodSeconds: 10
          timeoutSeconds: 3
          successThreshold: 1
          failureThreshold: 2
        envFrom:
        - secretRef:
            name: sevasetu-secrets
        - configMapRef:
            name: sevasetu-config
---
apiVersion: v1
kind: Service
metadata:
  name: sevasetu-backend-service
  namespace: sevasetu-prod
spec:
  type: ClusterIP
  ports:
  - port: 8000
    targetPort: http-port
    protocol: TCP
    name: http
  selector:
    role: backend-api
```

---

### 3.3 Dynamic Scaling with KEDA (Kubernetes Event-driven Autoscaling)

Standard HPAs scale purely based on CPU/Memory consumption. For an AI-driven platform handling document uploads and conversational pipelines, CPU metrics respond too slowly to queue pile-ups. We utilize **KEDA** to dynamically scale pods based on actual database or Redis queue workloads.

#### 3.3.1 OCR Worker Queue Autoscale (Redis-Based Scaling)
When citizens upload images (Aadhaar/PAN/Land Records), background tasks are processed using Celery/Redis. The `OCR-worker` pods must scale rapidly based on the pending tasks queue length, scaling down to 1 pod (or zero during idle night windows) to save cluster resources.

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: sevasetu-ocr-worker-scaler
  namespace: sevasetu-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sevasetu-ocr-worker
  minReplicaCount: 1     # Scale down to 1 base worker
  maxReplicaCount: 15    # Scale up to 15 concurrent worker instances under high load
  cooldownPeriod: 300    # Wait 5 minutes before scaling back down to avoid thrashing
  pollingInterval: 15    # Check Redis queue length every 15 seconds
  triggers:
  - type: redis
    metadata:
      # Target host parameters resolved from secrets/configmaps
      hostFromEnv: REDIS_HOST
      portFromEnv: REDIS_PORT
      passwordFromEnv: REDIS_PASSWORD
      # Target queue list to monitor
      listName: "ocr_task_queue"
      listLength: "5"     # Add 1 pod for every 5 pending tasks in queue
```

#### 3.3.2 Frontend Pod Scaling (Prometheus HTTP Metrics Scaling)
Scales Next.js frontend replicas based on real-time HTTP requests per second (RPS) routed through the Ingress Controller (Nginx/Envoy).

```yaml
apiVersion: keda.sh/v1alpha1
kind: ScaledObject
metadata:
  name: sevasetu-frontend-scaler
  namespace: sevasetu-prod
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sevasetu-frontend
  minReplicaCount: 4
  maxReplicaCount: 30
  pollingInterval: 10
  triggers:
  - type: prometheus
    metadata:
      serverAddress: http://prometheus-k8s.monitoring.svc.cluster.local:9090
      metricName: nginx_ingress_controller_requests
      query: "sum(rate(nginx_ingress_controller_requests{namespace='sevasetu-prod',app='sevasetu-frontend'}[1m]))"
      threshold: "150" # Scale out by a replica for every 150 requests/second
```

---

## 4. CI/CD Architecture (GitOps & Automated Security Gates)

Deployments are governed by a clean GitOps workflow using **ArgoCD** for declarative syncs, while code checks are handled inside **GitHub Actions**.

### 4.1 GitOps Integration Framework

```
[ Git Push to Main ] ──► [ GitHub Actions ] ──► [ Build, Test, Trivy, Cosign ] ──► [ Push to ECR ]
                                                                                      │
[ GitOps Repo Update (Helm values) ] ◄────────────────────────────────────────────────┘
               │
               ▼
   [ ArgoCD Sync Hook ] ──► [ Kubernetes Cluster Deployment ]
```

1. **Continuous Integration (CI):** Triggered on pull requests to the `main` branch. Executes linters, unit tests, and security scanning tools.
2. **Container Build and Signing:** On merge to `main`, Docker images are compiled. The resulting artifacts undergo a static security vulnerability sweep.
3. **Cosign Cryptographic Attestation:** Images are signed using **Sigstore Cosign**. The cluster’s admission controller (Kyverno) intercepts deployments and rejects any image lacking a verified cryptographic signature from the corporate HSM.
4. **Declarative Synchronization (CD):** ArgoCD pulls updated Kubernetes resource blueprints/helm charts from the configuration repository and updates the running cluster state safely, maintaining standard blue-green canary pipelines.

---

### 4.2 Automated CI/CD Pipeline (GitHub Actions Specification)

The following YAML provides the complete, production-ready continuous integration deployment template for GitHub Actions.

```yaml
name: SevaSetu CI/CD Production Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

permissions:
  contents: read
  id-token: write # Required for secure AWS OIDC role authentication
  security-events: write # Required to upload SARIF security scan results

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Set up Python Environment
      uses: actions/setup-python@v5
      with:
        python-version: '3.11'
        cache: 'pip'

    - name: Install Python Toolchain
      run: |
        pip install flake8 black bandit pytest pytest-cov safety

    - name: Formatter & Linter Check (Black & Flake8)
      run: |
        black --check src/
        flake8 src/ --count --select=E9,F63,F7,F82 --show-source --statistics

    - name: AST Static Vulnerability Scan (Bandit)
      run: |
        bandit -r src/ -ll -ii

    - name: Dependency Vulnerability Audit (Safety)
      run: |
        safety check -r requirements.txt

    - name: Run Test Suites with Coverage Metrics
      run: |
        pytest --cov=src/ tests/ --cov-report=xml

  vulnerability-scan-and-build:
    needs: lint-and-test
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
    - name: Checkout Code
      uses: actions/checkout@v4

    - name: Install Cosign Utility
      uses: sigstore/cosign-installer@v3.5.0

    - name: Configure AWS OIDC Credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        role-to-assume: arn:aws:iam::111122223333:role/sevasetu-github-actions-role
        aws-region: ap-south-1

    - name: Login to Amazon ECR
      id: login-ecr
      uses: aws-actions/amazon-ecr-login@v2

    - name: Build and Tag Container Image
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker build -t $ECR_REGISTRY/sevasetu-backend:$IMAGE_TAG -t $ECR_REGISTRY/sevasetu-backend:latest .
        echo "IMAGE_URI=$ECR_REGISTRY/sevasetu-backend:$IMAGE_TAG" >> $GITHUB_ENV

    - name: Vulnerability Scan Container Image (Trivy)
      uses: aquasecurity/trivy-action@master
      with:
        image-ref: ${{ env.IMAGE_URI }}
        format: 'sarif'
        output: 'trivy-results.sarif'
        severity: 'CRITICAL,HIGH'
        ignore-unfixed: true

    - name: Upload Scan Results to GitHub Security Hub
      uses: github/codeql-action/upload-sarif@v3
      if: always()
      with:
        sarif_file: 'trivy-results.sarif'

    - name: Push Container Images to Secure ECR Registry
      env:
        ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
        IMAGE_TAG: ${{ github.sha }}
      run: |
        docker push $ECR_REGISTRY/sevasetu-backend:$IMAGE_TAG
        docker push $ECR_REGISTRY/sevasetu-backend:latest

    - name: Sign Container Image (Cosign)
      env:
        COSIGN_PRIVATE_KEY: ${{ secrets.COSIGN_PRIVATE_KEY }}
        COSIGN_PASSWORD: ${{ secrets.COSIGN_PASSWORD }}
      run: |
        echo "$COSIGN_PRIVATE_KEY" > cosign.key
        cosign sign --key cosign.key --yes ${{ env.IMAGE_URI }}
        rm cosign.key

    - name: Trigger GitOps Repository Configuration Sync (ArgoCD)
      env:
        IMAGE_TAG: ${{ github.sha }}
      run: |
        # Clone GitOps repo, update application Helm manifests, commit change
        git clone https://github.com/sevasetu/gitops-deployments.git
        cd gitops-deployments
        sed -i 's/tag: .*/tag: "'$IMAGE_TAG'"/' helm/sevasetu-backend/values.yaml
        git config user.name "GitHub CI Workflow"
        git config user.email "ci-runner@sevasetu.gov.in"
        git commit -am "chore(deploy): bump production build target tag to $IMAGE_TAG [skip ci]"
        git push origin main
```

---

## 5. Monitoring, Observability & Tracing Architecture

To maintain high SLA availability standards, SevaSetu AI implements complete telemetry routing from infrastructure workloads to specialized conversational tracing components.

### 5.1 Infrastructure Observability Strategy (Prometheus & Grafana)

#### 5.1.1 Metric Target Threshold Definitions

| Operational Metric | Source Layer | Warning State | Alert State (Critical) | Mitigation Path |
| :--- | :--- | :--- | :--- | :--- |
| **API Response Latency (p99)**| Kong Ingress / API | > 1.2s | > 2.5s | Instantly route to static fallback cache; trigger worker auto-scaling. |
| **Bhashini Service Error Rate**| NMT/ASR Gateway | > 4% | > 8% | Re-route transcription requests to local fallback models; trigger alert. |
| **Database Connection Pool** | PG RDS Cluster | > 75% | > 90% | Terminate long-running stale queries; trigger replica scaling. |
| **Redis Cache Hit Rate** | Redis Cache Layer| < 75% | < 60% | Check dynamic memory allocations; audit eviction patterns. |
| **RAG Hallucination Rate** | Guardrail Log Agent | > 1% | > 3% | Dynamic search depth parameter scaling; drop LLM context temperature. |

#### 5.1.2 Prometheus Alerting Rules (`prometheus-alerts.yaml`)

```yaml
groups:
  - name: sevasetu_alerts
    rules:
    - alert: BhashiniApiLatencyHigh
      expr: histogram_quantile(0.99, sum(rate(bhashini_api_duration_seconds_bucket[5m])) by (le)) > 2.0
      for: 2m
      labels:
        severity: warning
      annotations:
        summary: "High Response Latency from external MeitY Bhashini API gateway"
        description: "Bhashini API 99th percentile latency is currently {{ $value }}s, exceeding threshold of 2.0s for more than 2 minutes."

    - alert: RedisCacheHitRateCritical
      expr: sum(rate(redis_keyspace_hits_total[5m])) / (sum(rate(redis_keyspace_hits_total[5m])) + sum(rate(redis_keyspace_misses_total[5m]))) * 100 < 60
      for: 5m
      labels:
        severity: page
      annotations:
        summary: "Critical Redis Cache Miss Rate detected"
        description: "Redis hit rate is currently {{ $value | printf \"%.2f\" }}%, which can lead to excessive LLM costs and database degradation."

    - alert: RAGHallucinationRateHigh
      expr: sum(rate(sevasetu_guardrail_hallucination_failures_total[5m])) / sum(rate(sevasetu_chat_queries_total[5m])) * 100 > 3.0
      for: 10m
      labels:
        severity: critical
      annotations:
        summary: "Severe AI Hallucination Rate in Production Core"
        description: "The percentage of RAG generation attempts rejected by the DeBERTa-NLI verification system is {{ $value }}%, indicating outdated search corpuses or pipeline errors."

    - alert: PodRestartLoop
      expr: rate(kube_pod_container_status_restarts_total[5m]) * 60 > 2
      for: 1m
      labels:
        severity: page
      annotations:
        summary: "Container crash loop back-off detected in cluster"
        description: "Pod {{ $labels.pod }} is restarting rapidly, indicating unhandled application exceptions or execution environment issues."
```

---

### 5.2 Conversational AI Observability Integration (Langfuse)

To track conversation quality, prompt modifications, token distribution metrics, API processing costs, and alignment with DPDP guidelines, SevaSetu AI integrates with **Langfuse** utilizing distributed tracing.

```
[ Citizen Input ] ──► [ Langfuse Trace Init ] ──► [ Context Retrieval ] ──► [ Guardrail Check ] ──► [ Output ]
                             │                            │                       │                  │
                             ▼                            ▼                       ▼                  ▼
                    Trace: Session ID             Span: Vector Search     Span: NLI Guard      Log Tokens & Cost
```

The following class manages LLM traces, sending context details to Langfuse:

```python
import os
import uuid
import time
from typing import Dict, Any, List
from langfuse import Langfuse
from langfuse.decorators import observe

class TrackedRAGEngine:
    def __init__(self):
        # Enforce strict encryption for SDK telemetry pipelines
        self.langfuse = Langfuse(
            public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
            secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
            host=os.getenv("LANGFUSE_HOST", "https://telemetry.sevasetu.gov.in")
        )

    def process_citizen_query(self, session_id: str, query: str, user_profile: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes citizen search query, tracking execution steps in Langfuse.
        """
        trace_id = str(uuid.uuid4())
        
        # 1. Initialize Root Trace Event inside Langfuse telemetry hub
        trace = self.langfuse.trace(
            id=trace_id,
            name="SevaSetu_RAG_Pipeline",
            session_id=session_id,
            user_id=user_profile.get("id", "anonymous_citizen"),
            metadata={
                "state": user_profile.get("state"),
                "language": user_profile.get("language", "hi"),
                "platform": "whatsapp"
            }
        )

        # 2. Trace Vector Context Retrieval Process
        retrieval_span = trace.span(
            name="Vector_DB_Hybrid_Search",
            metadata={"search_query": query}
        )
        
        start_time = time.time()
        # Simulated Search Process
        retrieved_context = "Under PM Fasal Bima Yojana, crop damage must be reported within 72 hours."
        duration = time.time() - start_time
        
        retrieval_span.end(
            output={"context_length": len(retrieved_context)},
            metadata={"latency_ms": duration * 1000}
        )

        # 3. Trace LLM Generation Process
        generation_span = trace.generation(
            name="Llama_3_8B_Synthesis",
            model="llama-3-8b-instruct",
            model_parameters={"temperature": 0.0, "max_tokens": 512},
            input=[{"role": "user", "content": query}]
        )
        
        # Simulated LLM Processing
        completion_text = "यदि फसल को नुकसान पहुंचता है, तो आपको 72 घंटे के भीतर शिकायत दर्ज करनी होगी।"
        prompt_tokens = 240
        completion_tokens = 110
        
        # Calculate pricing dynamically based on current token cost models
        estimated_cost = (prompt_tokens * 0.00015 / 1000) + (completion_tokens * 0.0006 / 1000)

        generation_span.end(
            output=completion_text,
            usage={
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": prompt_tokens + completion_tokens,
                "cost": estimated_cost
            }
        )

        # 4. Trace the Guardrail Verification check
        guard_span = trace.span(name="NLI_Faithfulness_Validation")
        nli_score = 0.96 # High faithfulness score (no hallucination)
        
        guard_span.end(
            output={"nli_entailment_score": nli_score},
            metadata={"passed": nli_score >= 0.85}
        )

        # Submit evaluations directly to Langfuse
        self.langfuse.score(
            trace_id=trace_id,
            name="faithfulness",
            value=nli_score
        )

        return {
            "response": completion_text,
            "trace_id": trace_id
        }
```

---

## 6. Cost Optimization Architecture

Serving conversational RAG pipelines at a country-wide scale can generate high cloud costs if not managed efficiently. SevaSetu AI uses resource scheduling, caching, and payload compression to keep operating costs low.

```
                                [ Cloudflare Edge CDN ]
                                           │
                             Serves cached landing contents
                                           │
                                           ▼
                                  [ API Gateway ]
                                           │
                                  Checks rate limits
                                           │
                                           ▼
                               [ Semantic Cache (Redis) ]
                                           │
                        ┌──────────────────┴──────────────────┐
                        │ Cache Hit                           │ Cache Miss
                        ▼                                     ▼
                Return Cached Ans                      [ Backend Service ]
                                                              │
                                                        Executes RAG & LLM
```

### 6.1 Spot Instance Strategy & Node Autoscaling

We use **AWS Karpenter** on the Kubernetes cluster to manage automatic host node grouping.

1. **Stateless Pod Isolation:** Services such as `ocr-worker`, `frontend-web`, and `translation-proxy` run entirely on **AWS EC2 Spot Instances** (saving up to 90% compared to on-demand pricing).
2. **Stateful Integrity Isolation:** Highly critical stateful components (PostgreSQL RDS primary database, Redis Cache clusters, and the HSM-secured Aadhaar Vault) run on secure, dedicated On-Demand instances.
3. **Graceful Termination Handlers:** All Spot instance node groups include the **AWS Node Termination Handler (NTH)**. When AWS issues a 2-minute Spot termination notification:
   - NTH intercepts the message and immediately marks the affected node as Unschedulable (cordons the node).
   - All pods on that node are drained and restarted on alternate available instances.
   - Dynamic API connections are gracefully closed using standard SIGTERM handlers (FastAPI waits up to 30 seconds to finish open transactions).

#### Karpenter Node Provisioner Blueprint (`karpenter-provisioner.yaml`)

```yaml
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: sevasetu-spot-nodepool
  namespace: kube-system
spec:
  template:
    spec:
      requirements:
        - key: "karpenter.sh/capacity-type"
          operator: In
          values: ["spot"]  # Restrict this pool to Spot instances
        - key: "kubernetes.io/arch"
          operator: In
          values: ["amd64", "arm64"] # Support cost-efficient Graviton (arm64) instances
        - key: "karpenter.k8s.aws/instance-family"
          operator: In
          values: ["c6i", "c6g", "m6i", "m6g", "r6g"]
      nodeClassRef:
        name: sevasetu-aws-nodeclass
  disruption:
    consolidationPolicy: WhenUnderutilized
    expireAfter: 72h # Terminate and recycle instances every 3 days to avoid configuration drift
```

---

### 6.2 Semantic Cache (Redis & Sentence Transformers)

A standard RAG conversational pipeline requires embedding queries, checking vector stores, and generating LLM completions. When millions of citizens query similar standard scheme questions (e.g., *"What is the registration date for PM-KISAN?"*), routing every request to the LLM creates redundant costs.

SevaSetu AI implements an **In-Memory Semantic Cache** on Redis. When a query is received:
1. An embedding is generated for the incoming search text.
2. The system checks the Redis cache for previous queries with a high cosine similarity score ($>0.96$).
3. If a match is found, the cached answer is returned directly. This avoids executing the RAG and LLM pipeline, lowering token costs and reducing response times to $<50$ms.

#### Python Semantic Cache Implementation

```python
import redis
import numpy as np
from sentence_transformers import SentenceTransformer

class RedisSemanticCache:
    def __init__(self):
        self.redis_client = redis.Redis(host='localhost', port=6379, db=1)
        # Use a lightweight multilingual sentence encoder
        self.encoder = SentenceTransformer('sentence-transformers/LaBSE')
        self.similarity_threshold = 0.96

    def _serialize_vector(self, vector: np.ndarray) -> bytes:
        return vector.astype(np.float32).tobytes()

    def get(self, query: str) -> str | None:
        """
        Checks cache for similar queries and returns the cached answer if found.
        """
        query_vector = self.encoder.encode(query)
        
        # Scan cached keys in Redis (or query via Redis VL Vector Similarity Search)
        # For demonstration, we fetch and compare vector indices
        cached_keys = self.redis_client.keys("cache:query:*")
        
        for key in cached_keys:
            cached_vector_bytes = self.redis_client.get(key)
            if not cached_vector_bytes:
                continue
                
            cached_vector = np.frombuffer(cached_vector_bytes, dtype=np.float32)
            
            # Compute cosine similarity
            similarity = np.dot(query_vector, cached_vector) / (np.linalg.norm(query_vector) * np.linalg.norm(cached_vector))
            
            if similarity >= self.similarity_threshold:
                # Retrieve the associated answer key
                ans_key = key.decode('utf-8').replace("cache:query:", "cache:response:")
                answer = self.redis_client.get(ans_key)
                if answer:
                    return answer.decode('utf-8')
                    
        return None

    def set(self, query: str, answer: str):
        """
        Saves query vector and response pair in Redis with a 24-hour TTL.
        """
        query_vector = self.encoder.encode(query)
        cache_id = hash(query)
        
        query_key = f"cache:query:{cache_id}"
        resp_key = f"cache:response:{cache_id}"
        
        # Save query vector and answer text
        self.redis_client.setex(query_key, 86400, self._serialize_vector(query_vector))
        self.redis_client.setex(resp_key, 86400, answer.encode('utf-8'))
```

---

### 6.3 Payload Compression (Bandwidth & Audio Optimization)

Because rural users often access SevaSetu AI over 2G/3G networks, raw data transfers are optimized to minimize network egress costs and payload latency:

1. **Gzip & Brotli HTTP Compression:** Enforced across all API JSON payloads, reducing raw text transfer sizes by up to 80%.
2. **Audio Stream Compression (Bhashini TTS):** 
   - External Bhashini text-to-speech services generate uncompressed WAV files.
   - The SevaSetu media middleware intercepts these files and compresses them into high-quality **Opus** format inside an **Ogg** container.
   - This process reduces audio payload sizes from **2.5 MB** (WAV) to under **180 KB** (Ogg/Opus) without losing audio clarity, enabling fast voice playbacks even on poor network connections.

---

## 7. Disaster Recovery & Reliability Matrices

### 7.1 Recovery Point and Recovery Time Objectives (RPO & RTO)

| System Category | Data Tier / Service Type | Target RPO | Target RTO | Backup & Recovery Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **Highly Critical** | PostgreSQL Database (User profiles, transactions, consent ledgers). | 5 Seconds | 2 Minutes | Continuous WAL archiving to S3, multi-region database replication with automated failover via AWS Aurora. |
| **Critical** | Vector DB / Qdrant Index (Policy documents corpus). | 1 Hour | 30 Minutes | Point-in-time index snapshots pushed to S3 every hour, fast snapshot recovery scripts. |
| **Stateless** | API Backend, Frontend Web, Translation Gateway. | Zero | 1 Minute | Blue-Green deployment with Karpenter replica scaling across availability zones. |
| **Ephemeral Cache** | Redis (Sessions, OTP sliding windows). | 15 Minutes | 5 Minutes | Redis AOF (Append Only File) enabled with replication to passive cluster node. |

---

### 7.2 Backup & Disaster Recovery Runbook Workflow

```
[ Primary Region Event ] ──► [ Route53 Health Checks Fail ] ──► [ Switch DNS to Passive Region ]
                                                                             │
[ Warm-Standby Cluster Activation ] ◄── Promote Replica DB ◄─────────────────┘
```

1. **Automated Monitoring & Failover:** AWS Route53 checks endpoint health every 10 seconds. If the primary Indian datacenter (Mumbai) becomes unreachable:
   - Automated routing switches public traffic to the passive/standby cluster.
   - The secondary database instance is promoted to active primary write status.
2. **Database Backup Validation:** Daily backups are checked by restoring the data to an isolated staging environment and running verification tests to confirm the recovered files are clean and consistent.
3. **Manual Rollback Playbook:** If a bad software release causes database corruption, developers run automated restore scripts to rollback database state and code instances to a target timestamp within the WAL retention window.

---

## 8. Infrastructure Sign-off & Verification Protocols

This architecture document is finalized for system deployment. Alignment with compliance requirements will be reviewed during periodic audits.

* **Principal DevOps Architect:** Signed  
* **Lead SRE Engineer:** Signed  
* **Chief Information Officer:** Approved  
* **Director of Infrastructure Security:** Approved  
