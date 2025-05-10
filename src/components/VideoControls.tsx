
import { useState } from 'react';
import { useAudio } from '@/context/AudioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VideoControlsProps {
  isVideoVisible: boolean;
  onToggleVideoVisibility: () => void;
}

const VideoControls = ({ isVideoVisible, onToggleVideoVisibility }: VideoControlsProps) => {
  const { playerStatus, youtubeId } = useAudio();
  const [playbackRate, setPlaybackRate] = useState<string>("1");

  // Function to handle playback rate change
  const handlePlaybackRateChange = (value: string) => {
    setPlaybackRate(value);
    // Dispatch custom event for YouTube player to catch
    window.dispatchEvent(
      new CustomEvent('youtube-playback-rate-change', { 
        detail: { rate: parseFloat(value) } 
      })
    );
  };

  if (!youtubeId || playerStatus === 'idle') return null;

  return (
    <Card className="w-full bg-secondary/50 shadow-lg border-secondary">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={onToggleVideoVisibility}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              {isVideoVisible ? (
                <>
                  <EyeOff size={16} />
                  <span>Hide Video</span>
                </>
              ) : (
                <>
                  <Eye size={16} />
                  <span>Show Video</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Playback Speed:</span>
            <Select value={playbackRate} onValueChange={handlePlaybackRateChange}>
              <SelectTrigger className="w-[90px] h-8">
                <SelectValue placeholder="1x" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="0.25">0.25x</SelectItem>
                  <SelectItem value="0.5">0.5x</SelectItem>
                  <SelectItem value="0.75">0.75x</SelectItem>
                  <SelectItem value="1">1x</SelectItem>
                  <SelectItem value="1.25">1.25x</SelectItem>
                  <SelectItem value="1.5">1.5x</SelectItem>
                  <SelectItem value="1.75">1.75x</SelectItem>
                  <SelectItem value="2">2x</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoControls;
