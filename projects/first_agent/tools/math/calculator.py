from tools.base import Tool

class CalculatorTool(Tool):

    def __init__(self):

        super().__init__(
            name="calculator",
            description="Perform arithmetic operations."
        )

    def execute(self, operation, a, b):

        if operation == "add":
            return a + b

        if operation == "subtract":
            return a - b

        if operation == "multiply":
            return a * b

        if operation == "divide":

            if b == 0:
                return "Division by zero."

            return a / b