import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { BinauralPreset, AmbientSound, PlayerStatus } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { binauralPresets } from '@/lib/presets';

interface AudioContextType {
  // YouTube player
  youtubeId: string | null;
  isYoutubeReady: boolean;
  setYoutubeId: (id: string | null) => void;
  youtubeVolume: number;
  setYoutubeVolume: (volume: number) => void;
  playerStatus: PlayerStatus;
  setPlayerStatus: (status: PlayerStatus) => void;
  
  // Binaural beats
  isBinauralActive: boolean;
  toggleBinaural: () => void;
  binauralVolume: number;
  setBinauralVolume: (volume: number) => void;
  currentPreset: BinauralPreset;
  setCurrentPreset: (preset: BinauralPreset) => void;
  customFrequency: number;
  setCustomFrequency: (frequency: number) => void;
  
  // Ambient sounds
  activeAmbient: AmbientSound | null;
  setActiveAmbient: (sound: AmbientSound | null) => void;
  ambientVolume: number;
  setAmbientVolume: (volume: number) => void;
  
  // Session timer
  sessionLength: number;
  setSessionLength: (minutes: number) => void;
  remainingTime: number | null;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // YouTube player state
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [isYoutubeReady, setIsYoutubeReady] = useState(false);
  const [youtubeVolume, setYoutubeVolume] = useState(50);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>('idle');
  
  // Binaural beats state
  const [isBinauralActive, setIsBinauralActive] = useState(false);
  const [binauralVolume, setBinauralVolume] = useState(30);
  const [currentPreset, setCurrentPreset] = useState<BinauralPreset>(binauralPresets[0]);
  const [customFrequency, setCustomFrequency] = useState(binauralPresets[0].frequency);
  
  // Ambient sounds state
  const [activeAmbient, setActiveAmbient] = useState<AmbientSound | null>(null);
  const [ambientVolume, setAmbientVolume] = useState(40);
  
