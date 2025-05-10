
export interface YouTubeSearchResult {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    thumbnails: {
      medium: {
        url: string;
      };
    };
    channelTitle: string;
  };
}

export interface BinauralPreset {
  id: string;
  name: string;
  frequency: number;
  description: string;
  icon: string;
}

export interface AmbientSound {
  id: string;
  name: string;
  icon: string;
  audioSrc: string;
}

export type PlayerStatus = 'idle' | 'loading' | 'playing' | 'paused';
