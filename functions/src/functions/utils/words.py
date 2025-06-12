import random

GAME_WORDS = [
    "cat",
    "dog",
    "house",
    "tree",
    "car",
    "sun",
    "moon",
    "star",
    "fish",
    "bird",
    "apple",
    "banana",
    "flower",
    "mountain",
    "ocean",
    "book",
    "phone",
    "computer",
    "guitar",
    "piano",
    "bicycle",
    "airplane",
    "train",
    "boat",
    "elephant",
    "lion",
    "butterfly",
    "rainbow",
    "clock",
    "cake",
    "pizza",
    "ice cream",
    "football",
    "basketball",
    "tennis",
    "swimming",
    "running",
    "dancing",
    "singing",
    "painting",
    "reading",
    "writing",
    "cooking",
    "gardening",
    "shopping",
    "traveling",
    "camping",
    "beach",
    "forest",
    "desert",
    "city",
    "village",
    "bridge",
    "castle",
    "tower",
]


def get_random_word() -> str:
    """Get a random word from the game words database."""
    return random.choice(GAME_WORDS)


def get_word_category(word: str) -> str:
    """Simple categorization of words."""
    animals = ["cat", "dog", "fish", "bird", "elephant", "lion", "butterfly"]
    objects = ["house", "car", "book", "phone", "computer", "guitar", "piano", "clock"]
    nature = ["tree", "sun", "moon", "star", "mountain", "ocean", "flower", "rainbow"]
    food = ["apple", "banana", "cake", "pizza", "ice cream"]

    if word in animals:
        return "animal"
    elif word in objects:
        return "object"
    elif word in nature:
        return "natural thing"
    elif word in food:
        return "food"
    else:
        return "thing"
