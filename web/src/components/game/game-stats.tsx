import { Clock, Target, Trophy } from "lucide-react";

import type { Game } from "@/types/game";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GAME_CONFIG } from "@/lib/constants";
import { formatTime, getAttemptsProgressPercentage, getTimeProgressPercentage } from "@/lib/game-utils";

interface GameStatsProps {
  game: Game;
}

export const GameStats = ({ game }: GameStatsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Game Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Time Left:</span>
            <span className="font-mono text-base font-semibold">{formatTime(game.timeLeft)}</span>
          </div>
          <Progress className="h-2" value={getTimeProgressPercentage(game.timeLeft, GAME_CONFIG.TIME_LIMIT_SECONDS)} />

          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Attempts:</span>
            <span className="font-mono text-base font-semibold">
              {game.attempts}/{game.maxAttempts}
            </span>
          </div>
          <Progress className="h-2" value={getAttemptsProgressPercentage(game.attempts, game.maxAttempts)} />

          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Score:</span>
            <span className="font-mono text-base font-semibold">{game.score}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
