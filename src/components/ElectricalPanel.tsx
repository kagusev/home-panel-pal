
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import BreakerItem from './BreakerItem';
import { getBreakers, getPanelSettings, toggleBreakerState, Breaker } from '@/services/localStorageService';
import { toast } from "@/components/ui/use-toast";

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
  
  return (
    <div className="container max-w-md mx-auto p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Electrical Panel</h1>
        <div className="text-sm text-gray-400">
          <p>Service Rating: {panelSettings.serviceRating} Amps</p>
          <p>Total Breakers: {panelSettings.breakerCount}</p>
        </div>
      </header>
      
      <div className="bg-panel-background border border-panel-border rounded-lg p-4 shadow-lg">
        <div className="space-y-2">
          {breakers.map((breaker) => (
            <BreakerItem
              key={breaker.id}
              breaker={breaker}
              onToggle={handleToggleBreaker}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ElectricalPanel;
