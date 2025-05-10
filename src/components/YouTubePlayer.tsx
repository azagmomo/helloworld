import React, { useEffect, useRef, useState } from 'react';
import { useAudio } from '@/context/AudioContext';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const YouTubePlayer = () => {
  const playerRef = useRef<HTMLDivElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const playerReadyRef = useRef<boolean>(false);
  const apiLoadedRef = useRef<boolean>(false);
  const [isApiLoading, setIsApiLoading] = useState(false);
  
  // Video visibility is controlled by parent component now
  const { 
    youtubeId, 
    youtubeVolume, 
    setPlayerStatus,
    playerStatus
  } = useAudio();

  // Load YouTube API
  useEffect(() => {
    // Function to initialize the API
    const loadYouTubeApi = () => {
      if (isApiLoading || apiLoadedRef.current) return;
      
      setIsApiLoading(true);
      
      // Create script tag
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      // Set up callback for when API is ready
      window.onYouTubeIframeAPIReady = () => {
        apiLoadedRef.current = true;
        setIsApiLoading(false);
        initializePlayer();
      };
      
      // Add script to DOM
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    };
    
    // Check if YT API is already loaded
    if (window.YT && window.YT.Player) {
      apiLoadedRef.current = true;
      initializePlayer();
    } else {
      loadYouTubeApi();
    }
    
    // Cleanup on unmount
    return () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          console.log('Error destroying player:', e);
        }
      }
    };
  }, []);
  
  // Handle video ID changes
  useEffect(() => {
    if (!youtubeId || !apiLoadedRef.current) return;
    
    // If player is ready and initialized
    if (playerReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.loadVideoById(youtubeId);
      } catch (error) {
        console.error('Error loading video:', error);
        
        // Fallback: Destroy and recreate player
        if (ytPlayerRef.current) {
          try {
            ytPlayerRef.current.destroy();
          } catch (e) {
            console.log('Error destroying player:', e);
          }
        }
        
        ytPlayerRef.current = null;
        playerReadyRef.current = false;
        initializePlayer();
      }
    } else {
      // Re-initialize player with new video ID
      initializePlayer();
    }
  }, [youtubeId]);
  
  // Handle volume changes
  useEffect(() => {
    if (playerReadyRef.current && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.setVolume(youtubeVolume);
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  }, [youtubeVolume]);
  
  // Listen for playback rate changes (from VideoControls component)
  useEffect(() => {
    const handlePlaybackRateChange = (event: CustomEvent) => {
      if (playerReadyRef.current && ytPlayerRef.current) {
        try {
          const rate = event.detail.rate;
          ytPlayerRef.current.setPlaybackRate(rate);
        } catch (error) {
          console.error('Error setting playback rate:', error);
        }
      }
    };

    window.addEventListener(
      'youtube-playback-rate-change',
      handlePlaybackRateChange as EventListener
    );

    return () => {
      window.removeEventListener(
        'youtube-playback-rate-change',
        handlePlaybackRateChange as EventListener
      );
    };
  }, []);
  
  // Initialize YouTube player
  const initializePlayer = () => {
    // Make sure we have the container element and API is loaded
    if (!playerRef.current || !window.YT || !window.YT.Player) return;
    
    // Check if we have a video ID to load
    if (!youtubeId) {
      setPlayerStatus('idle');
      return;
    }
    
    // Cleanup any existing player
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.destroy();
      } catch (e) {
        console.log('Error destroying player:', e);
      }
      ytPlayerRef.current = null;
    }
    
    setPlayerStatus('loading');
    
    try {
      // Create new player
      ytPlayerRef.current = new window.YT.Player(playerRef.current, {
        height: '100%',
        width: '100%',
        videoId: youtubeId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
          fs: 0,
          enablejsapi: 1,
          origin: window.location.origin,
          playsinline: 1 // Add this to ensure proper event handling on all devices
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    } catch (error) {
      console.error('Error creating YouTube player:', error);
      setPlayerStatus('idle');
      toast({
        title: "Player Error",
        description: "Could not initialize YouTube player. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Player ready event handler
  const onPlayerReady = (event: any) => {
    playerReadyRef.current = true;
    
    try {
      event.target.setVolume(youtubeVolume);
      event.target.playVideo();
      setPlayerStatus('playing');
    } catch (error) {
      console.error('Error in onPlayerReady:', error);
      setPlayerStatus('idle');
    }
  };
  
  // Player state change handler
  const onPlayerStateChange = (event: any) => {
    if (!window.YT) return;
    
    try {
      switch (event.data) {
        case window.YT.PlayerState.PLAYING:
          setPlayerStatus('playing');
          break;
        case window.YT.PlayerState.PAUSED:
          setPlayerStatus('paused');
          break;
        case window.YT.PlayerState.BUFFERING:
          setPlayerStatus('loading');
          break;
        case window.YT.PlayerState.ENDED:
          setPlayerStatus('paused'); // Change from idle to paused when video ends
          // We'll use the videoEnded state in PlayerControls to show replay button
          const videoEndedEvent = new CustomEvent('video-ended');
          window.dispatchEvent(videoEndedEvent);
          break;
      }
    } catch (error) {
      console.error('Error in onPlayerStateChange:', error);
    }
  };
  
  // Player error handler
  const onPlayerError = (event: any) => {
    console.error('YouTube player error:', event);
    setPlayerStatus('idle');
    
    toast({
      title: "YouTube Error",
      description: "There was a problem playing this video. Please try another one.",
      variant: "destructive",
    });
  };

  return (
    <Card className="w-full aspect-video overflow-hidden rounded-lg shadow-2xl bg-binaural-black">
      <div ref={playerRef} className="w-full h-full" />
    </Card>
  );
};

export default YouTubePlayer;
