import uuid
from datetime import datetime
from typing import Dict, Any
from fastapi import HTTPException

from functions.models.game import GameData, GuessSubmit
from functions.utils.words import get_random_word
from functions.utils.hints import get_hint
from functions.utils.scoring import calculate_score
from functions.config.settings import settings
from functions.services.drawing_service import generate_ai_drawing
from functions.services.database_service import (
    save_game,
    get_game,
    update_game_status,
    add_guess_to_game,
)


def create_new_game() -> Dict[str, Any]:
    """Create a new game session."""
    game_id = str(uuid.uuid4())
    word = get_random_word()
    drawing = generate_ai_drawing(word)

    game_data = GameData(
        gameId=game_id,
        word=word,
        drawing=drawing,
        status="active",
        score=0,
        attempts=0,
        maxAttempts=settings.MAX_ATTEMPTS,
        startTime=datetime.utcnow().isoformat(),
        timeLimit=settings.TIME_LIMIT_SECONDS,
        guesses=[],
    )

    save_game(game_data)

    # Return response without revealing the word
    response = game_data.dict()
    response.pop("word")
    response["timeLeft"] = game_data.timeLimit
    return response


def get_game_state(game_id: str) -> Dict[str, Any]:
    """Get current game state."""
    game = get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    # Calculate time left
    start_time = datetime.fromisoformat(game["startTime"])
    elapsed = (datetime.utcnow() - start_time).total_seconds()
    time_left = max(0, game["timeLimit"] - int(elapsed))

    # Check if time expired
    if time_left == 0 and game["status"] == "active":
        update_game_status(game_id, "timeout")
        game["status"] = "timeout"

    response_game = {
        "gameId": game["gameId"],
        "drawing": game["drawing"],
        "status": game["status"],
        "score": game["score"],
        "attempts": game["attempts"],
        "maxAttempts": game["maxAttempts"],
        "timeLeft": time_left,
        "hint": (
            get_hint(game["word"], game["attempts"])
            if game["status"] == "active"
            else None
        ),
    }

    # Include word if game is over
    if game["status"] in ["won", "lost", "timeout"]:
        response_game["word"] = game["word"]

    return response_game


def process_guess(guess_request: GuessSubmit) -> Dict[str, Any]:
    """Process a player's guess."""
    game = get_game(guess_request.gameId)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    if game["status"] != "active":
        raise HTTPException(status_code=400, detail="Game is not active")

    # Check time limit
    start_time = datetime.fromisoformat(game["startTime"])
    elapsed = (datetime.utcnow() - start_time).total_seconds()

    if elapsed > game["timeLimit"]:
        update_game_status(guess_request.gameId, "timeout")
        raise HTTPException(status_code=400, detail="Time limit exceeded")

    # Process guess
    guess = guess_request.guess.lower().strip()
    correct_word = game["word"].lower()
    attempts = game["attempts"] + 1

    if guess == correct_word:
        # Correct guess!
        score = calculate_score(attempts, int(elapsed), game["timeLimit"])
        update_game_status(guess_request.gameId, "won", score=score)
        add_guess_to_game(guess_request.gameId, guess_request.guess, True, attempts)

        return {
            "correct": True,
            "status": "won",
            "score": score,
            "attempts": attempts,
            "word": game["word"],
            "message": "Congratulations! You guessed it!",
        }

    elif attempts >= game["maxAttempts"]:
        # Game over - too many attempts
        update_game_status(guess_request.gameId, "lost")
        add_guess_to_game(guess_request.gameId, guess_request.guess, False, attempts)

        return {
            "correct": False,
            "status": "lost",
            "attempts": attempts,
            "word": game["word"],
            "message": f"Game over! The word was '{game['word']}'",
        }

    else:
        # Wrong guess, continue game
        add_guess_to_game(guess_request.gameId, guess_request.guess, False, attempts)

        return {
            "correct": False,
            "status": "active",
            "attempts": attempts,
            "maxAttempts": game["maxAttempts"],
            "hint": get_hint(game["word"], attempts),
            "message": f"Try again! {game['maxAttempts'] - attempts} attempts left.",
        }


def get_game_history(game_id: str) -> Dict[str, Any]:
    """Get game guess history."""
    game = get_game(game_id)
    if not game:
        raise HTTPException(status_code=404, detail="Game not found")

    return {
        "gameId": game_id,
        "guesses": game.get("guesses", []),
        "word": game["word"] if game["status"] in ["won", "lost", "timeout"] else None,
    }
