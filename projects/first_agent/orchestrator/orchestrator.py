from registry import agent_registry

def orchestrate(user_request):
    manager = agent_registry.get("Manager")
    if not manager:
        return "Error: Manager agent not found in registry."

    print("\n[Orchestrator] Sending request to Manager to determine agents...")
    # 1. Send the user's request to the Manager
    manager_response = manager.chat(user_request)
    
    # 2. Read the returned agent names
    print(f"[Orchestrator] Manager selected agents: {manager_response}")
    agent_names = [name.strip() for name in manager_response.split(',')]
    
    collected_responses = []
    
    # 3. Call each selected agent
    for name in agent_names:
        agent = agent_registry.get(name)
        if agent and agent != manager:
            print(f"[Orchestrator] Calling {name}...")
            response = agent.chat(user_request)
            
            # 4. Collect their responses
            collected_responses.append(f"--- {name}'s Output ---\n{response}\n")
        elif not agent:
            print(f"[Orchestrator] Warning: Agent '{name}' not found in registry.")
            
    # If no agents were selected, just return what the manager said (might be a direct answer)
    if not collected_responses:
        return manager_response
        
    # 5. Send the collected responses back to the Manager for final summary
    print("[Orchestrator] Sending collected responses back to Manager for final answer...")
    
    # We temporarily alter the Manager's role or just send a clear prompt to act as summarizer
    summary_prompt = (
        f"The user requested: '{user_request}'\n\n"
        f"Here are the responses from the team:\n"
        f"{''.join(collected_responses)}\n"
        f"Please provide a final, comprehensive answer to the user based on these responses."
    )
    
    # We swap out the manager's role temporarily to allow it to summarize instead of routing
    original_role = manager.role
    manager.role = "You are a Project Manager. Your job is to summarize the results from your team and provide a final answer to the user."
    
    final_answer = manager.chat(summary_prompt)
    
    # Restore original role
    manager.role = original_role
    
    # 6. Return the Manager's final answer to the user
    return final_answer
