
import { YouTubeSearchResult } from '@/types';

const YOUTUBE_API_KEY = 'AIzaSyCsjp0BRgMv68geSOSPoUSudLrQqBb-fzU';
const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function searchVideos(query: string): Promise<YouTubeSearchResult[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&maxResults=5&q=${encodeURIComponent(
        query
      )}&type=video&videoEmbeddable=true&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch videos');
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error searching YouTube:', error);
    throw error;
  }
}

export async function getRelatedVideos(videoId: string): Promise<YouTubeSearchResult[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/search?part=snippet&maxResults=5&relatedToVideoId=${videoId}&type=video&key=${YOUTUBE_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch related videos');
    }
    
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error getting related videos:', error);
    throw error;
  }
}
