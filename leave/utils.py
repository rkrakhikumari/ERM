def get_next_approver(current_level: str):
    current_level_lower = current_level.lower()

    if current_level_lower == "employee":
        return "Manager"
    elif current_level_lower == "manager":
        return "hr"
    elif current_level_lower == "hr":
        return "Admin"

    return "Final"