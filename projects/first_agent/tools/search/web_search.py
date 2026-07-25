from tools.base import Tool

class WebSearchTool(Tool):
    def __init__(self):
        super().__init__(
            name="web_search",
            description="Search the web for information."
        )

    def execute(self, query):
        return f"Simulated web search results for: {query}"
