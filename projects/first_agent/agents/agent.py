import inspect
import json
from openai import OpenAI

class Agent:

    def __init__(self, name, role, client, tools=None):
        self.name = name
        self.role = role
        self.client = client
        self.tools = tools or []
        self.memory = []
        
        # Build tool schemas automatically based on execute method signatures
        self.openai_tools = []
        self.tool_map = {}
        for tool in self.tools:
            self.tool_map[tool.name] = tool
            sig = inspect.signature(tool.execute)
            props = {}
            required = []
            for param_name, param in sig.parameters.items():
                if param_name in ("self", "kwargs", "args"): continue
                props[param_name] = {"type": "string"}
                if param.default == inspect.Parameter.empty:
                    required.append(param_name)
                    
            self.openai_tools.append({
                "type": "function",
                "function": {
                    "name": tool.name,
                    "description": getattr(tool, "description", f"Execute {tool.name}"),
                    "parameters": {
                        "type": "object",
                        "properties": props,
                        "required": required
                    }
                }
            })

    def chat(self, message):
        self.memory.append({
            "role": "user",
            "content": message
        })

        while True:
            messages = [{"role": "system", "content": self.role}]
            messages.extend(self.memory)
            
            kwargs = {
                # "model": "gemini-3.1-pro-preview",
                "model": "gemini-3.1-flash-lite",
                # "model": "gemini-1.5-pro",
                "messages": messages
            }
            if self.openai_tools:
                kwargs["tools"] = self.openai_tools

            try:
                response = self.client.chat.completions.create(**kwargs)
                message_obj = response.choices[0].message
            except Exception as e:
                error_msg = f"[API Error in agent '{self.name}']: {str(e)}"
                print(f"\n{error_msg}")
                return error_msg
            
            # If the model didn't call any tools, we are done
            if not getattr(message_obj, "tool_calls", None):
                answer = message_obj.content
                self.memory.append({
                    "role": "assistant",
                    "content": answer
                })
                return answer
                
            # If the model called tools, execute them and loop
            tool_calls = message_obj.tool_calls
            
            # OpenAI requires appending the assistant's tool_call message first
            self.memory.append(message_obj)
            
            for tool_call in tool_calls:
                func_name = tool_call.function.name
                try:
                    args = json.loads(tool_call.function.arguments)
                except:
                    args = {}
                    
                if func_name in self.tool_map:
                    print(f"    [{self.name}] Executing tool '{func_name}'...")
                    try:
                        result = str(self.tool_map[func_name].execute(**args))
                    except Exception as e:
                        result = f"Error executing tool: {e}"
                else:
                    result = f"Error: Tool {func_name} not found."
                    
                self.memory.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": func_name,
                    "content": result
                })