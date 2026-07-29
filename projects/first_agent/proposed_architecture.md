# Distributed Agentic Orchestration Platform: Scale & Architecture Proposal
**Author:** Chief Technology Officer (CTO)  
**Status:** Proposal / Draft for Review

---

## 1. Executive Summary & Scaling Challenges of the MVP

Our current Minimum Viable Product (MVP) demonstrates a robust multi-agent orchestration framework. However, the existing implementation is bound to a single local node, using a standard thread-pool (`ThreadPoolExecutor`) for parallel agent execution, a local SQLite database (`company.db`) for transaction memory, and a local file system for tool-based read/write actions.

### MVP Bottlenecks:
1. **Concurrency & Performance (GIL Limitations):** Standard Python multi-threading is subject to the Global Interpreter Lock (GIL). For heavy concurrent agent tasks, this becomes a CPU bottleneck. Furthermore, running multi-threading on a single machine limits horizontal scalability.
2. **State & Database Sizing:** A local SQLite database is highly prone to locking during concurrent writes from parallel threads. It cannot be shared across multiple instances, preventing horizontal scaling.
3. **Security Vulnerability (Unsandboxed Tool Execution):** The `write_file`, `read_file`, and other command-line tools run directly on the host machine. If a developer agent or an external LLM injection prompt executes malicious code, the entire server is compromised.
4. **Transient & Unindexed Memory:** Agent memories are maintained as local Python lists or simple database logs, lacking semantic index capabilities (Vector embeddings), which are required for long-term memory retrieval (RAG).
5. **No Queue Resilience:** If a host crashes mid-execution, all in-flight agent tasks, context loops, and orchestration histories are lost. There is no mechanism for message broker retries, backoff, or persistent queuing.

---

## 2. Distributed Agentic Architecture

To resolve these limitations, we propose moving to a **Cloud-Native, Event-Driven, Microservices-based Agentic Architecture**. The proposed system decouples user request ingestion, agent coordination, tool execution, and state retention.

### High-Level Architecture Diagram

```
                              +---------------------------------------+
                              |         Web/Mobile UI Clients         |
                              +--------------------+------------------+
                                                   |
                                                   | HTTP / WebSockets
                                                   v
                              +--------------------+------------------+
                              |         API Gateway (Kong / Envoy)    |
                              |   (Auth, Rate-Limiting, Load Balancer)|
                              +--------------------+------------------+
                                                   |
                                                   | gRPC / Internal HTTP
                                                   v
                              +--------------------+------------------+
                              |       API Service (FastAPI / Go)      |
                              |   (User, Workspace & Project Management)
                              +--------------------+------------------+
                                                   |
                             +---------------------+---------------------+
                             |                                           |
                             v                                           v
               +-------------+---------------+             +-------------+---------------+
               |     Orchestrator Service    |             |       Vector Service        |
               |  (Temporal.io Worker/State) |             |  (Embedding Generation)     |
               +-------------+---------------+             +-------------+---------------+
                             |                                           |
                             | Task Dispatch                             | Vector Search/Index
                             v                                           v
               +-------------+---------------+             +-------------+---------------+
               |     Agent Executor Pool     |             |      Vector Database        |
               |  (Horizontally Scalable)    |             |     (Qdrant / pgvector)     |
               +-------------+---------------+             +-----------------------------+
                             |
                             +---------------------+
                             |                     |
                             v                     v
               +-------------+---------------+ +---+-------------------------+
               |    Sandboxed Tool Engine    | |      LLM Gateway Service    |
               |  (gVisor / AWS Firecracker) | |  (Caching, Tracing, Failover)
               +-----------------------------+ +-----------------------------+
```

### Core Components Described

1. **API Gateway & Routing Layer:**
   - Functions as the single entry point. Responsible for validating JWT tokens, managing user API keys, enforcing rate limits (to prevent DDoS or LLM spam), and routing WebSockets connections for real-time task status updates.

2. **Durable Orchestration (Temporal.io):**
   - The current `orchestrate` while-loop is replaced by a **Temporal Workflow**. Temporal provides durable, stateful execution. 
   - When a project starts, a workflow execution is initialized. If an agent is paused (via user action or because it is waiting for human-in-the-loop approval), the state is securely persisted on-disk by Temporal.
   - It eliminates the risk of memory loss due to system crashes and provides native retries, timeouts, and saga-pattern rollbacks.

