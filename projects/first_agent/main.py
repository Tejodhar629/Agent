import os

# Explicit directory setup and sync of backend files on startup
os.makedirs("backend", exist_ok=True)
backend_memory_path = "backend/memory_gateway.py"
memory_source_path = "memory/memory_gateway.py"
if os.path.exists(memory_source_path):
    try:
        with open(memory_source_path, "r", encoding="utf-8") as src:
            code = src.read()
        with open(backend_memory_path, "w", encoding="utf-8") as dst:
            dst.write(code)
    except Exception as e:
        print(f"[Main Setup] Error writing backend/memory_gateway.py: {e}")

from registry import agent_registry
from orchestrator.orchestrator import orchestrate
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(
    api_key=api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

# Inject client into all dynamically created agents
for agent_name, agent in agent_registry.items():
    agent.client = client

print("=== My AI Company Orchestrator ===")
print("Type 'exit' to quit.\n")

while True:
    user = input("\nYou: ")
    
    if user.lower() == "exit":
        print("Goodbye!")
        break
        
    if user.lower().startswith("/load "):
        filename = user[6:].strip()
        if os.path.exists(filename):
            print(f"[System] Loading prompt from {filename}...")
            with open(filename, "r", encoding="utf-8") as f:
                user = f.read()
        else:
            print(f"[Error] File '{filename}' not found.")
            continue

    reply = orchestrate(user)
    print(f"\nFinal Answer: {reply}")
