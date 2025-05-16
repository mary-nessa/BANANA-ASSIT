"use client";

import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaUser, FaRobot } from 'react-icons/fa';

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

const API_BASE_URL = 'http://20.62.15.198:8080';

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! I'm your Banana Farming Assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponse = await sendMessageToAPI(inputValue);
      setMessages(prev => [...prev, { text: botResponse, sender: 'bot' }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        text: error.message || "Sorry I encountered an error Please try again later", 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanPunctuation = (text: string) => {
    return text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();
  };

  const sendMessageToAPI = async (message: string): Promise<string> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.status === 200) {
        const data = await response.json();
        console.log('API 200 response:', data);
        const cleanedResponse = cleanPunctuation(data.text || data.message || JSON.stringify(data) || "Message processed but no response content provided");
        return cleanedResponse;
      } else if (response.status === 400) {
        const data = await response.json();
        console.log('API 400 response:', data);
        throw new Error(data.error || "Empty message received by the server");
      } else if (response.status === 500) {
        const data = await response.json();
        console.log('API 500 response:', data);
        throw new Error(data.error || "Server error Please try again later");
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error: any) {
      console.error('API error:', error);
      throw new Error(error.message || "Failed to communicate with the server");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-green-50">
      <h1 className="text-2xl font-bold text-center py-4 bg-green-600 text-white">Banana Farming Assistant</h1>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                message.sender === 'user' 
                  ? 'bg-green-600 text-white rounded-br-none' 
                  : 'bg-white text-gray-800 rounded-bl-none shadow'
              }`}
            >
              <div className="flex items-center mb-1">
                {message.sender === 'user' ? (
                  <FaUser className="mr-2" />
                ) : (
                  <FaRobot className="mr-2 text-green-600" />
                )}
                <span className="font-semibold">
                  {message.sender === 'user' ? 'You' : 'Banana Assistant'}
                </span>
              </div>
              <p className="text-black">{message.text}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 rounded-lg rounded-bl-none px-4 py-2 shadow max-w-xs">
              <div className="flex items-center">
                <FaRobot className="mr-2 text-green-600" />
                <span className="font-semibold">Banana Assistant</span>
              </div>
              <div className="flex space-x-1 mt-1">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white flex justify-end">
        <div className="flex w-full max-w-md">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about banana farming..."
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded-r-lg hover:bg-green-700 disabled:bg-green-300 transition-colors"
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
}