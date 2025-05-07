
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import BreakerItem from './BreakerItem';
import { getBreakers, getPanelSettings, toggleBreakerState, Breaker } from '@/services/localStorageService';
import { toast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from 'react-router-dom';

const ElectricalPanel = () => {
  const [breakers, setBreakers] = useState<Breaker[]>([]);
  const [panelSettings, setPanelSettings] = useState({ 
    serviceRating: 0, 
    breakerCount: 0, 
    spaces: 24 // Default value
  });
  const navigate = useNavigate();
  
  useEffect(() => {
    // Load breakers from local storage
    const loadedBreakers = getBreakers();
    setBreakers(loadedBreakers);
    
    // Load panel settings
    const settings = getPanelSettings();
    if (settings) {
      setPanelSettings({
        serviceRating: settings.serviceRating,
        breakerCount: settings.breakerCount,
        spaces: settings.spaces || 24 // Ensure spaces has a default value
      });
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

  const handleEditPanel = () => {
    navigate('/edit-panel');
  };
  
  // Function to split breakers into left and right columns based on first half and second half
  const getColumnBreakers = (column: 'left' | 'right') => {
    const halfLength = Math.ceil(breakers.length / 2);
    return column === 'left' 
      ? breakers.slice(0, halfLength) // First half
      : breakers.slice(halfLength);   // Second half
  };

  // Calculate panel height based on number of spaces
  const getPanelHeight = () => {
    const viewportHeight = window.innerHeight;
    // Use 85% of viewport height for the panel, leaving room for header
    return `${viewportHeight * 0.85}px`;
  };
  
  return (
    <div className="container mx-auto p-2 h-screen flex flex-col">
      <header className="mb-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-white">Electrical Panel</h1>
            <div className="text-xs text-gray-400 flex flex-col">
              <span>Service Rating: {panelSettings.serviceRating} Amps</span>
              <span>Panel Spaces: {panelSettings.spaces}</span>
              <span>Total Breakers: {breakers.length}</span>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleEditPanel}
            className="text-xs text-gray-300 hover:text-white"
          >
            Edit Panel
          </Button>
        </div>
      </header>
      
      <div 
        className="bg-panel-background border border-panel-border rounded-lg p-3 shadow-lg flex-1"
        style={{ height: getPanelHeight() }}
      >
        <div className="h-full flex gap-2">
          {/* Left Column */}
          <div className="flex-1 space-y-1 overflow-auto">
            {getColumnBreakers('left').map((breaker) => (
              <BreakerItem
                key={breaker.id}
                breaker={breaker}
                onToggle={handleToggleBreaker}
              />
            ))}
          </div>
          
          {/* Right Column */}
          <div className="flex-1 space-y-1 overflow-auto">
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
