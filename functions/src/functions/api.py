from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import boto3
from sst import Resource
import json
import uuid
from datetime import datetime, timedelta
import random
from typing import Optional, List
import openai

# Initialize FastAPI app
app = FastAPI(title="AI Pictionary Game API", version="2.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DynamoDB
dynamodb = boto3.resource("dynamodb")
table_name = Resource.GameTable.name
table = dynamodb.Table(table_name)

# Initialize OpenAI client
openai_client = openai.OpenAI(
    api_key=Resource.OpenAIApiKey.value,
    base_url="https://gateway.ai.cloudflare.com/v1/c5b793f894444f1cc7aaac929176106d/pictionary/openai",
)

# Game words database
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


# Pydantic models
class GameCreate(BaseModel):
    difficulty: str = "easy"


class GuessSubmit(BaseModel):
    gameId: str
    guess: str


class GameResponse(BaseModel):
    gameId: str
    word: str
    drawing: str
    status: str
    score: int
    attempts: int
    maxAttempts: int
    timeLeft: int
    hint: Optional[str] = None


# Game logic functions
def get_random_word():
    return random.choice(GAME_WORDS)


def generate_ai_drawing(word: str) -> str:
    """Generate an SVG drawing using OpenAI for the given word"""
    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI that creates simple SVG drawings for a Pictionary game. Create a simple, clear SVG that represents the given word. The SVG should be 400x400 pixels and use basic shapes and lines. Return ONLY the SVG code, no explanations.",
                },
                {
                    "role": "user",
                    "content": f"Draw a simple SVG representation of: {word}",
                },
            ],
            temperature=0.7,
            max_tokens=1000,
        )

        svg_content = response.choices[0].message.content.strip()

        # Ensure it's proper SVG format
        if not svg_content.startswith("<svg"):
            svg_content = f'<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">{svg_content}</svg>'

        return svg_content
    except Exception as e:
        print(e)
        # Fallback simple SVG if OpenAI fails
        return f"""<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="380" height="380" fill="none" stroke="black" stroke-width="2"/>
            <text x="200" y="200" text-anchor="middle" font-size="20" fill="black">AI Drawing</text>
            <text x="200" y="230" text-anchor="middle" font-size="16" fill="gray">Word: {word}</text>
        </svg>"""


def get_hint(word: str, attempts: int) -> Optional[str]:
    """Generate progressive hints based on attempts"""
    if attempts >= 4:
        return f"It's a {get_word_category(word)}"
    elif attempts >= 3:
        return f"It starts with '{word[0].upper()}'"
    elif attempts >= 2:
        return f"This word has {len(word)} letters"
    return None


def get_word_category(word: str) -> str:
    """Simple categorization of words"""
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


