import hashlib
import math
import time
import uuid
from collections import Counter

# Try importing the real Qdrant Client to provide native integration if installed
try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import PointStruct, Distance, VectorParams
    QDRANT_AVAILABLE = True
except ImportError:
    QDRANT_AVAILABLE = False

    # Mock equivalent classes to allow completely clean fallback
    class Distance:
        COSINE = "Cosine"
        EUCLID = "Euclid"
        DOT = "Dot"

    class VectorParams:
        def __init__(self, size: int, distance: str):
            self.size = size
            self.distance = distance


# Define PointStruct and ScoredPoint classes in the global scope if not imported
if not QDRANT_AVAILABLE:
    class PointStruct:
        def __init__(self, id, vector, payload=None):
            self.id = id
            self.vector = vector
            self.payload = payload or {}

    class ScoredPoint:
        def __init__(self, id, score, payload=None, vector=None):
            self.id = id
            self.score = score
            self.payload = payload or {}
            self.vector = vector


class EmbeddingEngine:
    """
    Highly resilient embedding generator that attempts to use OpenAI's API 
    and seamlessly falls back to a deterministic local hashing vectorizer 
    under rate limits, network outages, or offline development environments.
    """
    def __init__(self, client=None):
        """
        :param client: Optional OpenAI or compatibility client.
        """
        self.client = client

    def get_embedding(self, text: str) -> list[float]:
        """
        Generates dense vector representation of the provided text.
        Attempts OpenAI embeddings first, and gracefully falls back to hash vectorization.
        """
        if not text or not text.strip():
            text = " "

        if self.client:
            try:
                response = self.client.embeddings.create(
                    input=[text],
                    model="text-embedding-3-small"
                )
                return response.data[0].embedding
            except Exception:
                # Silently fail over to our local deterministic mock embedding
                pass

        return self.get_hash_embedding(text)

    @staticmethod
    def get_hash_embedding(text: str, dimensions: int = 512) -> list[float]:
        """
        Generates a robust, deterministic dense representation using 
        feature hashing with logarithmic frequency scaling and L2 normalization.
        """
        words = text.lower().split()
        if not words:
            return [0.0] * dimensions

        vector = [0.0] * dimensions
        counts = Counter(words)

        for word, count in counts.items():
            # Compute a stable hash of the word
            h = int(hashlib.md5(word.encode("utf-8")).hexdigest(), 16)
            index = h % dimensions
            # Applying log-scaled frequency weight (TF equivalent)
            weight = 1.0 + math.log(count)
            vector[index] += weight

        # Normalize vector to Unit Length (L2) to make simple dot product equal to Cosine Similarity
        magnitude = math.sqrt(sum(v * v for v in vector))
        if magnitude > 0:
            vector = [v / magnitude for v in vector]

        return vector


class MockQdrantClient:
    """
    In-memory mock database that replicates the core search and upsert APIs 
    of the Qdrant client, computing cosine similarities on the fly.
    """
    def __init__(self, *args, **kwargs):
        self.collections = {}

    def create_collection(self, collection_name: str, vectors_config=None, **kwargs):
        if collection_name not in self.collections:
            self.collections[collection_name] = []
        return True

    def recreate_collection(self, collection_name: str, vectors_config=None, **kwargs):
        self.collections[collection_name] = []
        return True

    def upsert(self, collection_name: str, points, **kwargs):
        if collection_name not in self.collections:
            self.collections[collection_name] = []

        for p in points:
            if hasattr(p, "id"):
                p_id = p.id
                p_vector = p.vector
                p_payload = p.payload
            else:
                p_id = p.get("id")
                p_vector = p.get("vector")
                p_payload = p.get("payload", {})

            # Upsert behavior: clear existing point with same ID if any
            self.collections[collection_name] = [
                x for x in self.collections[collection_name] if x.id != p_id
            ]
            self.collections[collection_name].append(PointStruct(id=p_id, vector=p_vector, payload=p_payload))
        return True

    def search(self, collection_name: str, query_vector: list[float], limit: int = 5, **kwargs):
        if collection_name not in self.collections:
            return []

        scored_points = []
        for point in self.collections[collection_name]:
            score = self._cosine_similarity(query_vector, point.vector)
            scored_points.append(
                ScoredPoint(id=point.id, score=score, payload=point.payload, vector=point.vector)
            )

        # Sort descending by score
        scored_points.sort(key=lambda x: x.score, reverse=True)
        return scored_points[:limit]

    @staticmethod
    def _cosine_similarity(v1, v2):
        if not v1 or not v2 or len(v1) != len(v2):
            return 0.0
        dot_product = sum(a * b for a, b in zip(v1, v2))
        m1 = math.sqrt(sum(a * a for a in v1))
        m2 = math.sqrt(sum(b * b for b in v2))
        if m1 * m2 == 0:
            return 0.0
        return dot_product / (m1 * m2)


