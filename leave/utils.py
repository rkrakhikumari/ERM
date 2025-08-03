def get_next_approver(current_level: str):
    if current_level == "Manager":
        return "hr"
    elif current_level == "hr":
        return "admin"
    return "final"