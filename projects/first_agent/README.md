from openai import OpenAI
from dotenv import load_dotenv
import os
from tools.calculator import add, subtract, multiply, divide
from tools.file_writer import write_file
from tools.file_reader import read_file

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(
    api_key=api_key,
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
)

# This step is for single output i.e agent stop after one output
# user_input = input("You: ")
# response = client.chat.completions.create(
#     model="gemini-3.5-flash",
#     messages=[
#         {"role": "user", "content": user_input}
#     ]
# )

# print(response.choices[0].message.content)

conversation = []
<!-- available_functions = {
    "add": add,
    "subtract": subtract,
    "multiply": multiply,
    "divide": divide,
    "read_file": read_file,
    "write_file": write_file,
}
tools = [
    {
        "type": "function",
        "name": "add",
        "description": "Add two numbers",
        "parameters": {
            "type": "object",
            "properties": {
                "a": {"type": "number"},
                "b": {"type": "number"}
            },
            "required": ["a", "b"]
        }
    }
]
function_name = "add"

print(available_functions[function_name](5, 8)) -->

print("=== My First AI Agent ===")
print("Type 'exit' to quit.\n")

while True:

    user_input = input("You: ")

    if user_input.lower() == "exit":
        print("Goodbye!")
        break

    conversation.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
        model="gemini-3.5-flash",
        messages=conversation,
        tools=tools
    )
    answer = response.choices[0].message.content
    conversation.append({"role": "assistant", "content": answer})
    
    print("\nAgent:", answer)
print(conversation)

<!-- print(add(5, 8))

write_file(
    "hello.txt",
    "Hello World!"
)
print(read_file("hello.txt")) -->