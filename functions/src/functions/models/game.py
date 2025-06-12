from pydantic import BaseModel
from typing import List


class GuessSubmit(BaseModel):
    gameId: str
    guess: str


class GuessEntry(BaseModel):
    guess: str
    timestamp: str
    correct: bool


class GameData(BaseModel):
    gameId: str
    word: str
    drawing: str
    status: str
    score: int
    attempts: int
    maxAttempts: int
    startTime: str
    timeLimit: int
    guesses: List[GuessEntry] = []
