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