def calculate_score(attempts: int, time_taken: int, max_time: int) -> int:
    """Calculate score based on attempts and time"""
    base_score = 100
    attempt_penalty = attempts * 10
    time_bonus = max(0, (max_time - time_taken) // 10)
    return max(10, base_score - attempt_penalty + time_bonus)


# API Routes
@app.get("/")
async def root():
    return {"message": "AI Pictionary Game API", "version": "2.0.0"}


@app.post("/api/game/create")
async def create_game(game_data: GameCreate):
    """Create a new game session"""
    try:
        game_id = str(uuid.uuid4())
        word = get_random_word()

        # Generate AI drawing
        drawing = generate_ai_drawing(word)

        game = {
            "gameId": game_id,
            "word": word,
            "drawing": drawing,
            "status": "active",
            "score": 0,
            "attempts": 0,
            "maxAttempts": 5,
            "startTime": datetime.utcnow().isoformat(),
            "timeLimit": 120,  # 2 minutes
            "difficulty": game_data.difficulty,
            "guesses": [],
        }

        # Save to DynamoDB
        table.put_item(Item=game)

        # Don't reveal the word to the client
        response_game = game.copy()
        response_game.pop("word")
        response_game["timeLeft"] = game["timeLimit"]
        return response_game

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create game: {str(e)}")


@app.get("/api/game/{game_id}")
async def get_game(game_id: str):
    """Get current game state"""
    try:
        response = table.get_item(Key={"gameId": game_id})

        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Game not found")

        game = response["Item"]

        # Calculate time left
        start_time = datetime.fromisoformat(game["startTime"])
        elapsed = (datetime.utcnow() - start_time).total_seconds()
        time_left = max(0, game["timeLimit"] - int(elapsed))

        # Check if time expired
        if time_left == 0 and game["status"] == "active":
            game["status"] = "timeout"
            table.update_item(
                Key={"gameId": game_id},
                UpdateExpression="SET #status = :status",
                ExpressionAttributeNames={"#status": "status"},
                ExpressionAttributeValues={":status": "timeout"},
            )

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

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get game: {str(e)}")


@app.post("/api/game/guess")
async def submit_guess(guess_data: GuessSubmit):
    """Submit a guess for the game"""
    try:
        # Get current game
        response = table.get_item(Key={"gameId": guess_data.gameId})

        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Game not found")

        game = response["Item"]

        if game["status"] != "active":
            raise HTTPException(status_code=400, detail="Game is not active")

        # Check time limit
        start_time = datetime.fromisoformat(game["startTime"])
        elapsed = (datetime.utcnow() - start_time).total_seconds()

        if elapsed > game["timeLimit"]:
            # Update game status to timeout
            table.update_item(
                Key={"gameId": guess_data.gameId},
                UpdateExpression="SET #status = :status",
                ExpressionAttributeNames={"#status": "status"},
                ExpressionAttributeValues={":status": "timeout"},
            )
            raise HTTPException(status_code=400, detail="Time limit exceeded")

        # Process guess
        guess = guess_data.guess.lower().strip()
        correct_word = game["word"].lower()
        attempts = game["attempts"] + 1

        # Add guess to history
        guesses = game.get("guesses", [])
        guesses.append(
            {
                "guess": guess_data.guess,
                "timestamp": datetime.utcnow().isoformat(),
                "correct": guess == correct_word,
            }
        )

        if guess == correct_word:
            # Correct guess!
            score = calculate_score(attempts, int(elapsed), game["timeLimit"])

            table.update_item(
                Key={"gameId": guess_data.gameId},
                UpdateExpression="SET #status = :status, score = :score, attempts = :attempts, guesses = :guesses",
                ExpressionAttributeNames={"#status": "status"},
                ExpressionAttributeValues={
                    ":status": "won",
                    ":score": score,
                    ":attempts": attempts,
                    ":guesses": guesses,
                },
            )

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
            table.update_item(
                Key={"gameId": guess_data.gameId},
                UpdateExpression="SET #status = :status, attempts = :attempts, guesses = :guesses",
                ExpressionAttributeNames={"#status": "status"},
                ExpressionAttributeValues={
                    ":status": "lost",
                    ":attempts": attempts,
                    ":guesses": guesses,
                },
            )

            return {
                "correct": False,
                "status": "lost",
                "attempts": attempts,
                "word": game["word"],
                "message": f"Game over! The word was '{game['word']}'",
            }

        else:
            # Wrong guess, continue game
            table.update_item(
                Key={"gameId": guess_data.gameId},
                UpdateExpression="SET attempts = :attempts, guesses = :guesses",
                ExpressionAttributeValues={":attempts": attempts, ":guesses": guesses},
            )

            return {
                "correct": False,
                "status": "active",
                "attempts": attempts,
                "maxAttempts": game["maxAttempts"],
                "hint": get_hint(game["word"], attempts),
                "message": f"Try again! {game['maxAttempts'] - attempts} attempts left.",
            }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to process guess: {str(e)}"
        )


@app.get("/api/game/{game_id}/history")
async def get_game_history(game_id: str):
    """Get game guess history"""
    try:
        response = table.get_item(Key={"gameId": game_id})

        if "Item" not in response:
            raise HTTPException(status_code=404, detail="Game not found")

        game = response["Item"]
        return {
            "gameId": game_id,
            "guesses": game.get("guesses", []),
            "word": (
                game["word"] if game["status"] in ["won", "lost", "timeout"] else None
            ),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to get game history: {str(e)}"
        )


# Handler for AWS Lambda
from mangum import Mangum

handler = Mangum(app)
