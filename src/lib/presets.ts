
import { BinauralPreset, AmbientSound } from '@/types';

export const binauralPresets: BinauralPreset[] = [
  {
    id: 'sleep',
    name: 'Sleep',
    frequency: 3.5,
    description: 'Delta waves (1-4Hz) for deep sleep and healing',
    icon: '😴',
  },
  {
    id: 'focus',
    name: 'Focus',
    frequency: 10,
    description: 'Alpha waves (8-12Hz) for concentration and productivity',
    icon: '🧠',
  },
  {
    id: 'relax',
    name: 'Relaxation',
    frequency: 6,
    description: 'Theta waves (4-8Hz) for deep relaxation and meditation',
    icon: '😌',
  },
  {
    id: 'meditate',
    name: 'Meditation',
    frequency: 7.83,
    description: 'Schumann Resonance (7.83Hz) for grounding and balance',
    icon: '🧘',
  },
  {
    id: 'energy',
    name: 'Energy',
    frequency: 14,
    description: 'Low beta waves (13-16Hz) for alertness and energy',
    icon: '⚡',
  },
  {
    id: 'custom',
    name: 'Custom',
    frequency: 5.5,
    description: 'Adjust manually to your preference',
    icon: '🛠️',
  },
];

export const ambientSounds: AmbientSound[] = [
  {
    id: 'rain',
    name: 'Rain',
    icon: '🌧️',
    audioSrc: '/sounds/rain.mp3',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    icon: '🌊',
    audioSrc: '/sounds/ocean.mp3',
  },
  {
    id: 'fire',
    name: 'Fireplace',
    icon: '🔥',
    audioSrc: '/sounds/fire.mp3',
  },
  {
    id: 'wind',
    name: 'Wind',
    icon: '💨',
    audioSrc: '/sounds/wind.mp3',
  },
  {
    id: 'chimes',
    name: 'Chimes',
    icon: '🔔',
    audioSrc: '/sounds/chimes.mp3',
  },
];
