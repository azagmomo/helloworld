
import { useAudio } from '@/context/AudioContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ambientSounds } from '@/lib/presets';

const AmbientSoundControl = () => {
  const { activeAmbient, setActiveAmbient, ambientVolume, setAmbientVolume } = useAudio();

  const handleSoundToggle = (sound: typeof ambientSounds[0]) => {
    if (activeAmbient && activeAmbient.id === sound.id) {
      setActiveAmbient(null);
    } else {
      setActiveAmbient(sound);
    }
  };

  return (
    <Card className="w-full bg-secondary/50 shadow-xl border-secondary">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span className="text-lg font-medium">Ambient Sounds</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          {ambientSounds.map((sound) => (
            <Button
              key={sound.id}
              variant="outline"
              onClick={() => handleSoundToggle(sound)}
              className={`px-3 py-1.5 rounded-full flex items-center gap-1 transition-all ${
                activeAmbient?.id === sound.id 
                  ? 'bg-primary text-white' 
                  : 'bg-secondary/90 hover:bg-secondary'
              }`}
            >
              <span>{sound.icon}</span>
              <span className="text-sm font-medium">{sound.name}</span>
            </Button>
          ))}
        </div>

        {activeAmbient && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="ambient-volume" className="text-sm font-normal">
                Ambient Volume
              </Label>
              <span className="text-sm font-mono">{ambientVolume}%</span>
            </div>
            <Slider
              id="ambient-volume"
              min={0}
              max={100}
              step={1}
              value={[ambientVolume]}
              onValueChange={(value) => setAmbientVolume(value[0])}
              className="my-4"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AmbientSoundControl;
