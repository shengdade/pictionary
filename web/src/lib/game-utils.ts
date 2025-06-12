export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const getProgressPercentage = (current: number, total: number): number => {
  return Math.max(0, Math.min(100, (current / total) * 100));
};

export const getTimeProgressPercentage = (timeLeft: number, totalTime: number): number => {
  return getProgressPercentage(timeLeft, totalTime);
};

export const getAttemptsProgressPercentage = (attempts: number, maxAttempts: number): number => {
  return getProgressPercentage(maxAttempts - attempts, maxAttempts);
};
