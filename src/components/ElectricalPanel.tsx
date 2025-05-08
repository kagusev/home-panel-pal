
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import BreakerItem from './BreakerItem';
import { getBreakers, getPanelSettings, toggleBreakerState, Breaker, saveBreakers } from '@/services/localStorageService';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const ElectricalPanel = () => {
  const [breakers, setBreakers] = useState<Breaker[]>([]);
  const [panelSettings, setPanelSettings] = useState({ 
    serviceRating: 0, 
    breakerCount: 0, 
    spaces: 24 // Default value
  });
  const [panelHeight, setPanelHeight] = useState('auto');
  const [draggedBreaker, setDraggedBreaker] = useState<Breaker | null>(null);
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
  
  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, breaker: Breaker) => {
    setDraggedBreaker(breaker);
    e.dataTransfer.effectAllowed = 'move';
    // For better visual feedback
    if (e.target instanceof HTMLElement) {
      e.target.classList.add('opacity-50');
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e: React.DragEvent, targetBreaker: Breaker) => {
    e.preventDefault();
    
    // Reset any visual effects from dragging
    if (e.target instanceof HTMLElement) {
      document.querySelectorAll('.opacity-50').forEach(el => el.classList.remove('opacity-50'));
    }
    
    if (!draggedBreaker || draggedBreaker.id === targetBreaker.id) return;
    
    // Get positions to swap
    const draggedPosition = draggedBreaker.position;
    const targetPosition = targetBreaker.position;
    
    // Update positions in state
    const updatedBreakers = breakers.map(breaker => {
      if (breaker.id === draggedBreaker.id) {
        return { ...breaker, position: targetPosition };
      }
      if (breaker.id === targetBreaker.id) {
        return { ...breaker, position: draggedPosition };
      }
      return breaker;
    });
    
    // Save updated positions to local storage
    saveBreakers(updatedBreakers);
    
    // Update state
    setBreakers(updatedBreakers);
    setDraggedBreaker(null);
    
    toast({
      title: "Breaker Relocated",
      description: `${draggedBreaker.name || `Breaker ${draggedBreaker.id}`} has been moved to position ${targetPosition}.`,
      duration: 3000,
    });
  };
  
  const handleDragEnd = (e: React.DragEvent) => {
    // Reset any visual effects from dragging
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove('opacity-50');
    }
    setDraggedBreaker(null);
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

  // Function to calculate potential breakers that could fit in remaining spaces
  const getPotentialBreakerCounts = (availableSpaces: number) => {
    if (availableSpaces <= 0) return null;
    
    return {
      singlePole: availableSpaces, // Number of single pole breakers that could fit
      doublePole: Math.floor(availableSpaces / 2), // Number of double pole breakers
      triplePole: Math.floor(availableSpaces / 3), // Number of triple pole breakers
    };
  };

  // Function to organize breakers into columns
  const getColumnBreakers = (column: 'left' | 'right') => {
    // Create a copy of breakers to avoid modifying the original
    const sortedBreakers = [...breakers].sort((a, b) => a.position - b.position);
    
    const leftColumnSpaces = Math.floor(panelSettings.spaces / 2);
    const leftBreakers: Breaker[] = [];
    const rightBreakers: Breaker[] = [];
    
    let leftSpacesUsed = 0;
    let rightSpacesUsed = 0;
    
    for (const breaker of sortedBreakers) {
      const breakerSpaces = getSpacesForBreaker(breaker.breakerType || 'Single Pole');
      
      // Try to keep spaces equal between columns
      if (leftSpacesUsed < leftColumnSpaces && leftSpacesUsed + breakerSpaces <= leftColumnSpaces) {
        leftBreakers.push(breaker);
        leftSpacesUsed += breakerSpaces;
      } else {
        rightBreakers.push(breaker);
        rightSpacesUsed += breakerSpaces;
      }
    }
    
    // Validate that spaces are equal (or as close as possible given breaker types)
    if (Math.abs(leftSpacesUsed - rightSpacesUsed) > 2) {
      const imbalance = Math.abs(leftSpacesUsed - rightSpacesUsed);
      const columnWithSpace = leftSpacesUsed < rightSpacesUsed ? 'left' : 'right';
      const availableSpaces = columnWithSpace === 'left' 
        ? leftColumnSpaces - leftSpacesUsed
        : (panelSettings.spaces - leftColumnSpaces) - rightSpacesUsed;
      
      // Calculate what breakers could fit
      const potentialBreakers = getPotentialBreakerCounts(availableSpaces);
      
      toast({
        title: "Panel Balance Information",
        description: (
          <div className="space-y-2">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertDescription>
                <span className="font-medium">Unbalanced panel detected.</span> There's a difference of {imbalance} spaces between columns.
              </AlertDescription>
            </Alert>
            {potentialBreakers && (
              <div className="space-y-1 text-sm">
                <p>In the {columnWithSpace} column, you could add:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>{potentialBreakers.singlePole} Single Pole breaker{potentialBreakers.singlePole !== 1 ? 's' : ''}</li>
                  {potentialBreakers.doublePole > 0 && (
                    <li>{potentialBreakers.doublePole} Double Pole breaker{potentialBreakers.doublePole !== 1 ? 's' : ''}</li>
                  )}
                  {potentialBreakers.triplePole > 0 && (
                    <li>{potentialBreakers.triplePole} Triple Pole breaker{potentialBreakers.triplePole !== 1 ? 's' : ''}</li>
                  )}
                </ul>
                <p className="mt-2">Visit <a className="underline text-blue-500" href="/edit-panel">Edit Panel</a> to balance your breakers.</p>
              </div>
            )}
          </div>
        ),
        duration: 10000, // Extended duration for user to read the details
      });
    }
    
    return column === 'left' ? leftBreakers : rightBreakers;
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
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full flex gap-2">
          {/* Left Column */}
          <div className="flex-1 space-y-1">
            {getColumnBreakers('left').map((breaker) => (
              <BreakerItem
                key={breaker.id}
                breaker={breaker}
                onToggle={handleToggleBreaker}
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
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
                onDragStart={handleDragStart}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectricalPanel;
