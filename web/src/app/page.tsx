"use client";

import { Clock, Lightbulb, RefreshCw, Sparkles, Target, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

// Game types
interface Game {
  gameId: string;
  drawing?: string;
  status: "active" | "won" | "lost" | "timeout";
  score: number;
  attempts: number;
  maxAttempts: number;
  timeLeft: number;
  hint?: string;
  word?: string;
}

interface GuessResponse {
  correct: boolean;
  status: string;
  score?: number;
  attempts: number;
  maxAttempts?: number;
  word?: string;
  message: string;
  hint?: string;
}

interface GameHistoryEntry {
  guess: string;
  correct: boolean;
  timestamp: Date;
}

export default function Home() {
  const [game, setGame] = useState<Game | null>(null);
  const [guess, setGuess] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const fetchGameState = useCallback(
    async (gameId: string) => {
      try {
        const response = await fetch(`${API_URL}/api/game/${gameId}`);
        if (!response.ok) throw new Error("Failed to fetch game");

        const gameData = await response.json();
        setGame(gameData);
      } catch (error) {
        console.error("Error fetching game state:", error);
      }
    },
    [API_URL]
  );

  // Timer effect
  useEffect(() => {
    if (game?.status === "active" && game.timeLeft > 0) {
      const timer = setInterval(() => {
        setGame(prev => {
          if (!prev || prev.status !== "active") return prev;
          const newTimeLeft = Math.max(0, prev.timeLeft - 1);
          if (newTimeLeft === 0) {
            // Time's up - refetch game state
            fetchGameState(prev.gameId);
          }
          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [game?.status, game?.timeLeft, fetchGameState]);

  const createNewGame = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/game/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ difficulty: "easy" }),
      });

      if (!response.ok) throw new Error("Failed to create game");

      const newGame = await response.json();
      setGame(newGame);
      setGuess("");
      setGameHistory([]);
      toast.success("New game started! 🎨");
    } catch (error) {
      toast.error("Failed to create game. Please try again.");
      console.error("Error creating game:", error);
    } finally {
      setLoading(false);
    }
  };

  const submitGuess = async () => {
    if (!game || !guess.trim() || submitting) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/api/game/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gameId: game.gameId,
          guess: guess.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to submit guess");

      const result: GuessResponse = await response.json();

      // Update game state
      setGame(prev =>
        prev
          ? {
              ...prev,
              attempts: result.attempts,
              maxAttempts: result.maxAttempts || prev.maxAttempts,
              status: result.status as Game["status"],
              score: result.score || prev.score,
              hint: result.hint,
              word: result.word,
            }
          : null
      );

      // Add to history
      setGameHistory(prev => [
        ...prev,
        {
          guess: guess.trim(),
          correct: result.correct,
          timestamp: new Date(),
        },
      ]);

      // Show result
      if (result.correct) {
        toast.success(`🎉 ${result.message} Score: ${result.score}`);
      } else if (result.status === "lost") {
        toast.error(`💔 ${result.message}`);
      } else {
        toast.info(result.message);
      }

      setGuess("");
    } catch (error) {
      toast.error("Failed to submit guess. Please try again.");
      console.error("Error submitting guess:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusBadge = () => {
    if (!game) return null;

    const variants = {
      active: "default",
      won: "secondary",
      lost: "destructive",
      timeout: "outline",
    } as const;

    const labels = {
      active: "Playing",
      won: "Won!",
      lost: "Lost",
      timeout: "Time's Up!",
    };

    return <Badge variant={variants[game.status]}>{labels[game.status]}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 dark:from-purple-900 dark:via-blue-900 dark:to-cyan-900">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-8">
        {/* Header */}
        {!game && (
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">🎨 AI Pictionary</h1>
            <p className="text-lg text-muted-foreground">Can you guess what the AI is drawing?</p>
          </div>
        )}

        {/* Game Area */}
        <div className="w-full">
          {!game ? (
            // Start Game Screen
            <Card className="text-center p-8">
              <CardContent>
                <div className="space-y-6">
                  <div className="text-6xl">🎯</div>
                  <h2 className="text-2xl font-semibold">Ready to Play?</h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    The AI will draw a picture and you need to guess what it is. You have 5 attempts and 2 minutes to solve it!
                  </p>
                  <Button
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                    disabled={loading}
                    onClick={createNewGame}
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Creating Game...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Start New Game
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Game Interface
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Drawing Area */}
              <div className="md:col-span-2 w-full">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        🎨 AI Drawing
                        {getStatusBadge()}
                      </CardTitle>
                      <Button disabled={loading} onClick={createNewGame} size="sm" variant="outline">
                        <RefreshCw className="h-4 w-4 mr-1" />
                        New Game
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                      {game.drawing ? (
                        <div className="w-full flex items-center py-8 justify-center" dangerouslySetInnerHTML={{ __html: game.drawing }} />
                      ) : (
                        <div className="w-full aspect-square max-w-xs mx-auto flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p>AI is drawing...</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Game Info moved to sidebar */}

                    {/* Hint */}
                    {game.hint && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Hint:</p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-300">{game.hint}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Guess Input */}
                    {game.status === "active" && (
                      <div className="mt-4 space-y-3">
                        <div className="flex gap-2">
                          <Input
                            className="flex-1"
                            disabled={submitting}
                            onChange={e => setGuess(e.target.value)}
                            onKeyUp={e => {
                              if (e.key === "Enter") {
                                submitGuess();
                              }
                            }}
                            placeholder="Enter your guess..."
                            value={guess}
                          />
                          <Button
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            disabled={!guess.trim() || submitting}
                            onClick={submitGuess}
                          >
                            {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Guess"}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Game Over Message */}
                    {game.status !== "active" && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                        <div className="text-2xl mb-2">{game.status === "won" ? "🎉" : game.status === "timeout" ? "⏰" : "💔"}</div>
                        <h3 className="font-semibold text-lg mb-1">
                          {game.status === "won" ? "Congratulations!" : game.status === "timeout" ? "Time's Up!" : "Game Over"}
                        </h3>
                        {game.word && (
                          <p className="text-muted-foreground">
                            The word was: <span className="font-semibold text-foreground">{game.word}</span>
                          </p>
                        )}
                        {game.status === "won" && <p className="text-green-600 dark:text-green-400 mt-1">Final Score: {game.score} points</p>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 w-full">
                {/* Game Stats always at the top of sidebar */}
                {game && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Game Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Time Left:</span>
                          <span className="font-mono text-base font-semibold">{formatTime(game.timeLeft)}</span>
                        </div>
                        <Progress className="h-2" value={(game.timeLeft / 120) * 100} />
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Attempts:</span>
                          <span className="font-mono text-base font-semibold">
                            {game.attempts}/{game.maxAttempts}
                          </span>
                        </div>
                        <Progress className="h-2" value={((game.maxAttempts - game.attempts) / game.maxAttempts) * 100} />
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Score:</span>
                          <span className="font-mono text-base font-semibold">{game.score}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Guess History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Your Guesses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {gameHistory.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No guesses yet</p>
                      ) : (
                        gameHistory.map((entry, index) => (
                          <div className="flex items-center gap-2 text-sm" key={index}>
                            <div className={`w-2 h-2 rounded-full ${entry.correct ? "bg-green-500" : "bg-red-500"}`} />
                            <span className={entry.correct ? "font-semibold text-green-600" : ""}>{entry.guess}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* How to Play - concise sentence at the bottom */}
                <div className="text-xs text-muted-foreground text-center pt-2">Guess what the AI is drawing. You have 5 attempts and 2 minutes!</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
