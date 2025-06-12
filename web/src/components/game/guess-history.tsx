import type { GameHistoryEntry } from "@/types/game";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GuessHistoryProps {
  gameHistory: GameHistoryEntry[];
}

export const GuessHistory = ({ gameHistory }: GuessHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Your Guesses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {gameHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No guesses yet</p>
          ) : (
            gameHistory.map((entry, index) => (
              <div className="flex items-center gap-2 text-sm" key={index}>
                <div className={`w-2 h-2 rounded-full ${entry.correct ? "bg-green-500" : "bg-red-500"}`} />
                <span className={entry.correct ? "font-semibold text-green-600" : ""}>{entry.guess}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
