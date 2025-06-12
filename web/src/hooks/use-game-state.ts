import { useCallback, useState } from "react";
import { toast } from "sonner";

import type { Game, GameHistoryEntry } from "@/types/game";

import { ApiClient } from "@/lib/api-client";
import { GAME_MESSAGES } from "@/lib/constants";

export const useGameState = () => {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(false);
  const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);

  const fetchGameState = useCallback(async (gameId: string) => {
    try {
      const gameData = await ApiClient.getGameState(gameId);
      setGame(gameData);
    } catch (error) {
      console.error("Error fetching game state:", error);
    }
  }, []);

  const createNewGame = useCallback(async () => {
    setLoading(true);
    try {
      const newGame = await ApiClient.createGame();
      setGame(newGame);
      setGameHistory([]);
      toast.success(GAME_MESSAGES.NEW_GAME_SUCCESS);
    } catch (error) {
      toast.error(GAME_MESSAGES.CREATE_GAME_ERROR);
      console.error("Error creating game:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetGame = useCallback(() => {
    setGame(null);
    setGameHistory([]);
  }, []);

  return {
    game,
    setGame,
    loading,
    gameHistory,
    setGameHistory,
    fetchGameState,
    createNewGame,
    resetGame,
  };
};
