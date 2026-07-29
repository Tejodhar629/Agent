import os
import sqlite3

# Inspect the database and write logs for the PM to debug
try:
    if os.path.exists("company.db"):
        conn = sqlite3.connect("company.db")
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='conversations'")
        if cursor.fetchone():
            cursor.execute("SELECT * FROM conversations")
            rows = cursor.fetchall()
            with open("db_logs.txt", "w", encoding="utf-8") as f:
                for row in rows:
                    f.write(f"ID: {row[0]} | Agent: {row[1]} | Role: {row[2]} | Message: {row[3]}\n---\n")
        conn.close()
except Exception as e:
    with open("db_logs.txt", "w", encoding="utf-8") as f:
        f.write(f"Error reading DB: {e}\n")

# Ensure the 'tests' and 'backend' directories and their respective files always exist
test_dir = "tests"
backend_dir = "backend"

os.makedirs(test_dir, exist_ok=True)
os.makedirs(backend_dir, exist_ok=True)

test_file = os.path.join(test_dir, "test_tools.py")
if not os.path.exists(test_file):
    with open(test_file, "w", encoding="utf-8") as f:
        f.write('''import unittest
import os
import tempfile
import shutil
from tools.math.calculator import CalculatorTool
from tools.filesystem.read_file import ReadFileTool
from tools.filesystem.write_file import WriteFileTool
from tools.filesystem.list_directory import ListDirectoryTool

class TestCalculatorTool(unittest.TestCase):
    def setUp(self):
        self.tool = CalculatorTool()

    def test_addition(self):
        self.assertEqual(self.tool.execute("add", 5, 3), 8)
        self.assertEqual(self.tool.execute("add", -1, 1), 0)
        self.assertEqual(self.tool.execute("add", 5.5, 4.5), 10.0)

    def test_subtraction(self):
        self.assertEqual(self.tool.execute("subtract", 10, 4), 6)
        self.assertEqual(self.tool.execute("subtract", 0, 5), -5)

    def test_multiplication(self):
        self.assertEqual(self.tool.execute("multiply", 3, 4), 12)
        self.assertEqual(self.tool.execute("multiply", -2, 3), -6)

    def test_division(self):
        self.assertEqual(self.tool.execute("divide", 10, 2), 5.0)
        self.assertEqual(self.tool.execute("divide", 5, 2), 2.5)
        self.assertEqual(self.tool.execute("divide", 10, 0), "Error: Division by zero.")

    def test_invalid_operation(self):
        self.assertEqual(self.tool.execute("power", 2, 3), "Error: Unknown operation 'power'.")

    def test_string_numeric_parsing(self):
        self.assertEqual(self.tool.execute("add", "5", "3"), 8)
        self.assertEqual(self.tool.execute("add", "5.5", "4.5"), 10.0)

    def test_invalid_numeric_inputs(self):
        self.assertEqual(self.tool.execute("add", "invalid", 5), "Error: 'invalid' is not a valid numeric value.")
        self.assertEqual(self.tool.execute("add", 5, "invalid"), "Error: 'invalid' is not a valid numeric value.")
        self.assertEqual(self.tool.execute("add", None, 5), "Error: 'None' is not a valid numeric value.")


class TestFilesystemTools(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.mkdtemp()
        self.read_tool = ReadFileTool()
        self.write_tool = WriteFileTool()
        self.list_tool = ListDirectoryTool()

    def tearDown(self):
        shutil.rmtree(self.temp_dir)

    def test_write_and_read_file(self):
        filepath = os.path.join(self.temp_dir, "test_file.txt")
        content = "Hello, world!\\nTesting filesystem tools."
        
        # Test write_file
        write_result = self.write_tool.execute(filepath, content)
        self.assertEqual(write_result, "File written.")
        self.assertTrue(os.path.exists(filepath))
        
        # Test read_file
        read_result = self.read_tool.execute(filepath)
        self.assertEqual(read_result, content)

    def test_list_directory(self):
        # Create some files in temp directory
        file1 = os.path.join(self.temp_dir, "file1.txt")
        file2 = os.path.join(self.temp_dir, "file2.txt")
        
        self.write_tool.execute(file1, "one")
        self.write_tool.execute(file2, "two")
        
        # Test list_directory
        files = self.list_tool.execute(self.temp_dir)
        self.assertIn("file1.txt", files)
        self.assertIn("file2.txt", files)
        self.assertEqual(len(files), 2)

    def test_read_nonexistent_file(self):
        filepath = os.path.join(self.temp_dir, "nonexistent.txt")
        with self.assertRaises(FileNotFoundError):
            self.read_tool.execute(filepath)

    def test_list_nonexistent_directory(self):
        dirpath = os.path.join(self.temp_dir, "nonexistent_dir")
        with self.assertRaises(FileNotFoundError):
            self.list_tool.execute(dirpath)

if __name__ == "__main__":
    unittest.main()
''')

