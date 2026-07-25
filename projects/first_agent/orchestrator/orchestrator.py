from registry import agent_registry
from memory.database import save_conversation, get_conversation, clear_conversation

def orchestrate(user_request):
    manager = agent_registry.get("Manager")
    if not manager:
        return "Error: Manager agent not found in registry."

    print("\n[Orchestrator] Starting project execution...")
    
    # We clear previous conversation to start fresh for this project.
    # Alternatively, you can use unique session IDs. For simplicity, we clear.
    clear_conversation()
    save_conversation("User", "user", user_request)
    
    max_iterations = 20
    iteration = 0
    
    while iteration < max_iterations:
        iteration += 1
        
        # Load the whole history to pass to the Manager
        history = get_conversation()
        history_text = "\n".join([f"{row[1]} ({row[2]}): {row[3]}" for row in history])
        
        manager_prompt = (
            f"Here is the project history so far:\n{history_text}\n\n"
            "Based on the progress, what is the next step? "
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
                
                # We give the agent the task, plus the context of what has been done
                agent_prompt = f"Project History:\n{history_text}\n\nYour Task:\n{task}"
                
                agent_response = agent.chat(agent_prompt)
                
                print(f"[{agent_name}] {agent_response}")
                
                # Save the work to memory
                save_conversation(agent_name, "assistant", agent_response)
            else:
                print(f"[Orchestrator] Error: Manager requested unknown agent '{agent_name}'.")
                save_conversation("System", "error", f"Agent {agent_name} not found.")
        else:
            print("[Orchestrator] Manager did not return a valid format. Terminating loop.")
            return manager_response
            
    return "Project stopped: Maximum iterations reached."
