from tools.base import Tool


class ReadFileTool(Tool):

    def __init__(self):
        super().__init__(
            name="read_file",
            description="Read a text file."
        )

    def execute(self, filename):

        with open(filename, "r", encoding="utf8") as f:
            return f.read()