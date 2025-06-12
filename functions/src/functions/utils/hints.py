from typing import Optional
from functions.utils.words import get_word_category


def get_hint(word: str, attempts: int) -> Optional[str]:
    """Generate progressive hints based on attempts."""
    if attempts >= 4:
        return f"It's a {get_word_category(word)}"
    elif attempts >= 3:
        return f"It starts with '{word[0].upper()}'"
    elif attempts >= 2:
        return f"This word has {len(word)} letters"
    return None
