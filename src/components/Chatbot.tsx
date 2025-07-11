import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, User, Loader2, MessageCircle } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import BookingModal from './BookingModal';
import BookingButton from './BookingButton';
import MessageContent from './MessageContent';
import ContactButton from './ContactButton';

const Chatbot: React.FC = () => {
  const { messages, isLoading, sendMessage } = useChat();
  const [input, setInput] = useState('');
  const [showBooking, setShowBooking] = useState(false);
  const [detectedService, setDetectedService] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const messageContent = input.trim();
    setInput('');

    try {
      const result = await sendMessage(messageContent);
      
      if (result?.hasBookingIntent && result?.serviceType) {
        setDetectedService(result.serviceType);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [input, isLoading, sendMessage]);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  }, []);

  const closeCalendar = useCallback(() => {
    setShowBooking(false);
    setDetectedService('');
  }, []);

  const handleBookingClick = useCallback((serviceType: string) => {
    setDetectedService(serviceType);
    setShowBooking(true);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full max-w-full sm:max-w-5xl mx-auto bg-gradient-to-br from-white via-gray-50 to-gray-100">
      {/* Elegant Header */}
      <div className="bg-white/80 glass-effect border-b border-gray-200/50 px-3 sm:px-6 py-3 sm:py-4 shadow-soft animate-in slide-in-from-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-elegant flex items-center justify-center">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-white pulse-subtle"></div>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold gradient-text">Axie</h1>
              <p className="text-xs text-gray-500 font-medium hidden sm:block">AI Assistent</p>
            </div>
          </div>
          
          <ContactButton />
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-6 space-y-3 sm:space-y-6">
        {messages.map((msg, index) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-4 animate-in slide-in-from-bottom-4 duration-500 ${
              msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-soft ${
              msg.role === 'user' 
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
                : 'bg-gradient-to-br from-white to-gray-100 border border-gray-200'
            }`}>
              {msg.role === 'user' ? (
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              ) : (
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-gray-700" />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`max-w-[85%] sm:max-w-md lg:max-w-2xl transition-all duration-500 ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white shadow-elegant'
                : msg.isLoading 
                  ? 'bg-gradient-to-br from-gray-50 to-white text-gray-600 border border-gray-200 shadow-soft'
                  : 'bg-gradient-to-br from-white to-gray-50 text-gray-800 shadow-soft border border-gray-100'
            } px-4 py-3 rounded-2xl`}>
              
              {/* Loading Animation */}
              {msg.isLoading && (
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-xs text-gray-500">Tänker...</span>
                </div>
              )}
              
              {/* Message Content */}
              <div className="leading-relaxed text-sm">
                <MessageContent 
                  content={msg.content}
                  role={msg.role}
                />
              </div>
              
              {/* Booking Button */}
              {msg.role === 'assistant' && msg.bookingIntent && (
                <BookingButton
                  serviceType={msg.bookingIntent.serviceType}
                  serviceName={msg.bookingIntent.serviceName}
                  onBookingClick={handleBookingClick}
                />
              )}
              
              {/* Timestamp */}
              <p className={`text-xs mt-2 ${
                msg.role === 'user' ? 'text-gray-300' : msg.isLoading ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {formatTime(msg.timestamp)}
              </p>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white/80 glass-effect border-t border-gray-200/50 px-3 sm:px-6 py-3 sm:py-5 shadow-soft relative z-10">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 sm:space-x-4">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Skriv ditt meddelande..."
              className={`w-full px-3 sm:px-5 py-2 sm:py-4 pr-10 sm:pr-12 rounded-xl sm:rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-transparent transition-all duration-300 shadow-soft ${
                isLoading 
                  ? 'bg-gray-100 border border-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-gray-50 to-white border border-gray-200 hover:border-gray-300 focus:bg-white'
              }`}
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-gray-400" />
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:ring-offset-2 transition-all duration-300 shadow-elegant transform ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed scale-95' 
                : 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white hover:shadow-xl hover:scale-105 active:scale-95'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <Send className="w-3 h-3 sm:w-5 sm:h-5" />
            )}
          </button>
        </form>
      </div>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={showBooking}
        onClose={closeCalendar}
        detectedService={detectedService}
      />
    </div>
  );
};

export default Chatbot;