
import { useState } from 'react';
import { Home, Brain, Sliders, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

type NavItem = {
  name: string;
  icon: React.ElementType;
  screen: 'home' | 'ai' | 'mixer' | 'profile';
};

const navItems: NavItem[] = [
  { name: 'Home', icon: Home, screen: 'home' },
  { name: 'AI Mode', icon: Brain, screen: 'ai' },
  { name: 'Mixer', icon: Sliders, screen: 'mixer' },
  { name: 'Profile', icon: User, screen: 'profile' },
];

type BottomNavProps = {
  activeScreen: string;
  onScreenChange: (screen: string) => void;
};

const BottomNav = ({ activeScreen, onScreenChange }: BottomNavProps) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <nav className="flex items-center justify-around">
        {navItems.map((item) => (
          <button
            key={item.screen}
            onClick={() => onScreenChange(item.screen)}
            className={cn(
              "flex flex-col items-center py-3 px-4 flex-1 transition-colors",
              activeScreen === item.screen 
                ? "text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon size={20} className="mb-1" />
            <span className="text-xs">{item.name}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default BottomNav;
