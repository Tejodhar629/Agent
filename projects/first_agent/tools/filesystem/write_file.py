import os
from tools.base import Tool

class WriteFileTool(Tool):

    def __init__(self):
        super().__init__(
            name="write_file",
            description="Write text to a file."
        )

    def execute(self, filename, content):
        # Automatically create directory structure if it doesn't exist
        dir_name = os.path.dirname(filename)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)

        with open(filename, "w", encoding="utf8") as f:
            f.write(content)

        return "File written."
