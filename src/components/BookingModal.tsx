import React from 'react';
import { X, Calendar } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  detectedService?: string;
}

interface BookingService {
  id: string;
  title: string;
  calendarUrl: string;
  description: string;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, detectedService }) => {
  const bookingServices: BookingService[] = [
    {
      id: 'onboarding',
      title: 'Kostnadsfri Konsultation',
      calendarUrl: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0QR3uRxVB7rb4ZHqJ1qYmz-T0e2CFtV5MYekvGDq1qyWxsV_Av3nP3zEGk0DrH2HqpTLoXuK0h',
      description: '30-60 min kostnadsfri rådgivning'
    },
    {
      id: 'website',
      title: 'Hemsida',
      calendarUrl: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0QR3uRxVB7rb4ZHqJ1qYmz-T0e2CFtV5MYekvGDq1qyWxsV_Av3nP3zEGk0DrH2HqpTLoXuK0h',
      description: 'Professionell webbplats från 8,995 kr'
    },
    {
      id: 'booking-system',
      title: 'Bokningssystem',
      calendarUrl: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0QR3uRxVB7rb4ZHqJ1qYmz-T0e2CFtV5MYekvGDq1qyWxsV_Av3nP3zEGk0DrH2HqpTLoXuK0h',
      description: 'Avancerat bokningssystem från 10,995 kr'
    },
    {
      id: 'app-development',
      title: 'App-utveckling',
      calendarUrl: 'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ0QR3uRxVB7rb4ZHqJ1qYmz-T0e2CFtV5MYekvGDq1qyWxsV_Av3nP3zEGk0DrH2HqpTLoXuK0h',
      description: 'Mobilappar för iOS & Android'
    }
  ];

  const [selectedService, setSelectedService] = React.useState<BookingService | null>(null);

  // Auto-select service based on detected intent
  React.useEffect(() => {
    if (detectedService && isOpen) {
      const service = bookingServices.find(s => 
        s.id === detectedService || 
        s.title.toLowerCase().includes(detectedService.toLowerCase())
      );
      if (service) {
        setSelectedService(service);
      }
    }
  }, [detectedService, isOpen]);

  const handleServiceSelect = (service: BookingService) => {
    setSelectedService(service);
  };

  const handleClose = () => {
    setSelectedService(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99998] flex items-center justify-center min-h-screen">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      {/* Modal Container - Properly Centered */}
      <div className="relative z-[99999] w-full h-full md:w-[95vw] md:h-[90vh] md:max-w-7xl mx-0 md:mx-4 my-0 md:my-4 animate-in scale-in duration-300">
        <div className="bg-white h-full md:rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full">
          {selectedService ? (
            // Direct iframe view
            <>
              {/* Minimal header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-black">
                      Boka {selectedService.title}
                    </h2>
                    <p className="text-xs text-gray-500">
                      Välj en tid som passar dig
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <X className="w-3 h-3 text-gray-600" />
                </button>
              </div>
              
              {/* Full iframe */}
              <div className="flex-1 min-h-0">
                <iframe
                  src={selectedService.calendarUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  title={`Bokningskalender - ${selectedService.title}`}
                  loading="lazy"
                  className="md:rounded-b-2xl"
                />
              </div>
            </>
          ) : (
            // Service selection
            <>
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center">
                    <Calendar className="w-3 h-3 text-white" />
                  </div>
                  <h2 className="text-xs font-bold text-black">
                    Välj Tjänst
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                >
                  <X className="w-3 h-3 text-gray-600" />
                </button>
              </div>
              
              <div className="flex-1 p-3 overflow-y-auto">
                <div className="grid grid-cols-1 gap-3">
                  {bookingServices.map((service, index) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all duration-300 text-left group transform hover:scale-[1.02] active:scale-95 animate-in slide-in-from-bottom-4 bg-white hover:bg-gray-50"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 group-hover:from-black group-hover:to-gray-800 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0">
                          <Calendar className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors duration-300" />
                        </div>
                        <div>
                          <h3 className="font-bold text-black group-hover:text-black transition-colors text-sm">
                            {service.title}
                          </h3>
                          <p className="text-xs text-gray-600 group-hover:text-gray-700 transition-colors mt-1">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;