3. **Agent Executor Pool (Workers):**
   - Stateless Python microservices running inside Kubernetes (EKS).
   - These workers subscribe to Temporal's **Activity Queues**. When a task is assigned (e.g., `Developer|Refactor database schema`), an Agent Executor worker picks up the task, fetches the agent's prompt history, and schedules execution.

4. **Sandboxed Tool Execution Service (Security Isolation):**
   - In production, agents must **never** execute tools on the primary server. 
   - The **Tool Sandbox Engine** spawns isolated, lightweight micro-VMs (via **AWS Firecracker**) or sandboxed containers (via **gVisor**) for each workspace. 
   - When a `Developer` agent calls `write_file` or executes a script, the execution is executed inside this isolated sandbox, with limited CPU/Memory allocations and restricted outbound networking.

5. **Centralized LLM Gateway (Semantic Caching & Guardrails):**
   - A dedicated gateway that abstracts upstream LLM providers (OpenAI, Anthropic, Gemini).
   - **Semantic Caching:** Uses Redis to cache semantic lookups of LLM requests to prevent duplicate LLM processing and cut API costs by up to 35%.
   - **Guardrails Layer:** Analyzes incoming prompts and outgoing agent payloads for PII leaks, code injections, or hostile safety triggers before reaching the models.

6. **Relational and Cache State Layer:**
   - **PostgreSQL (RDS Aurora Multi-AZ):** Relational schema storing users, workspace definitions, agent system configurations, billing details, and audit trials.
   - **Redis (ElastiCache):** Handles WebSocket pub/sub for real-time streaming, locking files currently modified by an agent (distributed locking via Redlock), and temporal caching.

---

## 3. Chosen Tech Stack

| Layer | Component | Chosen Technology | Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend** | UI Framework | **React.js + Next.js + TailwindCSS** | High-performance server-side rendering, rich component library, and native WebSocket stream consumption. |
| **Backend & APIs**| Gateway / Router | **Kong API Gateway** | Cloud-native, high throughput, robust plugin system for JWT verification, rate-limiting, and metric emission. |
| | Core Service | **FastAPI (Python 3.11)** | High-performance asynchronous REST endpoints, native OpenAPI generation, and seamless integration with Python-based AI frameworks. |
| **Workflow Engine**| Orchestration | **Temporal.io** | Replaces local looping with distributed state machines, providing guaranteed execution, pause/resume capability, and robust event sourcing. |
| **Database & Cache**| Relational DB | **PostgreSQL (AWS Aurora)** | Highly scalable, transactional integrity, JSONB support for agent metadata, and extensions like `pgvector`. |
| | Caching & Queues | **Redis Cluster** | Low-latency caching, WebSockets pub/sub mechanism, and Redlock distributed file lock manager. |
| | Vector Database | **Qdrant** | Extremely fast, supports hybrid search (sparse + dense), low memory footprint, and provides robust payload filtering crucial for agent permissions. |
| **Sandboxing** | Code Execution | **gVisor + Docker / AWS Firecracker** | Container-level virtualization. Provides strong kernel-level isolation for running agent tools (filesystem writes, terminal execution) safely. |
| **Observability** | LLM Tracing | **Langfuse / OpenTelemetry** | Distributed tracing of agent pipelines, token cost computation, latency measurement, and agent prompt versioning. |
| | System Metrics | **Prometheus + Grafana** | Industry-standard monitoring for container CPU/RAM utilization, queue depth, and service health. |

---

## 4. Data Flow Diagrams

### Data Flow A: User Ingestion, Project Initialization, and Multi-Agent Parallel Task Execution

Below is the workflow sequence when a user submits a complex request.

