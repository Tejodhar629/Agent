from registry import agent_registry
from memory.database import save_conversation, get_conversation, clear_conversation
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed

def delegate_task(agent, agent_name, task, iteration, last_outputs_str):
    agent_prompt = f"Your Task:\n{task}"
    if iteration > 1:
        agent_prompt = f"Context from previous step(s):\n{last_outputs_str}\n\n" + agent_prompt
        
    print(f"[Orchestrator] Delegating to {agent_name} in parallel...")
    agent_response = agent.chat(agent_prompt)
    print(f"[{agent_name}] {agent_response}")
    return agent_name, agent_response

def orchestrate(user_request):
    manager = agent_registry.get("Manager")
    if not manager:
        return "Error: Manager agent not found in registry."

    print("\n[Orchestrator] Starting project execution...")
    
    iteration = 0
    max_iterations = 20
    last_outputs_str = ""
    
    # Check if the user wants to resume
    if user_request.strip().lower() == "/continue":
        print("[Orchestrator] Resuming previous project...")
        history = get_conversation()
        if not history:
            return "No previous project found to continue."
            
        last_row = history[-1]
        last_outputs_str = f"{last_row[1]}: {last_row[3]}"
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
                    "What is the first step? Reply with one or multiple lines in the format: AGENT_NAME|TASK_DESCRIPTION"
                )
            elif iteration == 1 and user_request.strip().lower() == "/continue":
                history = get_conversation()
                history_text = "\n".join([f"{row[1]} ({row[2]}): {row[3]}" for row in history])
                manager_prompt = (
                    f"We are resuming a paused project. Here is the entire history:\n{history_text}\n\n"
                    "Based on this progress, what is the next step? "
                    "Reply with exactly 'DONE' if finished, or assign tasks (AGENT|TASK)."
                )
            else:
                manager_prompt = (
                    f"The last parallel tasks finished. Their outputs were:\n{last_outputs_str}\n\n"
                    "Based on this progress, what is the next step? "
                    "Reply with exactly 'DONE' if finished, or assign tasks (AGENT|TASK)."
                )
            
            print("\n[Orchestrator] Asking Manager for next step...")
            manager_response = manager.chat(manager_prompt)
            print(f"[Manager] {manager_response}")
            
            if manager_response.strip() == "DONE":
                return "Project Completed Successfully!"
                
            assignments = []
            for line in manager_response.splitlines():
                if "|" in line:
                    parts = line.split("|", 1)
                    assignments.append((parts[0].strip(), parts[1].strip()))
            
            if not assignments:
                print("[Orchestrator] Manager did not return a valid format. Terminating loop.")
                return manager_response
                
            # Execute tasks in parallel
            parallel_outputs = []
            with ThreadPoolExecutor(max_workers=5) as executor:
                futures = []
                for agent_name, task in assignments:
                    agent = agent_registry.get(agent_name)
                    if agent:
                        futures.append(executor.submit(delegate_task, agent, agent_name, task, iteration, last_outputs_str))
                    else:
                        print(f"[Orchestrator] Error: Unknown agent '{agent_name}'.")
                        save_conversation("System", "error", f"Agent {agent_name} not found.")
                        parallel_outputs.append(f"System: Agent {agent_name} not found.")
                
                # Wait for all threads to finish and collect results sequentially
                for future in as_completed(futures):
                    agent_name, agent_response = future.result()
                    save_conversation(agent_name, "assistant", agent_response)
                    parallel_outputs.append(f"{agent_name}: {agent_response}")
            
            last_outputs_str = "\n---\n".join(parallel_outputs)
                
        except KeyboardInterrupt:
            print("\n\n[Orchestrator] PAUSED BY USER. Type '/continue' to resume later.")
            return "Paused"
            
    return "Project stopped: Maximum iterations reached."
