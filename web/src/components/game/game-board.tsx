import { Lightbulb, RefreshCw } from "lucide-react";

import type { Game } from "@/types/game";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GAME_STATUS_LABELS, GAME_STATUS_VARIANTS } from "@/lib/constants";

interface GameBoardProps {
  game: Game;
  loading: boolean;
  onNewGame: () => void;
}

export const GameBoard = ({ game, loading, onNewGame }: GameBoardProps) => {
  const getStatusBadge = () => {
    const variant = GAME_STATUS_VARIANTS[game.status] as "default" | "secondary" | "destructive" | "outline";
    const label = GAME_STATUS_LABELS[game.status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            🎨 AI Drawing
            {getStatusBadge()}
          </CardTitle>
          <Button disabled={loading} onClick={onNewGame} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Drawing..." : "New Game"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
          {game.drawing ? (
            <div className="w-full flex items-center py-8 justify-center" dangerouslySetInnerHTML={{ __html: game.drawing }} />
          ) : (
            <div className="w-full aspect-square max-w-xs mx-auto flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p>AI is drawing...</p>
              </div>
            </div>
          )}
        </div>

        {game.hint && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Hint:</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">{game.hint}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
