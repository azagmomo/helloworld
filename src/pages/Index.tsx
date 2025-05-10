import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAudio } from '@/context/AudioContext';
import YouTubePlayer from '@/components/YouTubePlayer';
import SearchBar from '@/components/SearchBar';
import BinauralControls from '@/components/BinauralControls';
import PlayerControls from '@/components/PlayerControls';
import AIPromptForm from '@/components/AIPromptForm';
import AmbientSoundControl from '@/components/AmbientSoundControl';
import Visualizer from '@/components/Visualizer';
import SessionTimer from '@/components/SessionTimer';
import VideoControls from '@/components/VideoControls';
import MobilePlayerLayout from '@/components/MobilePlayerLayout';
import HomeScreen from '@/screens/HomeScreen';
import AIScreen from '@/screens/AIScreen';
import MixerScreen from '@/screens/MixerScreen';
import ProfileScreen from '@/screens/ProfileScreen';

const Index = () => {
  const isMobile = useIsMobile();
  const { playerStatus, youtubeId } = useAudio();
  const [showPlayerControls, setShowPlayerControls] = useState(false);
  const [showYouTubePlayer, setShowYouTubePlayer] = useState(false); // Hide video by default
  const [activeScreen, setActiveScreen] = useState('home');
  
  useEffect(() => {
    // Show player controls once a video has been searched for
    if (youtubeId) {
      setShowPlayerControls(true);
      // On mobile, switch to mixer screen when a video is selected
      if (isMobile) {
        setActiveScreen('mixer');
      }
    }
  }, [youtubeId, isMobile]);

  // Toggle YouTube player visibility
  const toggleVideoVisibility = () => {
    setShowYouTubePlayer(!showYouTubePlayer);
  };

  // Render mobile UI with bottom navigation and persistent player
  if (isMobile) {
    return (
      <MobilePlayerLayout 
        activeScreen={activeScreen} 
        onScreenChange={setActiveScreen} 
      >
        {/* Show appropriate screen based on bottom nav selection */}
        {activeScreen === 'home' && <HomeScreen />}
        {activeScreen === 'ai' && <AIScreen />}
        {activeScreen === 'mixer' && <MixerScreen />}
        {activeScreen === 'profile' && <ProfileScreen />}
      </MobilePlayerLayout>
    );
  }

  // Desktop UI remains unchanged
  return (
    <div className="min-h-screen bg-gradient-to-br from-binaural-black via-binaural-darkpurple to-binaural-black text-white">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-binaural-purple to-binaural-blue">
            BinauralMix
          </h1>
          <p className="text-muted-foreground mt-2">
            Transform your favorite music with AI-powered binaural beats
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          <SearchBar />
          
          {showPlayerControls && (
            <>
              {/* Video controls are outside the player div */}
              <VideoControls 
                isVideoVisible={showYouTubePlayer} 
                onToggleVideoVisibility={toggleVideoVisibility} 
              />
              
              <div className="w-full relative">
                {/* Always render YouTube player but toggle its visibility */}
                <div className={showYouTubePlayer ? "block" : "hidden"}>
                  <YouTubePlayer />
                </div>
                
                {/* Show visualization when video is hidden */}
                {!showYouTubePlayer && (
                  <div className="w-full bg-secondary/30 rounded-lg border border-secondary shadow-lg p-4 relative">
                    <div className="flex items-center justify-center min-h-[200px]">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse" />
                        <div className="relative flex items-center justify-center">
                          <Visualizer />
                          <div className="absolute">
                            <div className="text-4xl animate-float">🎧</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <PlayerControls />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BinauralControls />
                <AmbientSoundControl />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AIPromptForm />
                <div className="flex flex-col gap-4">
                  <SessionTimer />
                  <div className="bg-secondary/20 p-4 rounded-lg border border-secondary">
                    <h3 className="text-sm font-medium mb-2">About Binaural Beats</h3>
                    <p className="text-xs text-muted-foreground">
                      Binaural beats occur when you hear two slightly different frequencies 
                      in each ear, creating a perceived third tone that can help influence 
                      brainwave states. Different frequencies support different mental states
                      from deep sleep to focused concentration.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {!showPlayerControls && (
            <div className="flex flex-col items-center justify-center gap-6 py-6">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse-slow" />
                <div className="relative bg-gradient-to-br from-primary/90 to-binaural-blue/90 w-32 h-32 rounded-full flex items-center justify-center animate-float">
                  <span className="text-5xl">🎧</span>
                </div>
              </div>
              
              <div className="max-w-md text-center">
                <h2 className="text-xl font-semibold mb-2">Welcome to BinauralMix</h2>
                <p className="text-muted-foreground mb-4">
                  Search for your favorite music or ask our AI for a personalized mix 
                  combined with binaural beats to help you sleep, focus, or relax.
                </p>
                
                <AIPromptForm />
              </div>
            </div>
          )}
        </div>
      </div>
      
      <footer className="py-4 text-center text-xs text-muted-foreground">
        <p>BinauralMix &copy; 2025 | AI-Enhanced Binaural Audio Therapy</p>
      </footer>
    </div>
  );
};

export default Index;
