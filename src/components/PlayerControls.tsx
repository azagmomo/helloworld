import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '@/context/AudioContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, Volume, Volume1, Volume2, VolumeX, SkipBack, SkipForward, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PlayerControls = () => {
  const { 
    playerStatus,
    setPlayerStatus,
    youtubeVolume,
    setYoutubeVolume
  } = useAudio();
  
  const isMobile = useIsMobile();
  const [previousVolume, setPreviousVolume] = useState(youtubeVolume);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const isMuted = youtubeVolume === 0;
  
  // Add timeout ref to handle hover delay
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const volumeControlRef = useRef<HTMLDivElement>(null);

  // Listen for video-ended event from YouTubePlayer
  useEffect(() => {
    const handleVideoEnded = () => {
      setVideoEnded(true);
    };
    
    window.addEventListener('video-ended', handleVideoEnded);
    
    return () => {
      window.removeEventListener('video-ended', handleVideoEnded);
    };
  }, []);

  // Get video progress periodically
  useEffect(() => {
    if (playerStatus !== 'playing') return;

    const interval = setInterval(() => {
      if (window.YT && window.YT.Player) {
        const player = document.querySelector('iframe')?.contentWindow;
        
        if (player) {
          player.postMessage('{"event":"command","func":"getCurrentTime","args":""}', '*');
          player.postMessage('{"event":"command","func":"getDuration","args":""}', '*');
        }
      }
    }, 1000);

    // Listen for messages from YouTube player
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'infoDelivery' && data.info) {
          if (data.info.currentTime !== undefined) {
            setVideoProgress(data.info.currentTime);
            
            // Check if video ended (within 1 second of duration)
            if (data.info.duration && data.info.currentTime >= data.info.duration - 1) {
              setVideoEnded(true);
            }
          }
          if (data.info.duration !== undefined && data.info.duration > 0) {
            setVideoDuration(data.info.duration);
          }
        }
      } catch (e) {
        // Not a JSON message or not the message we're looking for
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('message', handleMessage);
    };
  }, [playerStatus, setPlayerStatus]);

  // Reset videoEnded state when player status changes to playing
  useEffect(() => {
    if (playerStatus === 'playing') {
      setVideoEnded(false);
    }
  }, [playerStatus]);

  // Add effect to handle clicks outside the volume control
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        volumeControlRef.current && 
        !volumeControlRef.current.contains(event.target as Node) &&
        !isMobile
      ) {
        setShowVolumeControl(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, []);

  const handlePlayPause = () => {
    if (window.YT && window.YT.Player) {
      const player = document.querySelector('iframe')?.contentWindow;
      
      if (player) {
        if (playerStatus === 'playing') {
          player.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
          setPlayerStatus('paused');
        } else {
          player.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
          setPlayerStatus('playing');
        }
      }
    }
  };

  const handleReplay = () => {
    console.log('Replay button clicked');
    if (window.YT && window.YT.Player) {
      const player = document.querySelector('iframe')?.contentWindow;
      
      if (player) {
        // Seek to beginning of video
        player.postMessage('{"event":"command","func":"seekTo","args":[0, true]}', '*');
        // Play the video
        player.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
        setPlayerStatus('playing');
        setVideoEnded(false);
      }
    }
  };

  const handleMuteToggle = () => {
    if (isMuted) {
      setYoutubeVolume(previousVolume > 0 ? previousVolume : 50);
    } else {
      setPreviousVolume(youtubeVolume);
      setYoutubeVolume(0);
    }
  };

  const handleVolumeIconMouseEnter = () => {
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
      volumeTimeoutRef.current = null;
    }
    setShowVolumeControl(true);
  };

  const handleVolumeIconMouseLeave = () => {
    if (!isMobile) {
      // Add delay before hiding to give user time to reach the control
      volumeTimeoutRef.current = setTimeout(() => {
        setShowVolumeControl(false);
      }, 500); // 500ms delay
    }
  };

  const seekVideo = (seconds: number) => {
    if (window.YT && window.YT.Player) {
      const player = document.querySelector('iframe')?.contentWindow;
      
      if (player) {
        // Get current time and seek to new position
        player.postMessage(`{"event":"command","func":"getCurrentTime","args":""}`, '*');
        
        // Listen for response from YT player
        window.addEventListener('message', function onTimeUpdate(event) {
          try {
            const data = JSON.parse(event.data);
            
            // Check if this is the getCurrentTime response
            if (data.event === 'infoDelivery' && data.info && data.info.currentTime !== undefined) {
              // Remove this event listener
              window.removeEventListener('message', onTimeUpdate);
              
              // Calculate new time and seek to it
              const newTime = data.info.currentTime + seconds;
              player.postMessage(`{"event":"command","func":"seekTo","args":[${newTime}, true]}`, '*');
            }
          } catch (e) {
            // Not a JSON message or not the message we're looking for
          }
        });
      }
    }
  };

  const handleSeek = (value: number[]) => {
    if (window.YT && window.YT.Player && videoDuration > 0) {
      const player = document.querySelector('iframe')?.contentWindow;
      
      if (player) {
        const seekTime = (value[0] / 100) * videoDuration;
        player.postMessage(`{"event":"command","func":"seekTo","args":[${seekTime}, true]}`, '*');
      }
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const progressPercentage = videoDuration > 0 ? (videoProgress / videoDuration) * 100 : 0;
  const isPlaying = playerStatus === 'playing';
  const isLoading = playerStatus === 'loading';
  
  const VolumeIcon = () => {
    if (isMuted) return <VolumeX size={16} className="text-destructive" />;
    if (youtubeVolume < 30) return <Volume size={16} className="text-muted-foreground" />;
    if (youtubeVolume < 70) return <Volume1 size={16} className="text-muted-foreground" />;
    return <Volume2 size={16} className="text-muted-foreground" />;
  };

  return (
    <Card className="w-full shadow-xl border-none backdrop-blur-sm bg-gradient-to-br from-binaural-darkpurple via-[#2D2150] to-[#1A1030]">
      <CardContent className="p-2 pb-4">
        {/* Progress Bar */}
        <div className="px-4 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground min-w-8">
              {formatTime(videoProgress)}
            </span>
            
            <div className="flex-1">
              <Slider
                value={[progressPercentage]}
                min={0}
                max={100}
                step={0.1}
                onValueChange={handleSeek}
                disabled={playerStatus === 'idle' || videoDuration === 0}
                className="h-1.5"
              />
            </div>
            
            <span className="text-xs text-muted-foreground min-w-8 text-right">
              {formatTime(videoDuration)}
            </span>
          </div>
        </div>
        
        {/* Player Controls */}
        <div className="flex justify-between items-center px-4">
          {/* Left: Volume Control */}
          <div className="relative" ref={volumeControlRef}>
            <Button
              onClick={() => {
                handleMuteToggle();
                if (isMobile) {
                  setShowVolumeControl(!showVolumeControl);
                }
              }}
              onMouseEnter={handleVolumeIconMouseEnter}
              onMouseLeave={handleVolumeIconMouseLeave}
              variant="ghost"
              size="sm"
              className="h-9 w-9 rounded-full p-0 flex items-center justify-center"
            >
              <VolumeIcon />
            </Button>
            
            {showVolumeControl && (
              <div 
                className={cn(
                  "absolute z-10 p-3 rounded-lg bg-card border shadow-lg",
                  isMobile 
                    ? "bottom-full mb-2 animate-in fade-in" 
                    : "bottom-full mb-2 animate-in fade-in"
                )}
                onMouseEnter={handleVolumeIconMouseEnter}
                onMouseLeave={handleVolumeIconMouseLeave}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col items-center h-24">
                  <Slider
                    value={[youtubeVolume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setYoutubeVolume(value[0])}
                    disabled={playerStatus === 'idle'}
                    orientation="vertical"
                    className="h-full"
                  />
                  <span className="text-xs mt-1">{youtubeVolume}%</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Center: Main Controls */}
          <div 
            className="flex items-center justify-center gap-6 flex-1"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => seekVideo(-5)}
                    variant="ghost"
                    size="sm"
                    disabled={playerStatus === 'idle'}
                    className="h-9 w-9 rounded-full bg-transparent hover:bg-primary/10 p-0"
                  >
                    <SkipBack size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>- 5 seconds</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {videoEnded ? (
              <Button
                onClick={handleReplay}
                disabled={isLoading || playerStatus === 'idle'}
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center shadow-lg p-0",
                  "bg-white hover:bg-white/90 text-black",
                  "hover:text-primary transition-colors"
                )}
                variant="outline"
                aria-label="Replay"
                type="button"
              >
                <RefreshCw size={20} className="text-current" />
              </Button>
            ) : (
              <Button
                onClick={handlePlayPause}
                disabled={isLoading || playerStatus === 'idle'}
                className={cn(
                  "h-12 w-12 rounded-full flex items-center justify-center shadow-lg p-0",
                  "bg-white hover:bg-white/90 text-black",
                  "hover:text-primary transition-colors"
                )}
                variant="outline"
                aria-label={isPlaying ? "Pause" : "Play"}
                type="button"
              >
                {isLoading ? (
                  <div className="animate-spin h-5 w-5 border-t-2 border-current rounded-full" />
                ) : isPlaying ? (
                  <Pause size={20} />
                ) : (
                  <Play size={20} />
                )}
              </Button>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => seekVideo(5)}
                    variant="ghost"
                    size="sm"
                    disabled={playerStatus === 'idle'}
                    className="h-9 w-9 rounded-full bg-transparent hover:bg-primary/10 p-0"
                  >
                    <SkipForward size={20} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>+ 5 seconds</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {/* Right: Empty space to balance the layout */}
          <div className="w-9"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerControls;
