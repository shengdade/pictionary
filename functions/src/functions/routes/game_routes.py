from fastapi import APIRouter, HTTPException
from functions.models.game import GuessSubmit
from functions.services.game_service import (
    create_new_game,
    get_game_state,
    process_guess,
    get_game_history,
)

router = APIRouter(prefix="/api/game", tags=["game"])


@router.post("/create")
async def create_game():
    """Create a new game session."""
    try:
        return create_new_game()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create game: {str(e)}")


@router.get("/{game_id}")
async def get_game(game_id: str):
    """Get current game state."""
    try:
        return get_game_state(game_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get game: {str(e)}")


@router.post("/guess")
async def submit_guess(guess_data: GuessSubmit):
    """Submit a guess for the game."""
    try:
        return process_guess(guess_data)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process guess: {str(e)}"
        )


@router.get("/{game_id}/history")
async def get_game_guess_history(game_id: str):
    """Get game guess history."""
    try:
        return get_game_history(game_id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get game history: {str(e)}"
        )
