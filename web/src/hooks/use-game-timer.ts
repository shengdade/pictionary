import { useEffect } from "react";

import type { Game } from "@/types/game";

import { GAME_CONFIG } from "@/lib/constants";

interface UseGameTimerProps {
  game: Game | null;
  setGame: React.Dispatch<React.SetStateAction<Game | null>>;
  fetchGameState: (gameId: string) => Promise<void>;
}

export const useGameTimer = ({ game, setGame, fetchGameState }: UseGameTimerProps) => {
  useEffect(() => {
    if (game?.status === "active" && game.timeLeft > 0) {
      const timer = setInterval(() => {
        setGame(prev => {
          if (!prev || prev.status !== "active") return prev;
          const newTimeLeft = Math.max(0, prev.timeLeft - 1);
          if (newTimeLeft === 0) {
            fetchGameState(prev.gameId);
          }
          return { ...prev, timeLeft: newTimeLeft };
        });
      }, GAME_CONFIG.POLLING_INTERVAL);

      return () => clearInterval(timer);
    }
  }, [game?.status, game?.timeLeft, fetchGameState, setGame]);
};
