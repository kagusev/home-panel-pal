
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import BreakerItem from './BreakerItem';
import { getBreakers, getPanelSettings, toggleBreakerState, Breaker } from '@/services/localStorageService';
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

const ElectricalPanel = () => {
  const [breakers, setBreakers] = useState<Breaker[]>([]);
  const [panelSettings, setPanelSettings] = useState({ serviceRating: 0, breakerCount: 0 });
  
  useEffect(() => {
    // Load breakers from local storage
    const loadedBreakers = getBreakers();
    setBreakers(loadedBreakers);
    
    // Load panel settings
    const settings = getPanelSettings();
    if (settings) {
      setPanelSettings(settings);
    }
  }, []);
  
  const handleToggleBreaker = (id: number) => {
    toggleBreakerState(id);
    
    // Update the state to reflect changes
    setBreakers(prevBreakers => 
      prevBreakers.map(breaker => 
        breaker.id === id ? { ...breaker, isOn: !breaker.isOn } : breaker
      )
    );

    // Show toast notification
    const breaker = breakers.find(b => b.id === id);
    const newState = !breaker?.isOn;
    
    toast({
      title: `Breaker ${id} ${newState ? 'On' : 'Off'}`,
      description: `${breaker?.name || `Breaker ${id}`} is now ${newState ? 'on' : 'off'}.`,
    });
  };

  // Function to split breakers into left and right columns (odd and even positions)
  const getColumnBreakers = (column: 'left' | 'right') => {
    return breakers.filter(breaker => 
      column === 'left' 
        ? breaker.position % 2 !== 0 // Left column: odd positions (1, 3, 5, ...)
        : breaker.position % 2 === 0 // Right column: even positions (2, 4, 6, ...)
    );
  };
  
  return (
    <div className="container mx-auto p-2 max-h-screen flex flex-col">
      <header className="mb-3">
        <h1 className="text-xl font-bold text-white mb-1">Electrical Panel</h1>
        <div className="text-xs text-gray-400">
          <p>Service Rating: {panelSettings.serviceRating} Amps</p>
          <p>Total Breakers: {panelSettings.breakerCount}</p>
        </div>
      </header>
      
      <div className="bg-panel-background border border-panel-border rounded-lg p-3 shadow-lg flex-1 overflow-visible">
        <div className="flex gap-2 h-full">
          {/* Left Column */}
          <div className="flex-1 space-y-1">
            {getColumnBreakers('left').map((breaker) => (
              <BreakerItem
                key={breaker.id}
                breaker={breaker}
                onToggle={handleToggleBreaker}
              />
            ))}
          </div>
          
          {/* Right Column */}
          <div className="flex-1 space-y-1">
            {getColumnBreakers('right').map((breaker) => (
              <BreakerItem
                key={breaker.id}
                breaker={breaker}
                onToggle={handleToggleBreaker}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricalPanel;
