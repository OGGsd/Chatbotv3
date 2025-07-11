import React, { useState } from 'react';
import { X, Mail, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { sendContactWebhook } from '../lib/webhook';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  name: string;
  email: string;
}

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  });
  const [status, setStatus] = useState<FormStatus>({ type: 'idle' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setStatus({ type: 'error', message: 'Vänligen ange ditt namn' });
      return;
    }
    
    if (!formData.email.trim()) {
      setStatus({ type: 'error', message: 'Vänligen ange din e-postadress' });
      return;
    }
    
    if (!validateEmail(formData.email)) {
      setStatus({ type: 'error', message: 'Vänligen ange en giltig e-postadress' });
      return;
    }

    setStatus({ type: 'loading' });

    try {
      await sendContactWebhook({
        name: formData.name.trim(),
        email: formData.email.trim()
      });

      setStatus({ 
        type: 'success', 
        message: 'Tack! Vi kontaktar dig inom kort.' 
      });

      setTimeout(() => {
        setFormData({ name: '', email: '' });
        setStatus({ type: 'idle' });
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Contact webhook error:', error);
      setStatus({ 
        type: 'error', 
        message: 'Något gick fel. Försök igen eller kontakta oss direkt.' 
      });
    }
  };

  const handleClose = () => {
    if (status.type !== 'loading') {
      setFormData({ name: '', email: '' });
      setStatus({ type: 'idle' });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center min-h-screen">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={handleClose}
      />
      
      {/* Modal Container - Properly Centered */}
      <div className="relative z-[100000] w-full max-w-sm mx-4 my-8 animate-in scale-in duration-300 flex items-center justify-center min-h-0">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-black to-gray-800 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-black">
                    Kontakt Mig
                  </h2>
                  <p className="text-xs text-gray-600">
                    Vill du bli kontaktad senare?
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={status.type === 'loading'}
                className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-4 max-h-[70vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <label htmlFor="name" className="block text-xs font-semibold text-gray-700 mb-2">
                  Ditt namn
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ange ditt fullständiga namn"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition-all duration-300 hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={status.type === 'loading'}
                  required
                />
              </div>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-2">
                  E-postadress
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="din@email.se"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/20 focus:border-transparent transition-all duration-300 hover:border-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={status.type === 'loading'}
                  required
                />
              </div>

              {/* Status Message */}
              {status.message && (
                <div className={`flex items-center space-x-2 p-3 rounded-xl animate-in slide-in-from-bottom-4 duration-300 ${
                  status.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {status.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="text-xs font-medium">{status.message}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status.type === 'loading' || status.type === 'success'}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 text-xs ${
                  status.type === 'loading' || status.type === 'success'
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-gradient-to-r from-black to-gray-800 hover:from-gray-900 hover:to-black text-white hover:shadow-lg transform hover:scale-105 active:scale-95'
                }`}
              >
                {status.type === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Skickar...</span>
                  </>
                ) : status.type === 'success' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-green-700">Skickat!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Skicka Kontaktförfrågan</span>
                  </>
                )}
              </button>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;