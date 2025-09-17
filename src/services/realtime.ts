import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export class RealtimeService {
  private static channels: Map<string, RealtimeChannel> = new Map();

  // Subscribe to new messages for a user
  static subscribeToMessages(userId: string, onMessage: (message: any) => void) {
    const channelName = `messages:${userId}`;
    
    // Remove existing subscription if any
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          onMessage(payload.new);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Subscribe to session updates for a user
  static subscribeToSessions(userId: string, userType: 'student' | 'mentor', onUpdate: (session: any) => void) {
    const channelName = `sessions:${userId}`;
    
    // Remove existing subscription if any
    this.unsubscribe(channelName);

    const filterKey = userType === 'student' ? 'student_id' : 'mentor_id';
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
          filter: `${filterKey}=eq.${userId}`
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Subscribe to earnings updates for a mentor
  static subscribeToEarnings(mentorId: string, onUpdate: (earning: any) => void) {
    const channelName = `earnings:${mentorId}`;
    
    // Remove existing subscription if any
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'earnings',
          filter: `mentor_id=eq.${mentorId}`
        },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Subscribe to file uploads for a user
  static subscribeToFiles(userId: string, onUpdate: (file: any) => void) {
    const channelName = `files:${userId}`;
    
    // Remove existing subscription if any
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'files',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          onUpdate(payload.new);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return channel;
  }

  // Subscribe to user presence (online/offline status)
  static subscribeToPresence(userId: string, onPresenceChange: (presence: any) => void) {
    const channelName = `presence:${userId}`;
    
    // Remove existing subscription if any
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        onPresenceChange(state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        onPresenceChange({ event: 'join', key, newPresences });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        onPresenceChange({ event: 'leave', key, leftPresences });
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') { return }
        
        // Track user presence
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
        });
      });

    this.channels.set(channelName, channel);
    return channel;
  }

  // Subscribe to notifications for a user
  static subscribeToNotifications(userId: string, onNotification: (notification: any) => void) {
    const channelName = `notifications:${userId}`;
    
    // Remove existing subscription if any
    this.unsubscribe(channelName);

    // Listen for new sessions (student gets notification when mentor accepts)
    const sessionChannel = supabase
      .channel(`${channelName}:sessions`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `student_id=eq.${userId}`
        },
        (payload) => {
          if (payload.old.status !== payload.new.status) {
            onNotification({
              type: 'session_update',
              title: 'Session Updated',
              message: `Your session status changed to ${payload.new.status}`,
              data: payload.new
            });
          }
        }
      )
      .subscribe();

    // Listen for new messages
    const messageChannel = supabase
      .channel(`${channelName}:messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`
        },
        (payload) => {
          onNotification({
            type: 'new_message',
            title: 'New Message',
            message: 'You have a new message',
            data: payload.new
          });
        }
      )
      .subscribe();

    this.channels.set(`${channelName}:sessions`, sessionChannel);
    this.channels.set(`${channelName}:messages`, messageChannel);
    
    return { sessionChannel, messageChannel };
  }

  // Unsubscribe from a specific channel
  static unsubscribe(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.channels.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  static unsubscribeAll() {
    this.channels.forEach((channel, channelName) => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }

  // Get online users in a specific channel
  static async getOnlineUsers(channelName: string) {
    const channel = this.channels.get(channelName);
    if (!channel) return [];

    const presenceState = channel.presenceState();
    return Object.keys(presenceState).map(key => presenceState[key][0]);
  }
}

// Notification utility functions
export class NotificationService {
  private static permissions: NotificationPermission = 'default';

  // Request permission for browser notifications
  static async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    const permission = await Notification.requestPermission();
    this.permissions = permission;
    return permission === 'granted';
  }

  // Show browser notification
  static showNotification(title: string, options?: NotificationOptions) {
    if (this.permissions !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  // Show in-app notification (toast)
  static showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    // This would integrate with a toast library like react-hot-toast
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // For now, we'll create a simple toast implementation
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white max-w-sm ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' :
      'bg-blue-500'
    }`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'transform 0.3s ease-out';
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}