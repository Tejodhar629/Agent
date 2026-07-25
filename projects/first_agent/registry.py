from tools.filesystem.list_directory import ListDirectoryTool
from tools.math.calculator import CalculatorTool
from tools.filesystem.write_file import WriteFileTool
from tools.filesystem.read_file import ReadFileTool
from agents.manager import manager
from agents.developer import developer
from agents.researcher import researcher

agent_registry = {
    "Manager": manager,
    "Developer": developer,
    "Researcher": researcher
}
TOOLS = {
    "read_file": ReadFileTool(),
    "write_file": WriteFileTool(),
    "calculator": CalculatorTool(),
    "list_directory": ListDirectoryTool(),
}