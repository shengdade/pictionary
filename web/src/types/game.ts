export interface Game {
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

export interface GuessResponse {
  correct: boolean;
  status: string;
  score?: number;
  attempts: number;
  maxAttempts?: number;
  word?: string;
  message: string;
  hint?: string;
}

export interface GameHistoryEntry {
  guess: string;
  correct: boolean;
  timestamp: Date;
}

export interface SubmitGuessRequest {
  gameId: string;
  guess: string;
}
