import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GuessInputProps {
  submitting: boolean;
  onSubmitGuess: (guess: string) => void;
}

export const GuessInput = ({ submitting, onSubmitGuess }: GuessInputProps) => {
  const [guess, setGuess] = useState("");

  const handleSubmit = () => {
    if (guess.trim()) {
      onSubmitGuess(guess);
      setGuess("");
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2">
        <Input
          className="flex-1"
          disabled={submitting}
          onChange={e => setGuess(e.target.value)}
          onKeyUp={handleKeyUp}
          placeholder="Enter your guess..."
          value={guess}
        />
        <Button
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
          disabled={!guess.trim() || submitting}
          onClick={handleSubmit}
        >
          {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Guess"}
        </Button>
      </div>
    </div>
  );
};
