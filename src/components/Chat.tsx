'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send, Paperclip, Smile, Phone, Video, MoreVertical } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Message {
  id: string
  sender_id: string
  recipient_id: string
  content: string
  message_type: string
  created_at: string
  sender?: {
    full_name: string
    avatar_url?: string
  }
}

interface ChatProps {
  currentUserId: string
  recipientId: string
  recipientName: string
  recipientAvatar?: string
}

export default function Chat({ currentUserId, recipientId, recipientName, recipientAvatar }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load existing messages
  useEffect(() => {
    loadMessages()
    
    // Set up real-time subscription
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${recipientId},recipient_id=eq.${currentUserId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, recipientId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(full_name, avatar_url)
        `)
        .or(`sender_id.eq.${currentUserId},sender_id.eq.${recipientId}`)
        .or(`recipient_id.eq.${currentUserId},recipient_id.eq.${recipientId}`)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUserId,
          recipient_id: recipientId,
          content: newMessage.trim(),
          message_type: 'text'
        })
        .select(`
          *,
          sender:profiles!sender_id(full_name, avatar_url)
        `)

      if (error) throw error

      const newMessageData = data?.[0]
      if (newMessageData) {
        setMessages(prev => [...prev, newMessageData])
      }
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-96 bg-white rounded-3xl shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            {recipientAvatar ? (
              <img src={recipientAvatar} alt={recipientName} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="font-bold">{recipientName.charAt(0)}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{recipientName}</h3>
            <p className="text-orange-100 text-sm">Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <Phone size={20} />
          </button>
          <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <Video size={20} />
          </button>
          <button className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.sender_id === currentUserId
          return (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end space-x-2 max-w-xs ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isOwnMessage && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    {recipientAvatar ? (
                      <img src={recipientAvatar} alt={recipientName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-xs font-bold">{recipientName.charAt(0)}</span>
                    )}
                  </div>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${isOwnMessage ? 'text-orange-100' : 'text-gray-500'}`}>
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            </motion.div>
          )
        })}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
          >
            <Paperclip size={20} />
          </button>
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
          >
            <Smile size={20} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
          <motion.button
            type="submit"
            disabled={!newMessage.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={20} />
          </motion.button>
        </div>
      </form>
    </div>
  )
}