```
+-----+             +-------------+            +----------+            +-------------------+            +----------------+
| User|             | API Gateway |            | FastAPI  |            | Temporal Workflow |            | Agent Executor |
+--+--+             +------+------+            +----+-----+            +---------+---------+            +-------+--------+
   |                       |                        |                            |                              |
   | 1. Submit Request     |                        |                            |                              |
   +---------------------->+                        |                            |                              |
   |                       | 2. Proxy & Auth        |                            |                              |
   |                       +----------------------->+                            |                              |
   |                       |                        | 3. Create Project State    |                              |
   |                       |                        +----------------------------+                              |
   |                       |                        | 4. Start Orchestrator      |                              |
   |                       |                        +--------------------------->+                              |
   |                       |                        |                            |                              |
   |                       |                        |                            | 5. Process PM Step (LLM)     |
   |                       |                        |                            +----------------------------+ |
   |                       |                        |                            |                            | |
   |                       |                        |                            |<---------------------------+ |
   |                       |                        |                            |                              |
   |                       |                        |                            | 6. Dispatch Activities (Parallel)
   |                       |                        |                            +----------------------------->+
   |                       |                        |                            |                              | 7. Fetch Context &
   |                       |                        |                            |                              |    Execute Tasks
   |                       |                        |                            |                              |    (Developer / QA)
   |                       |                        |                            |                              |
   |                       |                        |                            | 8. Complete Activities       |
   |                       |                        |                            |<-----------------------------+
   |                       |                        |                            |                              |
   |                       |                        | 9. Broadcast Status (WS)   |                              |
   |                       |                        |<---------------------------+                              |
   | 10. Real-time Status  |                        |                            |                              |
   |<-----------------------------------------------+                            |                              |
```

### Data Flow B: Isolated Agent Tool Execution & Semantic Memory Retrieval

Below is the sequence when a `Developer` or `Researcher` Agent calls a tool (e.g. `read_file` or `web_search`) and queries long-term memory.

```
+----------------+          +---------------------+          +-------------------+          +-------------+          +---------+
| Agent Executor |          | LLM Gateway Service |          | Vector DB (Qdrant)|          | Tool Sandbox|          | LLM API |
+-------+--------+          +----------+----------+          +---------+---------+          +------+------+          +----+----+
        |                              |                               |                           |                      |
        | 1. Intercept Message         |                               |                           |                      |
        +----------------------------->+                               |                           |                      |
        |                              | 2. Embed Prompt & Search      |                           |                      |
        |                              +------------------------------>+                           |                      |
        |                              | 3. Long-term Memories         |                           |                      |
        |                              |<------------------------------+                           |                      |
        |                              |                               |                           |                      |
        |                              | 4. Request Next LLM Action    |                           |                      |
        |                              +--------------------------------------------------------------------------------->+
        |                              | 5. LLM responds with tool_call: "read_file"               |                      |
        |                              |<---------------------------------------------------------------------------------+
        |                              |                               |                           |                      |
        | 6. Execute "read_file"       |                               |                           |                      |
        +----------------------------------------------------------------------------------------->+                      |
        |                              |                               |                           | 7. Read restricted   |
        |                              |                               |                           |    mounted Workspace |
        |                              |                               |                           |    directory         |
        |                              | 8. Return file content        |                           |                      |
        |                              |<----------------------------------------------------------+                      |
        |                              |                               |                           |                      |
        | 9. Construct Final Prompt    |                               |                           |                      |
        +----------------------------->+                               |                           |                      |
        |                              | 10. Prompt Context + Tool Res |                           |                      |
        |                              +--------------------------------------------------------------------------------->+
        |                              | 11. Final Formulated Answer                                                      |
        |                              |<---------------------------------------------------------------------------------+
        | 12. Complete Step            |                               |                           |                      |
        |<-----------------------------+                               |                           |                      |
```

---

## 5. Hosting & Infrastructure Strategies

To guarantee high availability (99.99%), ironclad security, and automated scaling, we propose hosting the platform entirely on **Amazon Web Services (AWS)** using modern Infrastructure as Code (Terraform).

