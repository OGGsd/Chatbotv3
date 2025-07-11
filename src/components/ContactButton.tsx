import React, { useState } from 'react';
import { Phone, X } from 'lucide-react';
import ContactModal from './ContactModal';

const ContactButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Contact Button */}
      <button
        onClick={handleOpenModal}
        className="group relative bg-gradient-to-r from-gray-900 via-gray-800 to-black hover:from-black hover:to-gray-900 text-white px-3 sm:px-5 py-2 sm:py-3 rounded-xl shadow-elegant hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center space-x-2 sm:space-x-3"
        title="Kontakta oss"
      >
        <Phone className="w-3 h-3" />
        <span className="text-xs font-semibold">Kontakt</span>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none shadow-elegant">
          Vill du bli kontaktad senare?
          <div className="absolute top-full right-2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
        </div>
      </button>

      {/* Contact Modal */}
      <ContactModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default ContactButton;