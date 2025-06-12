"use client";

import { GameBoard } from "@/components/game/game-board";
import { GameOverMessage } from "@/components/game/game-over-message";
import { GameStats } from "@/components/game/game-stats";
import { GuessHistory } from "@/components/game/guess-history";
import { GuessInput } from "@/components/game/guess-input";
import { StartGameScreen } from "@/components/game/start-game-screen";
import { useGameState } from "@/hooks/use-game-state";
import { useGameTimer } from "@/hooks/use-game-timer";
import { useGuessSubmission } from "@/hooks/use-guess-submission";

export default function Home() {
  const { game, setGame, loading, gameHistory, setGameHistory, fetchGameState, createNewGame } = useGameState();

  const { submitting, submitGuess } = useGuessSubmission({
    game,
    setGame,
    setGameHistory,
  });

  useGameTimer({ game, setGame, fetchGameState });

  if (!game) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 dark:from-purple-900 dark:via-blue-900 dark:to-cyan-900">
        <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-8">
          <StartGameScreen loading={loading} onCreateNewGame={createNewGame} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100 dark:from-purple-900 dark:via-blue-900 dark:to-cyan-900">
      <div className="w-full max-w-4xl mx-auto px-2 sm:px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 w-full">
            <GameBoard game={game} loading={loading} onNewGame={createNewGame} />

            {game.status === "active" && <GuessInput onSubmitGuess={submitGuess} submitting={submitting} />}

            {game.status !== "active" && <GameOverMessage game={game} />}
          </div>

          <div className="space-y-4 w-full">
            <GameStats game={game} />
            <GuessHistory gameHistory={gameHistory} />
            <div className="text-xs text-muted-foreground text-center pt-2">Guess what the AI is drawing. You have 5 attempts and 2 minutes!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
