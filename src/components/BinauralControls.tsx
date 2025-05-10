
import { useState, useEffect } from 'react';
import { useAudio } from '@/context/AudioContext';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { binauralPresets } from '@/lib/presets';

const BinauralControls = () => {
  const { 
    isBinauralActive, 
    toggleBinaural, 
    binauralVolume, 
    setBinauralVolume,
    currentPreset,
    setCurrentPreset,
    customFrequency,
    setCustomFrequency
  } = useAudio();

  const [isCustomFrequency, setIsCustomFrequency] = useState(false);

  // Set isCustomFrequency when currentPreset changes
  useEffect(() => {
    setIsCustomFrequency(currentPreset.id === 'custom');
  }, [currentPreset.id]);

  const handlePresetChange = (preset: typeof binauralPresets[0]) => {
    setCurrentPreset(preset);
  };

  return (
    <Card className="w-full bg-secondary/50 shadow-xl border-secondary">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span className="text-lg font-medium">Binaural Beats</span>
          <div className="flex items-center gap-2">
            <Label htmlFor="binaural-toggle" className="text-sm font-normal text-muted-foreground">
              {isBinauralActive ? 'ON' : 'OFF'}
            </Label>
            <Switch 
              id="binaural-toggle" 
              checked={isBinauralActive} 
              onCheckedChange={toggleBinaural} 
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {binauralPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(preset)}
                className={`px-3 py-1.5 rounded-full flex items-center gap-1 transition-all ${
                  currentPreset.id === preset.id
                    ? 'bg-primary text-white'
                    : 'bg-secondary/90 hover:bg-secondary'
                }`}
                disabled={!isBinauralActive && preset.id !== 'custom'}
              >
                <span>{preset.icon}</span>
                <span className="text-sm font-medium">{preset.name}</span>
              </button>
            ))}
          </div>
          
          {isCustomFrequency && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <Label htmlFor="frequency-slider" className="text-sm font-normal">
                  Custom Frequency
                </Label>
                <span className="text-sm font-mono">{customFrequency.toFixed(1)} Hz</span>
              </div>
              <Slider
                id="frequency-slider"
                min={1}
                max={40}
                step={0.1}
                value={[customFrequency]}
                onValueChange={(value) => {
                  const newFreq = value[0];
                  setCustomFrequency(newFreq);
                  setCurrentPreset({
                    ...currentPreset,
                    frequency: newFreq,
                  });
                }}
                disabled={!isBinauralActive}
                className="my-4"
              />
            </div>
          )}
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor="binaural-volume" className="text-sm font-normal">
                Binaural Volume
              </Label>
              <span className="text-sm font-mono">{binauralVolume}%</span>
            </div>
            <Slider
              id="binaural-volume"
              min={0}
              max={100}
              step={1}
              value={[binauralVolume]}
              onValueChange={(value) => setBinauralVolume(value[0])}
              disabled={!isBinauralActive}
              className="my-4"
            />
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground">
          {currentPreset.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default BinauralControls;
