from registry import agent_registry
from memory.database import save_conversation, get_conversation, clear_conversation
import sys

def orchestrate(user_request):
    manager = agent_registry.get("Manager")
    if not manager:
        return "Error: Manager agent not found in registry."

    print("\n[Orchestrator] Starting project execution...")
    
    iteration = 0
    max_iterations = 20
    
    # Check if the user wants to resume
    if user_request.strip().lower() == "/continue":
        print("[Orchestrator] Resuming previous project...")
        # Load history
        history = get_conversation()
        if not history:
            return "No previous project found to continue."
            
        last_row = history[-1]
        last_agent = last_row[1]
        last_output = last_row[3]
        iteration = 1 # Force start
    else:
        # Fresh project
        clear_conversation()
        save_conversation("User", "user", user_request)
    
    print("\n[Orchestrator] You can press Ctrl+C at any time to pause the project and type '/continue' later to resume.")
    
    while iteration < max_iterations:
        iteration += 1
        
        try:
            if iteration == 1 and user_request.strip().lower() != "/continue":
                manager_prompt = (
                    f"New Project Request: {user_request}\n\n"
                    "What is the first step? Reply in the format: AGENT_NAME|TASK_DESCRIPTION"
                )
            elif iteration == 1 and user_request.strip().lower() == "/continue":
                # We are resuming. Give the manager the full history so it catches up on what it missed.
                history = get_conversation()
                history_text = "\n".join([f"{row[1]} ({row[2]}): {row[3]}" for row in history])
                manager_prompt = (
                    f"We are resuming a paused project. Here is the entire history:\n{history_text}\n\n"
                    "Based on this progress, what is the next step? "
                    "Reply with exactly 'DONE' if the project is finished. "
                    "Otherwise, reply in the format: AGENT_NAME|TASK_DESCRIPTION"
                )
            else:
                manager_prompt = (
                    f"The last agent ({last_agent}) finished their task. Their output was:\n{last_output}\n\n"
                    "Based on this progress, what is the next step? "
                    "Reply with exactly 'DONE' if the project is finished. "
                    "Otherwise, reply in the format: AGENT_NAME|TASK_DESCRIPTION"
                )
            
            print("\n[Orchestrator] Asking Manager for next step...")
            manager_response = manager.chat(manager_prompt)
            print(f"[Manager] {manager_response}")
            
            if manager_response.strip() == "DONE":
                return "Project Completed Successfully!"
                
            if "|" in manager_response:
                agent_name, task = manager_response.split("|", 1)
                agent_name = agent_name.strip()
                task = task.strip()
                
                agent = agent_registry.get(agent_name)
                if agent:
                    print(f"[Orchestrator] Delegating to {agent_name}...")
                    
                    agent_prompt = f"Your Task:\n{task}"
                    if iteration > 1:
                         agent_prompt = f"Context from previous step ({last_agent}):\n{last_output}\n\n" + agent_prompt
                    
                    agent_response = agent.chat(agent_prompt)
                    
                    print(f"[{agent_name}] {agent_response}")
                    
                    save_conversation(agent_name, "assistant", agent_response)
                    
                    last_agent = agent_name
                    last_output = agent_response
                else:
                    print(f"[Orchestrator] Error: Manager requested unknown agent '{agent_name}'.")
                    save_conversation("System", "error", f"Agent {agent_name} not found.")
                    last_agent = "System"
                    last_output = f"Agent {agent_name} not found in registry."
            else:
                print("[Orchestrator] Manager did not return a valid format. Terminating loop.")
                return manager_response
                
        except KeyboardInterrupt:
            print("\n\n[Orchestrator] PAUSED BY USER. Type '/continue' to resume later.")
            return "Paused"
            
    return "Project stopped: Maximum iterations reached."