models_file = os.path.join(backend_dir, "models.py")
if not os.path.exists(models_file):
    with open(models_file, "w", encoding="utf-8") as f:
        f.write('''import os
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, ForeignKey, create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship

Base = declarative_base()

class Project(Base):
    __tablename__ = 'projects'

    project_id = Column(String(64), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(32), default='PENDING')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tasks = relationship("TaskDAG", back_populates="project", cascade="all, delete-orphan")
    conversations = relationship("Conversation", back_populates="project", cascade="all, delete-orphan")


class Conversation(Base):
    __tablename__ = 'conversations'

    id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(String(64), ForeignKey('projects.project_id', ondelete="CASCADE"), nullable=False)
    cycle_number = Column(Integer, nullable=False)
    agent_name = Column(String(64), nullable=False)
    role = Column(String(32), nullable=False)  # 'system', 'user', 'assistant', 'tool'
    message = Column(Text, nullable=False)
    tool_calls = Column(JSON, nullable=True)  # JSON representation of tool invocations
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    project = relationship("Project", back_populates="conversations")


class TaskDAG(Base):
    __tablename__ = 'task_dag'

    task_id = Column(String(64), primary_key=True)
    project_id = Column(String(64), ForeignKey('projects.project_id', ondelete="CASCADE"), nullable=False)
    agent_name = Column(String(64), nullable=False)
    task_description = Column(Text, nullable=False)
    dependencies = Column(JSON, nullable=True)  # JSON array of dependent task_ids
    status = Column(String(32), default='PENDING')  # PENDING, RUNNING, SUCCEEDED, FAILED
    output = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    project = relationship("Project", back_populates="tasks")


# Database engine setup with fallback mechanism
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    # Fallback to local SQLite database in backend folder
    DATABASE_URL = "sqlite:///backend/backend_company.db"

# For SQLite, ensure we support concurrent write operations (WAL mode) and correct thread handling
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False}
    )
    
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
else:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def init_db():
    Base.metadata.create_all(bind=engine)
''')

memory_gateway_file = os.path.join(backend_dir, "memory_gateway.py")
if not os.path.exists(memory_gateway_file):
    with open(memory_gateway_file, "w", encoding="utf-8") as f:
        f.write('''import hashlib
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
        combined_text = f"System: {system_prompt}\\nUser: {prompt}"
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
        combined_text = f"System: {system_prompt}\\nUser: {prompt}"
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
        paragraphs = [p.strip() for p in content.split("\\n\\n") if p.strip()]
        if not paragraphs:
            paragraphs = [content]

        points = []
        for i, para in enumerate(paragraphs):
            vector = self.embedding_engine.get_embedding(para)
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
''')

security_guardrails_file = os.path.join(backend_dir, "security_guardrails.py")
if not os.path.exists(security_guardrails_file):
    with open(security_guardrails_file, "w", encoding="utf-8") as f:
        f.write('''import ast
import os
from typing import Tuple, List, Optional

# List of blocked modules that are considered dangerous for untrusted execution
BLOCKED_MODULES = {
    'os', 'sys', 'subprocess', 'shutil', 'socket', 'pty', 'platform', 
    'ctypes', 'importlib', 'builtins', 'requests', 'urllib', 'http', 'tempfile'
}

# List of builtins/functions that are strictly forbidden
BLOCKED_FUNCTIONS = {
    'exec', 'eval', 'globals', 'locals', '__import__', 'compile',
    'getattr', 'setattr', 'delattr', 'input', 'breakpoint', 'open'
}

# Forbidden attributes that are often used in sandbox escapes
BLOCKED_ATTRIBUTES = {
    '__subclasses__', '__globals__', '__code__', '__builtins__', 
    '__class__', '__bases__', '__mro__', '__dict__'
}

def analyze_py_code(code: str) -> Tuple[bool, List[str]]:
    violations = []
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        return False, [f"Syntax Error during parsing: {str(e)}"]

    class SecurityVisitor(ast.NodeVisitor):
        def visit_Import(self, node: ast.Import):
            for alias in node.names:
                base_module = alias.name.split('.')[0]
                if base_module in BLOCKED_MODULES:
                    violations.append(f"Forbidden module import: '{alias.name}'")
            self.generic_visit(node)

        def visit_ImportFrom(self, node: ast.ImportFrom):
            if node.module:
                base_module = node.module.split('.')[0]
                if base_module in BLOCKED_MODULES:
                    violations.append(f"Forbidden module import: from '{node.module}' import ...")
            self.generic_visit(node)

        def visit_Call(self, node: ast.Call):
            if isinstance(node.func, ast.Name):
                if node.func.id in BLOCKED_FUNCTIONS:
                    violations.append(f"Forbidden function call: '{node.func.id}()'")
            elif isinstance(node.func, ast.Attribute):
                self._check_attribute_access(node.func)
            self.generic_visit(node)

        def visit_Attribute(self, node: ast.Attribute):
            self._check_attribute_access(node)
            self.generic_visit(node)

        def _check_attribute_access(self, node: ast.Attribute):
            if node.attr in BLOCKED_ATTRIBUTES:
                violations.append(f"Forbidden attribute access: '.{node.attr}'")
            if isinstance(node.value, ast.Name):
                obj_name = node.value.id
                if obj_name in BLOCKED_MODULES:
                    violations.append(f"Forbidden call/access to module member: '{obj_name}.{node.attr}'")

    visitor = SecurityVisitor()
    visitor.visit(tree)

    is_safe = len(violations) == 0
    return is_safe, violations


def validate_safe_path(path: str, base_dir: Optional[str] = None) -> str:
    if not path:
        raise ValueError("Path cannot be empty.")
    if base_dir is None:
        base_dir = os.getcwd()
    resolved_base = os.path.realpath(base_dir)
    if not os.path.isabs(path):
        resolved_target = os.path.realpath(os.path.join(resolved_base, path))
    else:
        resolved_target = os.path.realpath(path)
    base_prefix = resolved_base if resolved_base.endswith(os.sep) else resolved_base + os.sep
    target_prefix = resolved_target if resolved_target.endswith(os.sep) else resolved_target + os.sep
    if resolved_target != resolved_base and not target_prefix.startswith(base_prefix):
        raise PermissionError(
            f"Access Denied: Path '{path}' resolves to '{resolved_target}', "
            f"which is outside the permitted boundary '{resolved_base}'."
        )
    sensitive_files = {'.env', 'company.db'}
    target_filename = os.path.basename(resolved_target)
    if target_filename in sensitive_files:
        raise PermissionError(
            f"Access Denied: Read/Write operations on highly sensitive file '{target_filename}' are forbidden."
        )
    return resolved_target
''')

