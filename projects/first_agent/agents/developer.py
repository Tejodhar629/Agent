from tools.math.calculator import CalculatorTool
from tools.filesystem.read_file import ReadFileTool
from tools.filesystem.write_file import WriteFileTool
from agents.agent import Agent

developer = Agent(
    name="Developer",
    role="""
    You are a Senior Python Developer.

    Write clean Python code.

    Never perform market research.
    """,
    tools=[
        CalculatorTool(),
        ReadFileTool(),
        WriteFileTool()
    ],
    client=None
)