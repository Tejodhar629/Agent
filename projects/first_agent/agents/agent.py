from openai import OpenAI

class Agent:

    def __init__(self, name, role, client, tools=None):

        self.name = name
        self.role = role
        self.client = client
        self.tools = tools or []

        self.memory = []

    def chat(self, message):

        self.memory.append({
            "role": "user",
            "content": message
        })

        messages = [{"role": "system", "content": self.role}]
        messages.extend(self.memory)

        response = self.client.chat.completions.create(
            model="gemini-3.5-flash",
            messages=messages
        )

        answer = response.choices[0].message.content

        self.memory.append({
            "role": "assistant",
            "content": answer
        })

        return answer