security_test_file = os.path.join(test_dir, "test_security_guardrails.py")
if not os.path.exists(security_test_file):
    with open(security_test_file, "w", encoding="utf-8") as f:
        f.write('''import unittest
import os
import tempfile
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.security_guardrails import analyze_py_code, validate_safe_path

class TestSecurityGuardrails(unittest.TestCase):

    def test_safe_python_code(self):
        safe_code_list = [
            "x = 1 + 2",
            "print('Hello, world!')",
            "def test():\\n    return [i for i in range(10)]",
            "import math\\nmath.sqrt(16)"
        ]
        for code in safe_code_list:
            is_safe, violations = analyze_py_code(code)
            self.assertTrue(is_safe, f"Should be safe: {code}. Violations: {violations}")

    def test_unsafe_imports(self):
        unsafe_code_list = [
            "import os",
            "import sys",
            "from subprocess import Popen"
        ]
        for code in unsafe_code_list:
            is_safe, _ = analyze_py_code(code)
            self.assertFalse(is_safe, f"Should be unsafe: {code}")

    def test_unsafe_builtins(self):
        unsafe_code_list = [
            "eval('1+1')",
            "exec('import os')",
            "globals()",
            "open('test.txt', 'r')"
        ]
        for code in unsafe_code_list:
            is_safe, _ = analyze_py_code(code)
            self.assertFalse(is_safe, f"Should be unsafe: {code}")

    def test_safe_path(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            safe_rel_path = "test_file.txt"
            resolved = validate_safe_path(safe_rel_path, base_dir=temp_dir)
            self.assertTrue(resolved.startswith(os.path.realpath(temp_dir)))

    def test_path_traversal_detection(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaises(PermissionError):
                validate_safe_path("../outside.txt", base_dir=temp_dir)

    def test_sensitive_files_block(self):
        with tempfile.TemporaryDirectory() as temp_dir:
            with self.assertRaises(PermissionError):
                validate_safe_path(".env", base_dir=temp_dir)

if __name__ == '__main__':
    unittest.main()
''')


from tools.filesystem.list_directory import ListDirectoryTool
from tools.math.calculator import CalculatorTool
from tools.filesystem.write_file import WriteFileTool
from tools.filesystem.read_file import ReadFileTool
from tools.search.web_search import WebSearchTool
from agents.agent import Agent
from agents.roles import ROLES

TOOLS = {
    "read_file": ReadFileTool(),
    "write_file": WriteFileTool(),
    "calculator": CalculatorTool(),
    "list_directory": ListDirectoryTool(),
    "web_search": WebSearchTool()
}

agent_registry = {}

# Dynamically instantiate all agents defined in roles.py
for role_name, role_prompt in ROLES.items():
    agent_registry[role_name] = Agent(
        name=role_name,
        role=role_prompt,
        tools=list(TOOLS.values()),
        client=None
    )
