
import { useState, useEffect, useRef } from 'react';
import { useAudio } from '@/context/AudioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Timer } from 'lucide-react';

const SessionTimer = () => {
  const { sessionLength, setSessionLength } = useAudio();
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const timerOptions = [
    { value: 10, label: '10 min' },
    { value: 20, label: '20 min' },
    { value: 30, label: '30 min' },
    { value: 45, label: '45 min' },
    { value: 60, label: '60 min' },
    { value: 0, label: '∞' },
  ];

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (sessionLength > 0) {
      setRemainingTime(sessionLength * 60); // Convert to seconds
      
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev !== null && prev > 0) {
            return prev - 1;
          } else {
            // Timer complete
            clearInterval(timerRef.current!);
            // TODO: Implement fade out and stop logic
            return 0;
          }
        });
      }, 1000);
    } else {
      setRemainingTime(null);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sessionLength]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full bg-secondary/50 shadow-xl border-secondary">
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 mb-1">
            <Timer size={16} className="text-muted-foreground" />
            <span className="text-sm font-medium">Session Timer</span>
            
            {remainingTime !== null && remainingTime > 0 && (
              <span className="ml-auto text-sm font-mono">
                {formatTime(remainingTime)}
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {timerOptions.map((option) => (
              <Button
                key={option.value}
                variant="outline"
                size="sm"
                onClick={() => setSessionLength(option.value)}
                className={`px-3 py-1 text-xs ${
                  sessionLength === option.value 
                    ? 'bg-primary text-white' 
                    : 'bg-secondary/90 hover:bg-secondary'
                }`}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionTimer;
