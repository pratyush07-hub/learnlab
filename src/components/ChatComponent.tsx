'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Paperclip, 
  Image, 
  FileText, 
  Download, 
  X, 
  Smile,
  MoreVertical,
  Search,
  Phone,
  Video,
  Plus
} from 'lucide-react';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file' | 'image';
  attachments?: Attachment[];
  isOwn: boolean;
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

interface ChatComponentProps {
  currentUser: string;
  chatPartner: string;
  chatPartnerId: string;
  onClose?: () => void;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ 
  currentUser, 
  chatPartner, 
  chatPartnerId, 
  onClose 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: chatPartner,
      content: 'Hi! I have a question about the research methodology we discussed in our last session.',
      timestamp: '10:30 AM',
      type: 'text',
      isOwn: false
    },
    {
      id: '2',
      sender: currentUser,
      content: 'Of course! I\'d be happy to help. What specific aspect would you like to discuss?',
      timestamp: '10:32 AM',
      type: 'text',
      isOwn: true
    },
    {
      id: '3',
      sender: chatPartner,
      content: 'I\'ve attached my research proposal draft. Could you review the methodology section?',
      timestamp: '10:35 AM',
      type: 'file',
      attachments: [{
        id: 'file1',
        name: 'Research_Proposal_Draft.pdf',
        size: '2.4 MB',
        type: 'pdf',
        url: '#'
      }],
      isOwn: false
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  const [showAttachments, setShowAttachments] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: Date.now().toString(),
      sender: currentUser,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      isOwn: true
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate mentor typing response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: chatPartner,
        content: 'Thanks for your message! I\'ll review this and get back to you shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text',
        isOwn: false
      };
      setMessages(prev => [...prev, response]);
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'file' | 'image') => {
    const file = event.target.files?.[0];
    if (!file) return;

    const attachment: Attachment = {
      id: Date.now().toString(),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      type: file.type,
      url: URL.createObjectURL(file)
    };

    const message: Message = {
      id: Date.now().toString(),
      sender: currentUser,
      content: type === 'image' ? 'Shared an image' : 'Shared a file',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: type,
      attachments: [attachment],
      isOwn: true
    };

    setMessages([...messages, message]);
    setShowAttachments(false);
  };

  const MessageBubble: React.FC<{ message: Message }> = ({ message }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
        message.isOwn 
          ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
          : 'bg-white border border-gray-200'
      }`}
      style={message.isOwn ? { boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' } : {}}
      >
        {message.type === 'text' && (
          <p className="text-sm">{message.content}</p>
        )}
        
        {message.type === 'file' && message.attachments && (
          <div className="space-y-2">
            <p className="text-sm">{message.content}</p>
            {message.attachments.map((attachment) => (
              <div 
                key={attachment.id}
                className={`flex items-center space-x-3 p-3 rounded-xl ${
                  message.isOwn ? 'bg-white/20' : 'bg-gray-50'
                }`}
              >
                <FileText className={`w-6 h-6 ${message.isOwn ? 'text-white' : 'text-gray-600'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${message.isOwn ? 'text-white' : 'text-gray-900'}`}>
                    {attachment.name}
                  </p>
                  <p className={`text-xs ${message.isOwn ? 'text-white/80' : 'text-gray-500'}`}>
                    {attachment.size}
                  </p>
                </div>
                <button className={`p-1 rounded-full hover:bg-white/20 ${message.isOwn ? 'text-white' : 'text-gray-600'}`}>
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {message.type === 'image' && message.attachments && (
          <div className="space-y-2">
            <p className="text-sm">{message.content}</p>
            {message.attachments.map((attachment) => (
              <div key={attachment.id} className="relative">
                <img 
                  src={attachment.url} 
                  alt={attachment.name}
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            ))}
          </div>
        )}
        
        <p className={`text-xs mt-2 ${
          message.isOwn ? 'text-white/80' : 'text-gray-500'
        }`}>
          {message.timestamp}
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Chat Header */}
      <div 
        className="flex items-center justify-between p-4 border-b border-gray-200"
        style={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold"
            style={{ boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
          >
            {chatPartner.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{chatPartner}</h3>
            <p className="text-sm text-green-600">Online</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Phone className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Video className="w-5 h-5 text-gray-600" />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          {onClose && (
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div 
        className="p-4 border-t border-gray-200"
        style={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="flex items-end space-x-3">
          <div className="relative">
            <button
              onClick={() => setShowAttachments(!showAttachments)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Plus className={`w-5 h-5 transform transition-transform ${showAttachments ? 'rotate-45' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showAttachments && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2"
                >
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg w-full text-left"
                  >
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Document</span>
                  </button>
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-50 rounded-lg w-full text-left"
                  >
                    <Image className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Image</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="w-full px-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={newMessage.trim() === ''}
            className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full hover:from-amber-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)' }}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        
        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={(e) => handleFileUpload(e, 'file')}
          className="hidden"
        />
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileUpload(e, 'image')}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ChatComponent;