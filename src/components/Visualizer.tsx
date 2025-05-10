
import { useEffect, useRef } from 'react';
import { useAudio } from '@/context/AudioContext';

const Visualizer = () => {
  const { playerStatus, isBinauralActive } = useAudio();
  const numberOfBars = 20;
  const barsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // Create random animation delays for each bar
    barsRef.current.forEach(bar => {
      if (bar) {
        const delay = Math.random() * 1.5;
        const duration = 1 + Math.random() * 0.5;
        bar.style.animationDelay = `${delay}s`;
        bar.style.animationDuration = `${duration}s`;
      }
    });
  }, []);

  const getBarHeight = (index: number) => {
    // Center bars are taller
    const middleIndex = numberOfBars / 2;
    const distanceFromMiddle = Math.abs(index - middleIndex);
    const maxHeight = 40; // max height in pixels
    const minHeight = 5;  // min height in pixels
    
    // Linear interpolation based on distance from middle
    return Math.max(
      minHeight,
      maxHeight - (distanceFromMiddle / middleIndex) * (maxHeight - minHeight)
    );
  };

  const isActive = playerStatus === 'playing' || isBinauralActive;

  return (
    <div className="w-full flex justify-center items-end h-12 my-2">
      {isActive ? (
        <div className="flex items-end justify-center gap-1 h-full">
          {Array.from({ length: numberOfBars }).map((_, index) => (
            <div
              key={index}
              ref={(el) => el && (barsRef.current[index] = el)}
              className="visualizer-bar"
              style={{
                height: `${getBarHeight(index)}px`,
                backgroundColor: isBinauralActive ? 'rgba(139, 92, 246, 0.8)' : 'rgba(59, 130, 246, 0.8)',
                animationDelay: `${index * 0.1}s`
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">
          {playerStatus === 'loading' ? 'Loading...' : 'Start playback to visualize'}
        </div>
      )}
    </div>
  );
};

export default Visualizer;
