
import React from 'react';
import { Breaker } from '@/services/localStorageService';
import { useNavigate } from 'react-router-dom';

interface BreakerItemProps {
  breaker: Breaker;
  onToggle: (id: number) => void;
}

const BreakerItem = ({ breaker, onToggle }: BreakerItemProps) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/breaker/${breaker.id}`);
  };
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when toggling
    onToggle(breaker.id);
  };

  // Determine width class based on breaker type
  const getWidthClass = () => {
    switch (breaker.breakerType) {
      case 'Main':
      case 'Double Pole':
        return 'relative'; // Double width for Main and Double Pole
      case 'Triple Pole':
        return 'relative'; // Triple width for Triple Pole
      default:
        return ''; // Default width for Single Pole
    }
  };

  // Display the spaces used by this breaker
  const getSpacesLabel = () => {
    switch (breaker.breakerType) {
      case 'Main':
      case 'Double Pole':
        return '(2 spaces)';
      case 'Triple Pole':
        return '(3 spaces)';
      default:
        return '';
    }
  };

  return (
    <div 
      className={`flex items-center bg-gray-800 border border-panel-border rounded-md p-2 cursor-pointer ${getWidthClass()}`}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center mr-2">
        <div 
          className={`w-5 h-8 rounded-sm border border-gray-600 flex items-center justify-center cursor-pointer ${breaker.isOn ? 'bg-panel-breaker-on' : 'bg-panel-breaker-off'}`}
          onClick={handleToggle}
        >
          <div className="w-1.5 h-5 bg-panel-breaker-handle rounded-sm"></div>
        </div>
        <span className="text-xs text-gray-400 mt-0.5">{breaker.position}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm text-white font-medium truncate">
          {breaker.name || `Breaker ${breaker.position}`} 
          {breaker.breakerType !== 'Single Pole' && 
           <span className="ml-1 text-xs text-gray-400">{getSpacesLabel()}</span>}
        </h3>
        <p className="text-xs text-gray-400">
          {breaker.amperage > 0 ? `${breaker.amperage}A` : 'No amperage set'} 
          {breaker.interruptionType && breaker.interruptionType !== 'Standard Trip' && 
            ` • ${breaker.interruptionType}`}
          {breaker.breakerType && ` • ${breaker.breakerType}`}
        </p>
      </div>
    </div>
  );
};

export default BreakerItem;