  // Session timer
  const [sessionLength, setSessionLength] = useState(0); // 0 means continuous
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Audio processing setup
  const audioContextRef = useRef<AudioContext | null>(null);
  const leftOscillatorRef = useRef<OscillatorNode | null>(null);
  const rightOscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);
  const isAudioInitialized = useRef<boolean>(false);
  const audioContextState = useRef<'running' | 'suspended' | 'closed' | null>(null);

  // Initialize the AudioContext early on component mount
  useEffect(() => {
    // Create the AudioContext on component mount, but keep it suspended
    const initializeAudioContext = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        audioContextState.current = audioContextRef.current.state;
        
        // Create gain node right away
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = binauralVolume / 100;
        gainNode.connect(audioContextRef.current.destination);
        gainNodeRef.current = gainNode;
        
        console.log("AudioContext created successfully, state:", audioContextRef.current.state);
        isAudioInitialized.current = true;
      } catch (error) {
        console.error("Failed to initialize AudioContext:", error);
        isAudioInitialized.current = false;
      }
    };

    // Initialize audio context
    initializeAudioContext();

    // Clean up on unmount
    return () => {
      cleanupBinauralBeats();
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(err => {
          console.error("Error closing audio context:", err);
        });
        audioContextRef.current = null;
        audioContextState.current = null;
      }
    };
  }, []);

  // Initialize or resume Web Audio API when binaural is activated
  const setupBinauralBeats = () => {
    try {
      // If context doesn't exist or was closed, create a new one
      if (!audioContextRef.current || audioContextState.current === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
        audioContextState.current = audioContextRef.current.state;
        
        // Create gain node
        const gainNode = audioContextRef.current.createGain();
        gainNode.gain.value = binauralVolume / 100;
        gainNode.connect(audioContextRef.current.destination);
        gainNodeRef.current = gainNode;
        isAudioInitialized.current = true;
        
        console.log("New AudioContext created, state:", audioContextRef.current.state);
      }
      
      // Resume audio context if suspended
      if (audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume().then(() => {
          audioContextState.current = 'running';
          console.log("AudioContext resumed successfully");
          setupOscillators();
        }).catch(err => {
          console.error("Failed to resume AudioContext:", err);
          toast({
            title: "Audio Error",
            description: "Could not resume binaural beats. Please try again.",
            variant: "destructive",
          });
          setIsBinauralActive(false);
        });
      } else {
        // Context is already running, just setup oscillators
        setupOscillators();
      }
      
      toast({
        title: "Binaural Beats Activated",
        description: `${currentPreset.name} - ${currentPreset.frequency}Hz`,
      });
    } catch (error) {
      console.error('Failed to initialize Web Audio API:', error);
      toast({
        title: "Audio Error",
        description: "Could not initialize binaural beats. Please try again.",
        variant: "destructive",
      });
      setIsBinauralActive(false);
    }
  };

  // Setup oscillators function to avoid code duplication
  const setupOscillators = () => {
    if (!audioContextRef.current || !gainNodeRef.current) {
      console.error("Cannot setup oscillators - AudioContext or GainNode is null");
      return;
    }
    
    // Stop any existing oscillators
    if (leftOscillatorRef.current) {
      try {
        leftOscillatorRef.current.stop();
        leftOscillatorRef.current.disconnect();
      } catch (e) {
        console.error("Error stopping left oscillator:", e);
      }
      leftOscillatorRef.current = null;
    }
    
    if (rightOscillatorRef.current) {
      try {
        rightOscillatorRef.current.stop();
        rightOscillatorRef.current.disconnect();
      } catch (e) {
        console.error("Error stopping right oscillator:", e);
      }
      rightOscillatorRef.current = null;
    }
    
    try {
      // Create new oscillators
      const leftOsc = audioContextRef.current.createOscillator();
      const rightOsc = audioContextRef.current.createOscillator();
      
      // Calculate frequencies based on the current preset
      const baseFreq = 200;
      const beatFreq = currentPreset.frequency;
      
      leftOsc.frequency.value = baseFreq;
      rightOsc.frequency.value = baseFreq + beatFreq;
      
      // Connect oscillators to left and right channels
      const merger = audioContextRef.current.createChannelMerger(2);
      
      // Create gains for left/right channels
      const leftGain = audioContextRef.current.createGain();
      const rightGain = audioContextRef.current.createGain();
      
      leftOsc.connect(leftGain);
      rightOsc.connect(rightGain);
      
      leftGain.connect(merger, 0, 0);  // Connect to left channel
      rightGain.connect(merger, 0, 1); // Connect to right channel
      
      merger.connect(gainNodeRef.current);
      
      // Start oscillators
      leftOsc.start();
      rightOsc.start();
      
      leftOscillatorRef.current = leftOsc;
      rightOscillatorRef.current = rightOsc;
      
      console.log("Oscillators set up with frequencies:", baseFreq, "and", baseFreq + beatFreq);
    } catch (error) {
      console.error("Error in setupOscillators:", error);
      toast({
        title: "Audio Error",
        description: "Problem setting up binaural beats. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Cleanup binaural beats function
  const cleanupBinauralBeats = () => {
    console.log("Cleaning up binaural beats");
    
    // Clean up oscillator nodes
    if (leftOscillatorRef.current) {
      try {
        leftOscillatorRef.current.stop();
        leftOscillatorRef.current.disconnect();
      } catch (e) {
        console.error("Error stopping left oscillator:", e);
      }
      leftOscillatorRef.current = null;
    }
    
    if (rightOscillatorRef.current) {
      try {
        rightOscillatorRef.current.stop();
        rightOscillatorRef.current.disconnect();
      } catch (e) {
        console.error("Error stopping right oscillator:", e);
      }
      rightOscillatorRef.current = null;
    }
  };

  // Handle binaural toggle
  useEffect(() => {
    if (isBinauralActive) {
      setupBinauralBeats();
    } else {
      cleanupBinauralBeats();
    }
  }, [isBinauralActive]);
  
  // Update binaural beat frequency when preset changes
  useEffect(() => {
    if (isBinauralActive && audioContextRef.current) {
      // If binaural is active and we have an audio context, update oscillators
      setupOscillators();
      
      console.log(`Binaural frequency updated: ${currentPreset.frequency}Hz (${currentPreset.name})`);
      
      // Show a toast with the new preset info
      toast({
        title: `Changed to ${currentPreset.name}`,
        description: `${currentPreset.frequency}Hz - ${currentPreset.description.split(' ')[0]}`,
      });
    }
  }, [currentPreset]);
  
  // Update binaural volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = binauralVolume / 100;
    }
  }, [binauralVolume]);
  
  // Handle ambient sound
  useEffect(() => {
    if (activeAmbient) {
      if (!ambientAudioRef.current) {
        ambientAudioRef.current = new Audio(activeAmbient.audioSrc);
        ambientAudioRef.current.loop = true;
      } else {
        ambientAudioRef.current.src = activeAmbient.audioSrc;
      }
      
      ambientAudioRef.current.volume = ambientVolume / 100;
      ambientAudioRef.current.play().catch(err => {
        console.error('Error playing ambient sound:', err);
        toast({
          title: "Playback Error",
          description: "Could not play ambient sound. Try again.",
          variant: "destructive",
        });
      });
    } else if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
    }
    
    return () => {
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause();
      }
    };
  }, [activeAmbient]);
  
  // Update ambient volume
  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.volume = ambientVolume / 100;
    }
  }, [ambientVolume]);
  
  const toggleBinaural = () => {
    setIsBinauralActive(prev => !prev);
  };

  const value = {
    // YouTube player
    youtubeId,
    setYoutubeId,
    isYoutubeReady,
    youtubeVolume,
    setYoutubeVolume,
    playerStatus,
    setPlayerStatus,
    
    // Binaural beats
    isBinauralActive,
    toggleBinaural,
    binauralVolume,
    setBinauralVolume,
    currentPreset,
    setCurrentPreset,
    customFrequency,
    setCustomFrequency,
    
    // Ambient sounds
    activeAmbient,
    setActiveAmbient,
    ambientVolume,
    setAmbientVolume,
    
    // Session timer
    sessionLength,
    setSessionLength,
    remainingTime,
  };
  
  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>;
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
};
