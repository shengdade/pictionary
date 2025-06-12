def calculate_score(attempts: int, time_taken: int, max_time: int) -> int:
    """Calculate score based on attempts and time."""
    base_score = 100
    attempt_penalty = attempts * 10
    time_bonus = max(0, (max_time - time_taken) // 10)
    return max(10, base_score - attempt_penalty + time_bonus)
