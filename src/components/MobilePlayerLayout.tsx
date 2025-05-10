
import { useState } from 'react';
import { useAudio } from '@/context/AudioContext';
import YouTubePlayer from '@/components/YouTubePlayer';
import VideoControls from '@/components/VideoControls';
import PlayerControls from '@/components/PlayerControls';
import Visualizer from '@/components/Visualizer';
import BottomNav from '@/components/BottomNav';

type MobilePlayerLayoutProps = {
  children: React.ReactNode;
  activeScreen: string;
  onScreenChange: (screen: string) => void;
};

const MobilePlayerLayout = ({ 
  children, 
  activeScreen, 
  onScreenChange 
}: MobilePlayerLayoutProps) => {
  const { playerStatus, youtubeId } = useAudio();
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false);

  // Toggle YouTube player visibility
  const toggleVideoVisibility = () => {
    setShowYouTubePlayer(!showYouTubePlayer);
  };

  // Only show player UI if we have a video selected
  const showPlayerUI = !!youtubeId;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-binaural-black via-binaural-darkpurple to-binaural-black text-white pb-16">
      {/* Main content area */}
      <div className="min-h-[calc(100vh-16rem)]">
        {children}
      </div>
      
      {/* Fixed player area at bottom */}
      {showPlayerUI && (
        <div className="fixed bottom-16 left-0 right-0 z-40">
          {/* Video Player (Hidden by default) */}
          <div className={`px-4 ${showYouTubePlayer ? "block" : "hidden"}`}>
            <YouTubePlayer />
          </div>
          
          {/* This div contains player controls */}
          <div className="px-4 pb-2">
            {/* Video controls (toggle visibility) */}
            <VideoControls 
              isVideoVisible={showYouTubePlayer} 
              onToggleVideoVisibility={toggleVideoVisibility} 
            />
            
            {/* Player controls */}
            <PlayerControls />
          </div>
        </div>
      )}
      
      {/* Bottom Navigation */}
      <BottomNav 
        activeScreen={activeScreen} 
        onScreenChange={onScreenChange} 
      />
      
      {/* Footer */}
      <footer className="fixed bottom-16 left-0 right-0 py-2 text-center text-xs text-muted-foreground bg-background/80 backdrop-blur-sm border-t border-border z-30">
        <p>BinauralMix &copy; 2025</p>
      </footer>
    </div>
  );
};

export default MobilePlayerLayout;
