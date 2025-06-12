export const GAME_CONFIG = {
  MAX_ATTEMPTS: 5,
  TIME_LIMIT_SECONDS: 120,
  POLLING_INTERVAL: 1000,
} as const;

export const GAME_MESSAGES = {
  NEW_GAME_SUCCESS: "New game started! 🎨",
  CREATE_GAME_ERROR: "Failed to create game. Please try again.",
  SUBMIT_GUESS_ERROR: "Failed to submit guess. Please try again.",
} as const;

export const GAME_STATUS_LABELS = {
  active: "Playing",
  won: "Won!",
  lost: "Lost",
  timeout: "Time's Up!",
} as const;

export const GAME_STATUS_VARIANTS = {
  active: "default",
  won: "secondary",
  lost: "destructive",
  timeout: "outline",
} as const;