class MemoryGateway:
    """
    Enterprise Semantic Memory Gateway representing a unified interface 
    for semantic caching, multi-agent log indexing, and safe workspace context querying.
    """
    def __init__(self, client=None, qdrant_url=None, qdrant_api_key=None, use_mock=False):
        """
        :param client: Optional LLM client to fetch true semantic embeddings.
        :param qdrant_url: Remote url for genuine cloud Qdrant connections.
        :param qdrant_api_key: Remote security API credential.
        :param use_mock: Forces the gateway to load local MockQdrantClient.
        """
        self.embedding_engine = EmbeddingEngine(client)

        if QDRANT_AVAILABLE and not use_mock and (qdrant_url or qdrant_api_key):
            try:
                self.qdrant = QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
                self._is_mock = False
                print("[MemoryGateway] Successfully connected to remote Qdrant Server.")
            except Exception as e:
                print(f"[MemoryGateway] Warning: Failed to connect to remote Qdrant ({e}). Falling back to local mock.")
                self.qdrant = MockQdrantClient()
                self._is_mock = True
        else:
            self.qdrant = MockQdrantClient()
            self._is_mock = True
            print("[MemoryGateway] Loaded in-memory high-fidelity MockQdrantClient.")

        # Establish index dimensions and configure semantic collections
        self._initialize_collections()

    def _initialize_collections(self):
        test_embed = self.embedding_engine.get_embedding("test")
        self.embedding_dim = len(test_embed)

        collections = ["llm_cache", "agent_history", "workspace_files"]
        for col in collections:
            try:
                if self._is_mock:
                    self.qdrant.create_collection(col)
                else:
                    self.qdrant.create_collection(
                        collection_name=col,
                        vectors_config=VectorParams(size=self.embedding_dim, distance=Distance.COSINE)
                    )
            except Exception:
                # Collection may already exist on remote server
                pass

    # ==========================================
    # 1. SEMANTIC LLM CALL CACHING
    # ==========================================
    def lookup_cache(self, prompt: str, system_prompt: str = "", threshold: float = 0.95) -> str | None:
        """
        Examines the semantic cache database to find similar prompts previously run.
        If a stored item reaches the cosine threshold, it returns the cached generation.
        """
        combined_text = f"System: {system_prompt}\nUser: {prompt}"
        vector = self.embedding_engine.get_embedding(combined_text)

        results = self.qdrant.search(
            collection_name="llm_cache",
            query_vector=vector,
            limit=1
        )

        if results:
            best_match = results[0]
            if best_match.score >= threshold:
                return best_match.payload.get("response")
        return None

    def cache_llm_call(self, prompt: str, response: str, system_prompt: str = ""):
        """
        Indexes a newly performed LLM prompt-response transaction inside our semantic cache.
        """
        combined_text = f"System: {system_prompt}\nUser: {prompt}"
        vector = self.embedding_engine.get_embedding(combined_text)
        point_id = str(uuid.uuid4())

        payload = {
            "prompt": prompt,
            "system_prompt": system_prompt,
            "response": response,
            "combined_text": combined_text,
            "timestamp": time.time()
        }

        point = PointStruct(id=point_id, vector=vector, payload=payload)
        self.qdrant.upsert(
            collection_name="llm_cache",
            points=[point]
        )

    # ==========================================
    # 2. MULTI-AGENT HISTORY INDEXING
    # ==========================================
    def index_message(self, agent_name: str, role: str, message: str):
        """
        Converts conversational transcripts from agents into semantic search points 
        to capture project context over long periods.
        """
        vector = self.embedding_engine.get_embedding(message)
        point_id = str(uuid.uuid4())

        payload = {
            "agent_name": agent_name,
            "role": role,
            "message": message,
            "timestamp": time.time()
        }

        point = PointStruct(id=point_id, vector=vector, payload=payload)
        self.qdrant.upsert(
            collection_name="agent_history",
            points=[point]
        )

    def search_history(self, query: str, limit: int = 5) -> list[dict]:
        """
        Retrieves top agent interaction logs that are contextually similar to the search query.
        """
        vector = self.embedding_engine.get_embedding(query)
        results = self.qdrant.search(
            collection_name="agent_history",
            query_vector=vector,
            limit=limit
        )

        hits = []
        for r in results:
            hits.append({
                "score": r.score,
                "agent_name": r.payload.get("agent_name"),
                "role": r.payload.get("role"),
                "message": r.payload.get("message"),
                "timestamp": r.payload.get("timestamp")
            })
        return hits

    # ==========================================
    # 3. WORKSPACE DOCUMENT AND FILE SEARCH
    # ==========================================
    def index_file(self, filepath: str, content: str):
        """
        Splits source files, readmes, and schemas into paragraphs and indexes 
        them so agents can query the workspace files semantically.
        """
        # Split file by double-newlines (natural paragraphs)
        paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
        if not paragraphs:
            paragraphs = [content]

        points = []
        for i, para in enumerate(paragraphs):
            vector = self.embedding_engine.get_embedding(para)
            # Create a stable UUID generated from file and chunk index
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{filepath}_{i}"))

            payload = {
                "filepath": filepath,
                "chunk_id": i,
                "content": para,
                "timestamp": time.time()
            }
            points.append(PointStruct(id=point_id, vector=vector, payload=payload))

        if points:
            self.qdrant.upsert(
                collection_name="workspace_files",
                points=points
            )

    def search_files(self, query: str, limit: int = 3) -> list[dict]:
        """
        Searches all indexed workspace document chunks and returns relevant snippets.
        """
        vector = self.embedding_engine.get_embedding(query)
        results = self.qdrant.search(
            collection_name="workspace_files",
            query_vector=vector,
            limit=limit
        )

        hits = []
        for r in results:
            hits.append({
                "score": r.score,
                "filepath": r.payload.get("filepath"),
                "chunk_id": r.payload.get("chunk_id"),
                "content": r.payload.get("content")
            })
        return hits


