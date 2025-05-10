
import { useState } from 'react';
import { useAudio } from '@/context/AudioContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMoodSuggestion } from '@/lib/gemini-service';
import { searchVideos } from '@/lib/youtube-service';
import { binauralPresets } from '@/lib/presets';
import { ambientSounds } from '@/lib/presets';
import { useToast } from '@/components/ui/use-toast';

const AIPromptForm = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { 
    setYoutubeId, 
    setPlayerStatus, 
    setCurrentPreset,
    toggleBinaural,
    isBinauralActive,
    setActiveAmbient
  } = useAudio();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Get AI suggestion
      const suggestion = await getMoodSuggestion(prompt);
      
      toast({
        title: "AI Suggestion",
        description: suggestion.explanation,
      });
      
      // Set binaural preset
      const matchedPreset = binauralPresets.find(p => 
        p.name.toLowerCase() === suggestion.presetName.toLowerCase()
      ) || binauralPresets.find(p => p.id === 'custom');
      
      if (matchedPreset) {
        if (matchedPreset.id === 'custom') {
          setCurrentPreset({
            ...matchedPreset,
            frequency: suggestion.frequency
          });
        } else {
          setCurrentPreset(matchedPreset);
        }
        
        // Activate binaural if not already active
        if (!isBinauralActive) {
          toggleBinaural();
        }
      }
      
      // Set ambient if suggested
      if (suggestion.ambient) {
        const matchedAmbient = ambientSounds.find(s =>
          s.name.toLowerCase() === suggestion.ambient?.toLowerCase()
        );
        
        if (matchedAmbient) {
          setActiveAmbient(matchedAmbient);
        }
      }
      
      // Search and set YouTube track
      setPlayerStatus('loading');
      const results = await searchVideos(suggestion.youtubeQuery);
      
      if (results.length > 0) {
        setYoutubeId(results[0].id.videoId);
      } else {
        toast({
          title: "No music found",
          description: "Try a different prompt",
          variant: "destructive",
        });
        setPlayerStatus('idle');
      }
    } catch (error) {
      console.error('AI suggestion error:', error);
      toast({
        title: "Suggestion failed",
        description: "Could not get AI suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const moodExamples = [
    "Help me sleep with calm piano",
    "I need to focus for studying",
    "I feel anxious, need to relax",
    "Boost my energy for workout",
    "Calm meditation with nature sounds"
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <Card className="w-full bg-secondary/50 shadow-xl border-secondary">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">AI Music Therapy</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="How are you feeling? Or what do you need..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-secondary/80 border-secondary"
          />
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/80"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin h-4 w-4 border-t-2 border-white rounded-full mr-2" />
                Getting suggestion...
              </>
            ) : (
              "Get AI Suggestion"
            )}
          </Button>
        </form>
        
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">Examples:</p>
          <div className="flex flex-wrap gap-2">
            {moodExamples.map((example, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-xs bg-secondary/30 hover:bg-secondary/60 border-none"
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIPromptForm;
