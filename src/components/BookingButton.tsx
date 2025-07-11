import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';

interface BookingButtonProps {
  serviceType: string;
  serviceName: string;
  onBookingClick: (serviceType: string) => void;
}

const BookingButton: React.FC<BookingButtonProps> = ({ 
  serviceType, 
  serviceName, 
  onBookingClick 
}) => {
  const handleClick = () => {
    onBookingClick(serviceType);
  };

  return (
    <div className="mt-3 animate-in scale-in duration-300">
      <button
        onClick={handleClick}
        className="group flex items-center space-x-3 w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
      >
        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
          <Calendar className="w-4 h-4 text-white" />
        </div>
        
        <div className="flex-1 text-left">
          <div className="font-bold text-white group-hover:text-gray-100 transition-colors text-sm">
            Boka {serviceName}
          </div>
          <div className="text-xs text-blue-100 group-hover:text-white transition-colors">
            Klicka för att välja tid
          </div>
        </div>
        
        <ArrowRight className="w-4 h-4 text-blue-100 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
      </button>
    </div>
  );
};

export default BookingButton;