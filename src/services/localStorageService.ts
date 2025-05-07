
// Types
export interface PanelSettings {
  serviceRating: number;
  breakerCount: number;
  spaces: number; // Changed from optional to required
}

export interface Breaker {
  id: number;
  name: string;
  amperage: number;
  isOn: boolean;
  position: number;
  interruptionType?: string;
  breakerType?: string;
}

// Keys for localStorage
const PANEL_SETTINGS_KEY = 'panel_settings';
const BREAKERS_KEY = 'panel_breakers';

// Panel Settings functions
export const savePanelSettings = (settings: PanelSettings): void => {
  const previousSettings = getPanelSettings();
  localStorage.setItem(PANEL_SETTINGS_KEY, JSON.stringify(settings));
  
  // If breaker count changed, update the breakers accordingly
  if (previousSettings && previousSettings.breakerCount !== settings.breakerCount) {
    updateBreakersCount(settings.breakerCount);
  }
};

export const getPanelSettings = (): PanelSettings | null => {
  const settings = localStorage.getItem(PANEL_SETTINGS_KEY);
  if (!settings) return null;
  
  // Parse settings and ensure spaces has a default value
  const parsedSettings = JSON.parse(settings);
  if (parsedSettings && !parsedSettings.spaces) {
    parsedSettings.spaces = 24; // Default value if not set
  }
  
  return parsedSettings;
};

// Breaker functions
export const saveBreakers = (breakers: Breaker[]): void => {
  localStorage.setItem(BREAKERS_KEY, JSON.stringify(breakers));
};

export const getBreakers = (): Breaker[] => {
  const breakers = localStorage.getItem(BREAKERS_KEY);
  if (!breakers) return [];
  return JSON.parse(breakers);
};

export const updateBreaker = (updatedBreaker: Breaker): void => {
  const breakers = getBreakers();
  const index = breakers.findIndex(breaker => breaker.id === updatedBreaker.id);
  
  if (index !== -1) {
    breakers[index] = updatedBreaker;
    saveBreakers(breakers);
  }
};

export const toggleBreakerState = (id: number): void => {
  const breakers = getBreakers();
  const index = breakers.findIndex(breaker => breaker.id === id);
  
  if (index !== -1) {
    breakers[index].isOn = !breakers[index].isOn;
    saveBreakers(breakers);
  }
};

// Initialize breakers based on panel settings
export const initializeBreakers = (count: number): void => {
  const existingBreakers = getBreakers();
  
  // If we already have breakers, don't reinitialize
  if (existingBreakers.length > 0) return;
  
  const newBreakers: Breaker[] = Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Breaker ${index + 1}`,
    amperage: 0,
    isOn: true,
    position: index + 1,
    interruptionType: 'Standard Trip',
    breakerType: index === 0 ? 'Main' : 'Single Pole' // Set first breaker as Main
  }));
  
  saveBreakers(newBreakers);
};

// Update breakers count when settings change
export const updateBreakersCount = (newCount: number): void => {
  const breakers = getBreakers();
  
  if (breakers.length === newCount) {
    // No change needed
    return;
  } else if (breakers.length > newCount) {
    // Remove excess breakers
    const updatedBreakers = breakers.slice(0, newCount);
    saveBreakers(updatedBreakers);
  } else {
    // Add more breakers
    const additionalCount = newCount - breakers.length;
    const highestId = breakers.length > 0 
      ? Math.max(...breakers.map(b => b.id)) 
      : 0;
    const highestPosition = breakers.length > 0 
      ? Math.max(...breakers.map(b => b.position)) 
      : 0;
      
    const newBreakers: Breaker[] = Array.from({ length: additionalCount }, (_, index) => ({
      id: highestId + index + 1,
      name: `Breaker ${highestPosition + index + 1}`,
      amperage: 0,
      isOn: true,
      position: highestPosition + index + 1,
      interruptionType: 'Standard Trip',
      breakerType: 'Single Pole'
    }));
    
    saveBreakers([...breakers, ...newBreakers]);
  }
};

// Clear all data
export const clearAllData = (): void => {
  localStorage.removeItem(PANEL_SETTINGS_KEY);
  localStorage.removeItem(BREAKERS_KEY);
};

// Check if initial setup is complete
export const isSetupComplete = (): boolean => {
  return getPanelSettings() !== null && getBreakers().length > 0;
};