```
                      +-----------------------------------------------------------------+
                      |                         AWS Cloud VPC                           |
                      |                                                                 |
                      |   +---------------------------------------------------------+   |
                      |   |                  Public Subnets                         |   |
                      |   |                                                         |   |
                      |   |    [ Internet Gateway ] ----> [ Application Load Bal ]   |   |
                      |   +---------------------------------------------------------+   |
                      |                                |                                |
                      |                                v                                |
                      |   +---------------------------------------------------------+   |
                      |   |                  Private Subnets                        |   |
                      |   |                                                         |   |
                      |   |   +---------------------+     +---------------------+   |   |
                      |   |   |  AWS EKS Cluster    |     |  gVisor Micro-VMs   |   |   |
                      |   |   |  (Core APIs &       |     |  (Worker Tool       |   |   |
                      |   |   |   Agent Executors)  |     |   Sandboxes)        |   |   |
                      |   |   +---------------------+     +---------------------+   |   |
                      |   +---------------------------------------------------------+   |
                      |                                |                                |
                      |                                v                                |
                      |   +---------------------------------------------------------+   |
                      |   |                  Data / Storage Subnets                 |   |
                      |   |                                                         |   |
                      |   |   +---------------------+     +---------------------+   |   |
                      |   |   | AWS Aurora Postgres |     | ElastiCache Redis   |   |   |
                      |   |   +---------------------+     +---------------------+   |   |
                      |   |   +---------------------+     +---------------------+   |   |
                      |   |   | AWS EFS / S3        |     | Qdrant Vector Cloud |   |   |
                      |   |   | (Workspace Data)    |     |                     |   |   |
                      |   |   +---------------------+     +---------------------+   |   |
                      |   +---------------------------------------------------------+   |
                      +-----------------------------------------------------------------+
```

### 1. Networking & VPC Isolation
* **Virtual Private Cloud (VPC):** Divided into 3 availability zones with Public, Private, and Isolated Data subnets.
* **NAT Gateways:** Outbound connections for workers (to fetch packages, talk to LLM APIs) pass through Managed NAT Gateways.
* **Storage Isolation:** User workspace directories are persisted on **Amazon EFS (Elastic File System)**, mounted dynamically into the gVisor/Docker sandboxes with strict POSIX permissions per workspace/tenant.

### 2. Microservice Deployment & Scaling
* **AWS Elastic Kubernetes Service (EKS):** Core API microservices, Temporal frontend workers, and Agent Executor Workers are deployed as Kubernetes pods.
* **Horizontal Pod Autoscaling (HPA):**
  * Core APIs scale on CPU/Memory usage.
  * Agent Executor Workers scale based on **Temporal Queue Depth** (using KEDA - Kubernetes Event-driven Autoscaling). If hundreds of tasks are triggered, EKS scales up worker pods automatically.
* **Node Auto-scaling:** Powered by **Karpenter** to provision cost-optimized EC2 spot instances dynamically for workloads, scaling back down to zero when idle.

### 3. Tenant Isolation & Security
* **Multi-Tenancy Model:** Each enterprise tenant gets a logical separation in the PostgreSQL database using Row-Level Security (RLS).
* **Workspace Isolation:** When an agent runs a tool, a container is dynamically provisioned in an isolated Kubernetes Namespace with network policies that block cross-namespace traffic. 
* **gVisor Integration:** Intercepts system calls from the Python code executing in tools, ensuring that standard file manipulations or calculations cannot access host memory or kernel space.

### 4. Cost Optimization & LLM Caching
* **Spot Instances:** Since agent executions are asynchronous and fault-tolerant under Temporal, we run 80% of our worker pool on **EC2 Spot Instances**, lowering infrastructure compute costs by ~60%.
* **Semantic Cache Tuning:** Implementing dynamic TTL in Redis for LLM requests. High-volume, repeatable tasks (e.g., syntactical code review, unit test templates) read from cache rather than burning LLM API tokens.

---

## 6. Migration Path: From MVP to Enterprise

To execute this architecture migration smoothly without disrupting development, we recommend a 3-phased rollout plan:

### Phase 1: Storage & State Decoupling (Weeks 1-2)
* Replace the local SQLite connection with a managed PostgreSQL engine (using AWS RDS or a local Docker-hosted PG during testing).
* Write database migration scripts using Alembic.
* Introduce a shared Redis instance to handle Distributed Locking, replacing local in-memory lock patterns.

### Phase 2: Workflow Migration (Weeks 3-4)
* Incorporate the Temporal Python SDK.
* Refactor `orchestrate.py` loops into a Temporal Workflow Definition.
* Package the `Manager`, `Developer`, and `Researcher` agents into an Agent Executor Docker image. Run them as Temporal Activities.

### Phase 3: Sandboxing & Kubernetes Rollout (Weeks 5-6)
* Port tool execution functions to communicate with a remote Docker/gVisor API rather than executing directly via Python standard libraries.
* Create Helm charts for the core platform.
* Deploy onto AWS EKS with Prometheus/Grafana and Langfuse tracing.

---
*End of CTO Architecture Proposal.*
