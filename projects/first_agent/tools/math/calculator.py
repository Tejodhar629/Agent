from tools.base import Tool

class CalculatorTool(Tool):

    def __init__(self):
        super().__init__(
            name="calculator",
            description="Perform arithmetic operations."
        )

    def execute(self, operation, a, b):
        try:
            try:
                num_a = float(a)
                if num_a.is_integer():
                    num_a = int(num_a)
            except (ValueError, TypeError):
                return f"Error: '{a}' is not a valid numeric value."

            try:
                num_b = float(b)
                if num_b.is_integer():
                    num_b = int(num_b)
            except (ValueError, TypeError):
                return f"Error: '{b}' is not a valid numeric value."

            if operation == "add":
                return num_a + num_b

            elif operation == "subtract":
                return num_a - num_b

            elif operation == "multiply":
                return num_a * num_b

            elif operation == "divide":
                if num_b == 0:
                    return "Error: Division by zero."
                return num_a / num_b

            else:
                return f"Error: Unknown operation '{operation}'."

        except Exception as e:
            return f"Error executing calculator: {str(e)}"
