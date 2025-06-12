import type { Game, GuessResponse, SubmitGuessRequest } from "@/types/game";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export class ApiClient {
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  static async createGame(): Promise<Game> {
    const response = await fetch(`${API_URL}/api/game/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    return this.handleResponse<Game>(response);
  }

  static async getGameState(gameId: string): Promise<Game> {
    const response = await fetch(`${API_URL}/api/game/${gameId}`);
    return this.handleResponse<Game>(response);
  }

  static async submitGuess(request: SubmitGuessRequest): Promise<GuessResponse> {
    const response = await fetch(`${API_URL}/api/game/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return this.handleResponse<GuessResponse>(response);
  }
}
