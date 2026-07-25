from agents.manager import manager
from agents.researcher import researcher
from agents.developer import developer
from orchestrator.orchestrator import orchestrate
from openai import OpenAI
from dotenv import load_dotenv
import os
from tools.calculator import add, subtract, multiply, divide
from tools.file_writer import write_file
from tools.file_reader import read_file

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(
    api_key=api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

developer.client = client
manager.client = client
researcher.client = client

# Available tools 
available_functions = {
    "add": add,
    "subtract": subtract,
    "multiply": multiply,
    "divide": divide,
    "read_file": read_file,
    "write_file": write_file,
}
tools = [
    {
        "type": "function",
        "name": "add",
        "description": "Add two numbers",
        "parameters": {
            "type": "object",
            "properties": {
                "a": {"type": "number"},
                "b": {"type": "number"}
            },
            "required": ["a", "b"]
        }
    }
]

print("=== My AI Company Orchestrator ===")
print("Type 'exit' to quit.\n")

while True:
    user = input("\nYou: ")
    
    if user.lower() == "exit":
        print("Goodbye!")
        break

    reply = orchestrate(user)
    print(f"\nFinal Answer: {reply}")