
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Music, Sun, Moon, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ProfileScreen = () => {
  return (
    <div className="min-h-[calc(100vh-6rem)] px-4 py-6">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-2">
          <User size={32} className="text-primary" />
        </div>
        <h1 className="text-xl font-bold">Your Profile</h1>
        <p className="text-muted-foreground text-sm">Customize your experience</p>
      </div>
      
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <Music size={18} className="text-primary" />
              Recent Mixes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p className="text-muted-foreground py-2">Your recent mixes will appear here</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <Settings size={18} className="text-primary" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun size={16} />
                <span className="text-sm">Light Mode</span>
              </div>
              <Button variant="outline" size="sm">Off</Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Moon size={16} />
                <span className="text-sm">Sleep Timer</span>
              </div>
              <Button variant="outline" size="sm">Set</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileScreen;
