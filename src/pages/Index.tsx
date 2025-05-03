
import React, { useState, useEffect } from 'react';
import SetupPanel from '@/components/SetupPanel';
import ElectricalPanel from '@/components/ElectricalPanel';
import { isSetupComplete } from '@/services/localStorageService';

const Index = () => {
  const [setupDone, setSetupDone] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if setup is complete
    const setupCompleted = isSetupComplete();
    setSetupDone(setupCompleted);
  }, []);
  
  const handleSetupComplete = () => {
    setSetupDone(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-900">
      {!setupDone ? (
        <SetupPanel onComplete={handleSetupComplete} />
      ) : (
        <ElectricalPanel />
      )}
    </div>
  );
};

export default Index;
