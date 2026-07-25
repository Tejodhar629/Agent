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