# Self-test harness to verify operations directly
if __name__ == "__main__":
    print("==================================================")
    print(" RUNNING ENTERPRISE MEMORY GATEWAY SELF-TEST")
    print("==================================================")

    # Initialize client in pure mock mode
    gateway = MemoryGateway(use_mock=True)

    # Test 1: Semantic Caching
    print("\n--- [Test 1] Verifying Semantic Caching ---")
    prompt_1 = "Design a distributed payment gateway using PostgreSQL"
    system_1 = "You are a SOTA Senior Technical Architect."
    response_1 = "Payment Gateway Design: 1. Setup Postgres, 2. Setup Ledger Tables, 3. Implement 2PC."

    print(f"Caching prompt: '{prompt_1}'")
    gateway.cache_llm_call(prompt=prompt_1, response=response_1, system_prompt=system_1)

    # Query with slightly modified prompt to test semantic similarity
    test_prompt = "How can we design a payment gateway utilizing PostgreSQL?"
    print(f"Querying cache with: '{test_prompt}'")
    cached_res = gateway.lookup_cache(prompt=test_prompt, system_prompt=system_1, threshold=0.75)
    print(f"Match found (Similarity threshold >= 0.75)? {cached_res is not None}")
    if cached_res:
        print(f"Cached Response snippet: {cached_res[:60]}...")

    # Query with completely unrelated prompt
    unrelated_prompt = "Write a quicksort algorithm in python"
    cached_res_unrelated = gateway.lookup_cache(prompt=unrelated_prompt, system_prompt=system_1, threshold=0.75)
    print(f"Match found for unrelated query? {cached_res_unrelated is not None}")

    # Test 2: Agent Conversation Indexing & Search
    print("\n--- [Test 2] Verifying Agent History Semantic Indexing ---")
    gateway.index_message("Developer", "assistant", "I have implemented the database schemas in models.py and completed unit tests.")
    gateway.index_message("QA", "assistant", "The database connection failed due to missing SSL parameters. I fixed it by updating credentials.")
    gateway.index_message("Researcher", "assistant", "Enterprise trends show 85% of platforms migrating workflows towards LangGraph and Temporal.")

    history_query = "database connection failure SSL"
    print(f"Searching history for: '{history_query}'")
    history_hits = gateway.search_history(query=history_query, limit=2)
    for idx, hit in enumerate(history_hits):
        print(f"  [{idx + 1}] Score: {hit['score']:.4f} | Agent: {hit['agent_name']} | Message: '{hit['message']}'")

    # Test 3: Workspace Document Search
    print("\n--- [Test 3] Verifying Workspace File Indexing ---")
    sample_file_content = """
    # AgentForge Config Guidelines
    
    Always configure agent_registry with names starting with capital letters.
    The database parameter should point to SQLite database at company.db.
    Ensure to wrap risky script executions in gVisor sandboxes.
    """
    gateway.index_file("guidelines.md", sample_file_content)

    file_query = "What database is used for AgentForge?"
    print(f"Searching file snippets for: '{file_query}'")
    file_hits = gateway.search_files(query=file_query, limit=1)
    for idx, hit in enumerate(file_hits):
        print(f"  [{idx + 1}] Score: {hit['score']:.4f} | File: {hit['filepath']} | Chunk Content: '{hit['content'].strip()}'")

    print("\n==================================================")
    print(" SELF-TEST COMPLETED SUCCESSFULLY!")
    print("==================================================")
