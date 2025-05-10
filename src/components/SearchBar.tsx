
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { searchVideos } from '@/lib/youtube-service';
import { useAudio } from '@/context/AudioContext';
import { useToast } from '@/components/ui/use-toast';
import { Search } from 'lucide-react';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setYoutubeId, setPlayerStatus } = useAudio();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    setIsLoading(true);
    setPlayerStatus('loading');
    
    try {
      const results = await searchVideos(query);
      
      if (results.length > 0) {
        setYoutubeId(results[0].id.videoId);
        toast({
          title: "Found music",
          description: `Now playing: ${results[0].snippet.title}`,
        });
      } else {
        toast({
          title: "No results",
          description: "Try a different search term",
          variant: "destructive",
        });
        setPlayerStatus('idle');
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Could not search YouTube. Please try again.",
        variant: "destructive",
      });
      setPlayerStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 w-full">
      <Input
        type="text"
        placeholder="Search for music..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 bg-secondary/50 border-secondary"
      />
      <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/80">
        {isLoading ? (
          <div className="animate-spin h-5 w-5 border-t-2 border-white rounded-full" />
        ) : (
          <Search size={20} />
        )}
      </Button>
    </form>
  );
};

export default SearchBar;
