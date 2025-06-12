import { RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StartGameScreenProps {
  loading: boolean;
  onCreateNewGame: () => void;
}

export const StartGameScreen = ({ loading, onCreateNewGame }: StartGameScreenProps) => {
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">🎨 AI Pictionary</h1>
        <p className="text-lg text-muted-foreground">Can you guess what the AI is drawing?</p>
      </div>

      <Card className="text-center p-8">
        <CardContent>
          <div className="space-y-6">
            <div className="text-6xl">🎯</div>
            <h2 className="text-2xl font-semibold">Ready to Play?</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              The AI will draw a picture and you need to guess what it is. You have 5 attempts and 2 minutes to solve it!
            </p>
            <Button
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              disabled={loading}
              onClick={onCreateNewGame}
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Creating Game...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start New Game
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
