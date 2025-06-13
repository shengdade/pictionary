import posthog from "posthog-js";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { Game, GameHistoryEntry, GuessResponse } from "@/types/game";

import { ApiClient } from "@/lib/api-client";
import { GAME_MESSAGES } from "@/lib/constants";

interface UseGuessSubmissionProps {
  game: Game | null;
  setGame: React.Dispatch<React.SetStateAction<Game | null>>;
  setGameHistory: React.Dispatch<React.SetStateAction<GameHistoryEntry[]>>;
}

export const useGuessSubmission = ({ game, setGame, setGameHistory }: UseGuessSubmissionProps) => {
  const [submitting, setSubmitting] = useState(false);

  const submitGuess = useCallback(
    async (guess: string) => {
      if (!game || !guess.trim() || submitting) return;

      setSubmitting(true);
      try {
        const result: GuessResponse = await ApiClient.submitGuess({
          gameId: game.gameId,
          guess: guess.trim(),
        });

        // Track guess submission
        posthog.capture("guess_submitted", {
          gameId: game.gameId,
          guess: guess.trim(),
          guessNumber: result.attempts,
          correct: result.correct,
          gameStatus: result.status,
          timeRemaining: game.timeLeft,
          guessLength: guess.trim().length,
          hasNumbers: /\d/.test(guess.trim()),
          hasSpecialChars: /[^a-zA-Z0-9\s]/.test(guess.trim()),
          wordCount: guess.trim().split(" ").length,
          timestamp: new Date().toISOString(),
        });

        // Track game completion events
        if (result.status === "won") {
          posthog.capture("game_won", {
            gameId: game.gameId,
            finalScore: result.score,
            attempts: result.attempts,
            word: result.word,
            timestamp: new Date().toISOString(),
          });
        } else if (result.status === "lost") {
          posthog.capture("game_lost", {
            gameId: game.gameId,
            finalAttempts: result.attempts,
            word: result.word,
            reason: "max_attempts_reached",
            timestamp: new Date().toISOString(),
          });
        } else if (result.status === "timeout") {
          posthog.capture("game_timeout", {
            gameId: game.gameId,
            attempts: result.attempts,
            word: result.word,
            timestamp: new Date().toISOString(),
          });
        }

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

        setGameHistory(prev => [
          ...prev,
          {
            guess: guess.trim(),
            correct: result.correct,
            timestamp: new Date(),
          },
        ]);

        if (result.correct) {
          toast.success(`🎉 ${result.message} Score: ${result.score}`);
        } else if (result.status === "lost") {
          toast.error(`💔 ${result.message}`);
        } else {
          toast.info(result.message);
        }
      } catch (error) {
        // Track guess submission failure
        posthog.capture("guess_submission_failed", {
          gameId: game.gameId,
          guess: guess.trim(),
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        });
        toast.error(GAME_MESSAGES.SUBMIT_GUESS_ERROR);
        console.error("Error submitting guess:", error);
      } finally {
        setSubmitting(false);
      }
    },
    [game, submitting, setGame, setGameHistory]
  );

  return {
    submitting,
    submitGuess,
  };
};
