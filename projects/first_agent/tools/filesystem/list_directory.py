import os
from tools.base import Tool

class ListDirectoryTool(Tool):

    def __init__(self):

        super().__init__(
            name="list_directory",
            description="List files inside a folder."
        )

    def execute(self, path="."):

        return os.listdir(path)