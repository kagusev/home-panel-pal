
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

  // Determine height class based on breaker type (with 10% increase for single pole)
  const getHeightClass = () => {
    switch (breaker.breakerType) {
      case 'Main':
      case 'Double Pole':
        return 'h-24'; // Double height for Main and Double Pole
      case 'Triple Pole':
        return 'h-36'; // Triple height for Triple Pole
      default:
        return 'h-[3.3rem]'; // 10% increase from original h-12 (which is 3rem)
    }
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

  // Adjust the handle size based on the breaker type
  const getHandleHeightClass = () => {
    switch (breaker.breakerType) {
      case 'Main':
      case 'Double Pole':
        return 'h-10'; // Double height for the handle
      case 'Triple Pole':
        return 'h-15'; // Triple height for the handle
      default:
        return 'h-4'; // Default height for the handle
    }
  };

  return (
    <div 
      className={`flex items-center bg-gray-800 border border-panel-border rounded-md p-2 cursor-pointer ${getWidthClass()} ${getHeightClass()} transition-all duration-200`}
      onClick={handleClick}
    >
      <div className="flex flex-col items-center mr-2">
        <div 
          className={`w-5 ${breaker.breakerType === 'Triple Pole' ? 'h-16' : breaker.breakerType === 'Main' || breaker.breakerType === 'Double Pole' ? 'h-12' : 'h-8'} rounded-sm border border-gray-600 flex items-center justify-center cursor-pointer ${breaker.isOn ? 'bg-panel-breaker-on' : 'bg-panel-breaker-off'}`}
          onClick={handleToggle}
        >
          <div className={`w-1.5 ${getHandleHeightClass()} bg-panel-breaker-handle rounded-sm`}></div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm text-white font-medium truncate">
          {breaker.name || `Breaker ${breaker.position}`}
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
