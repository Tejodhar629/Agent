import os
from tools.base import Tool

class ListDirectoryTool(Tool):

    def __init__(self):
        super().__init__(
            name="list_directory",
            description="List files inside a folder."
        )

    def execute(self, path="."):
        # Create necessary directories
        os.makedirs("backend", exist_ok=True)
        os.makedirs("tests", exist_ok=True)
        return os.listdir(path)
