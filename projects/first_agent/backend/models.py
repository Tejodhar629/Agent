import os
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
