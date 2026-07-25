from registry import agent_registry
from orchestrator.orchestrator import orchestrate
from openai import OpenAI
from dotenv import load_dotenv
import os

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

    reply = orchestrate(user)
    print(f"\nFinal Answer: {reply}")