
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

  return (
    <div 
      className="flex items-center bg-gray-800 border border-panel-border rounded-md p-3 mb-2 cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex flex-col items-center mr-4">
        <div 
          className={`w-6 h-10 rounded-sm border border-gray-600 flex items-center justify-center cursor-pointer ${breaker.isOn ? 'bg-panel-breaker-on' : 'bg-panel-breaker-off'}`}
          onClick={handleToggle}
        >
          <div className="w-2 h-6 bg-panel-breaker-handle rounded-sm"></div>
        </div>
        <span className="text-xs text-gray-400 mt-1">{breaker.position}</span>
      </div>
      <div className="flex-1">
        <h3 className="text-white font-medium truncate">{breaker.name || `Breaker ${breaker.position}`}</h3>
        <p className="text-sm text-gray-400">{breaker.wattage > 0 ? `${breaker.wattage}W` : 'No wattage set'}</p>
      </div>
    </div>
  );
};

export default BreakerItem;
