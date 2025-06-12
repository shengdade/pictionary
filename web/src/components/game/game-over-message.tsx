import type { Game } from "@/types/game";

interface GameOverMessageProps {
  game: Game;
}

export const GameOverMessage = ({ game }: GameOverMessageProps) => {
  const getGameOverEmoji = () => {
    switch (game.status) {
      case "won":
        return "🎉";
      case "timeout":
        return "⏰";
      default:
        return "💔";
    }
  };

  const getGameOverTitle = () => {
    switch (game.status) {
      case "won":
        return "Congratulations!";
      case "timeout":
        return "Time's Up!";
      default:
        return "Game Over";
    }
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
      <div className="text-2xl mb-2">{getGameOverEmoji()}</div>
      <h3 className="font-semibold text-lg mb-1">{getGameOverTitle()}</h3>
      {game.word && (
        <p className="text-muted-foreground">
          The word was: <span className="font-semibold text-foreground">{game.word}</span>
        </p>
      )}
      {game.status === "won" && <p className="text-green-600 dark:text-green-400 mt-1">Final Score: {game.score} points</p>}
    </div>
  );
};
