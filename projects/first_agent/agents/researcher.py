from tools.search.web_search import WebSearchTool
from tools.filesystem.read_file import ReadFileTool
from agents.agent import Agent

researcher = Agent(
    name="Researcher",
    role="""
You are a Research Analyst.

Gather information.

Never write production code.
""",
    tools=[
        WebSearchTool(),
        ReadFileTool()
    ],
    client=None
)