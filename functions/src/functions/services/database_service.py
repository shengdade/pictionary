from typing import Optional, Dict, Any
from datetime import datetime
from functions.config.database import games_table
from functions.models.game import GameData, GuessEntry


def save_game(game_data: GameData) -> None:
    """Save a game to the database."""
    games_table.put_item(Item=game_data.dict())


def get_game(game_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve a game from the database."""
    response = games_table.get_item(Key={"gameId": game_id})
    return response.get("Item")


def update_game_status(game_id: str, status: str, **kwargs) -> None:
    """Update game status and other fields."""
    update_expression = "SET #status = :status"
    expression_attribute_names = {"#status": "status"}
    expression_attribute_values = {":status": status}

    for key, value in kwargs.items():
        update_expression += f", {key} = :{key}"
        expression_attribute_values[f":{key}"] = value

    games_table.update_item(
        Key={"gameId": game_id},
        UpdateExpression=update_expression,
        ExpressionAttributeNames=expression_attribute_names,
        ExpressionAttributeValues=expression_attribute_values,
    )


def add_guess_to_game(game_id: str, guess: str, correct: bool, attempts: int) -> None:
    """Add a guess to the game's guess history."""
    guess_entry = GuessEntry(
        guess=guess, timestamp=datetime.utcnow().isoformat(), correct=correct
    )

    response = games_table.get_item(Key={"gameId": game_id})
    game = response.get("Item", {})
    guesses = game.get("guesses", [])
    guesses.append(guess_entry.dict())

    games_table.update_item(
        Key={"gameId": game_id},
        UpdateExpression="SET attempts = :attempts, guesses = :guesses",
        ExpressionAttributeValues={
            ":attempts": attempts,
            ":guesses": guesses,
        },
    )
