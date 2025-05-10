
import { useAudio } from '@/context/AudioContext';
import BinauralControls from '@/components/BinauralControls';
import AmbientSoundControl from '@/components/AmbientSoundControl';
import SessionTimer from '@/components/SessionTimer';
import { useIsMobile } from '@/hooks/use-mobile';

const MixerScreen = () => {
  const { playerStatus, youtubeId } = useAudio();
  const isMobile = useIsMobile();
  
  // Show empty state if no video is selected
  if (!youtubeId) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center px-4 py-6">
        <div className="bg-primary/10 rounded-full p-6 mb-4">
          <div className="text-4xl animate-float">🎚️</div>
        </div>
        <h2 className="text-xl font-semibold mb-2 text-center">No audio selected</h2>
        <p className="text-muted-foreground text-center mb-6">
          Search for a song or use AI mode to create a mix
        </p>
      </div>
    );
  }

  return (
    <div className={`px-4 pt-4 overflow-y-auto ${isMobile ? '' : 'min-h-[calc(100vh-6rem)] pb-16'}`}>
      <div className="space-y-4">
        <BinauralControls />
        <AmbientSoundControl />
        <SessionTimer />
      </div>
    </div>
  );
};

export default MixerScreen;
