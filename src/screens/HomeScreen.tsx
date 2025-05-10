
import { useState } from 'react';
import SearchBar from '@/components/SearchBar';
import AIPromptForm from '@/components/AIPromptForm';
import { useAudio } from '@/context/AudioContext';

const HomeScreen = () => {
  const { youtubeId } = useAudio();
  const [showAnimation, setShowAnimation] = useState(true);
  
  // Hide animation once a search has been performed
  const handleSearchSubmit = () => {
    setShowAnimation(false);
  };
  
  return (
    <div className="min-h-[calc(100vh-6rem)] px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-binaural-purple to-binaural-blue">
          BinauralMix
        </h1>
        <p className="text-muted-foreground mt-2">
          Transform your music with AI-powered binaural beats
        </p>
      </div>
      
      <div className="flex flex-col gap-6">
        <SearchBar />
        
        {!youtubeId && showAnimation && (
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
                combined with binaural beats.
              </p>
            </div>
          </div>
        )}
        
        <AIPromptForm />
        
        <div className="bg-secondary/20 p-4 rounded-lg border border-secondary mt-4">
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
  );
};

export default HomeScreen;
