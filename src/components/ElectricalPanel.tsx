
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import BreakerItem from './BreakerItem';
import { getBreakers, getPanelSettings, toggleBreakerState, Breaker } from '@/services/localStorageService';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

const ElectricalPanel = () => {
  const [breakers, setBreakers] = useState<Breaker[]>([]);
  const [panelSettings, setPanelSettings] = useState({ 
    serviceRating: 0, 
    breakerCount: 0, 
    spaces: 24 // Default value
  });
  const [panelHeight, setPanelHeight] = useState('auto');
  const panelRef = useRef<HTMLDivElement>(null);
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
    
    // Calculate and set the initial panel height
    updatePanelHeight();
    
    // Add window resize event listener
    window.addEventListener('resize', updatePanelHeight);
    
    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('resize', updatePanelHeight);
    };
  }, []);
  
  // Update panel height based on viewport and content
  const updatePanelHeight = () => {
    if (!panelRef.current) return;
    
    // Get the viewport height
    const viewportHeight = window.innerHeight;
    
    // Get the header element's height (container's first child)
    const headerElement = panelRef.current.parentElement?.querySelector('header');
    const headerHeight = headerElement ? headerElement.offsetHeight : 0;
    
    // Calculate available height (viewport - header - padding)
    const padding = 32; // 16px top + 16px bottom padding (2rem)
    const availableHeight = viewportHeight - headerHeight - padding;
    
    // Set the panel height to fit available space
    setPanelHeight(`${availableHeight}px`);
  };
  
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
  
  // Calculate total spaces used by all breakers
  const getTotalSpacesUsed = () => {
    return breakers.reduce((total, breaker) => {
      if (breaker.breakerType === 'Main' || breaker.breakerType === 'Double Pole') {
        return total + 2; // Main and Double Pole breakers take 2 spaces
      } else if (breaker.breakerType === 'Triple Pole') {
        return total + 3; // Triple Pole breakers take 3 spaces
      }
      return total + 1; // Single Pole takes 1 space
    }, 0);
  };

  // Function to organize breakers into columns
  const getColumnBreakers = (column: 'left' | 'right') => {
    // Create a copy of breakers to avoid modifying the original
    const breakers_with_spaces = [...breakers];
    let currentSpace = 0;
    const leftBreakers = [];
    const rightBreakers = [];
    
    for (const breaker of breakers_with_spaces) {
      const spaces = getSpacesForBreaker(breaker.breakerType || 'Single Pole');
      
      // If this is a left column breaker
      if (currentSpace < panelSettings.spaces / 2) {
        leftBreakers.push(breaker);
        currentSpace += spaces;
      } else {
        rightBreakers.push(breaker);
        currentSpace += spaces;
      }
    }
    
    return column === 'left' ? leftBreakers : rightBreakers;
  };

  // Helper function to get spaces for a breaker type
  const getSpacesForBreaker = (breakerType: string): number => {
    switch (breakerType) {
      case 'Main':
      case 'Double Pole':
        return 2;
      case 'Triple Pole':
        return 3;
      default:
        return 1;
    }
  };
  
  return (
    <div ref={panelRef} className="container mx-auto p-2 min-h-screen flex flex-col">
      <header className="mb-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-white">Electrical Panel</h1>
            <div className="text-xs text-gray-400 flex flex-col">
              <span>Service Rating: {panelSettings.serviceRating} Amps</span>
              <span>Panel Spaces: {panelSettings.spaces}</span>
              <span>Total Breakers: {breakers.length}</span>
              <span>Spaces Used: {getTotalSpacesUsed()} of {panelSettings.spaces}</span>
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
        style={{ height: panelHeight }}
      >
        <div className="h-full flex gap-2">
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
