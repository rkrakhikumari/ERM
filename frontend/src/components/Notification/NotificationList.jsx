import React, { useState, useEffect, useContext, createContext, useReducer, useRef } from 'react';
import { FaBell, FaCheck, FaTimes, FaClock, FaSync, FaWifi, FaFilter, FaList } from "react-icons/fa";
import { CiWifiOff } from "react-icons/ci";
import { IoCheckmarkDone, IoRefresh } from "react-icons/io5";
import { MdMarkAsUnread, MdOutlineNotificationsActive, MdNotificationsActive, MdSystemUpdateAlt } from "react-icons/md";
import { BiTask } from "react-icons/bi";
import { AiOutlineTeam } from "react-icons/ai";
import { GoProjectSymlink } from "react-icons/go";
import { RxUpdate } from "react-icons/rx";

function useWebSocket(url, onMessage, options = {}) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const existingNotificationIds = useRef(new Set());

  
  const { 
    reconnectDelay = 3000, 
    maxReconnectAttempts = 5,
    onOpen,
    onClose 
  } = options;
  
  let reconnectAttempts = 0;

  const connect = () => {
    try {
      const ws = new WebSocket(url);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts = 0;
        onOpen?.();
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== 'ping') {
            onMessage(data);
          }
        } catch (err) {
          console.error('WebSocket message parse error:', err);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        onClose?.();
        
        // Attempt to reconnect
        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            reconnectAttempts++;
            connect();
          }, reconnectDelay);
        }
      };
      
      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection failed');
      };
      
      setSocket(ws);
    } catch (err) {
      setError('Failed to create WebSocket connection');
    }
  };

  useEffect(() => {
    if (url) {
      connect();
    }
    
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [url]);

  return { isConnected, error, socket };
}

const createApiClient = () => {
  const baseURL = 'http://localhost:8000';
  
  const request = async (endpoint, options = {}) => {
    const token = localStorage.getItem('access_token');
    const url = `${baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...options,
    };
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  };
  
  return {
    get: (endpoint) => request(endpoint),
    post: (endpoint, data) => request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    patch: (endpoint, data) => request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (endpoint) => request(endpoint, {
      method: 'DELETE',
    }),
  };
};

const api = createApiClient();

const NotificationContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        loading: false,
        error: null
      };
        
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications]
      };
        
    case 'UPDATE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload.id 
            ? { ...notif, ...action.payload.updates }
            : notif
        )
      };
        
    case 'DELETE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notif => notif.id !== action.payload)
      };
        
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
        
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
        
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => ({ ...notif, is_read: true }))
      };
        
    default:
      return state;
  }
};

const initialState = {
  notifications: [],
  loading: true,
  error: null,
  wsConnected: false
};

export const NotificationProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  
  const actions = {
    setNotifications: (notifications) => 
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications }),
        
    addNotification: (notification) => 
      dispatch({ type: 'ADD_NOTIFICATION', payload: notification }),
        
    updateNotification: (id, updates) => 
      dispatch({ type: 'UPDATE_NOTIFICATION', payload: { id, updates } }),
        
    deleteNotification: (id) => 
      dispatch({ type: 'DELETE_NOTIFICATION', payload: id }),
        
    setLoading: (loading) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
        
    setError: (error) => 
      dispatch({ type: 'SET_ERROR', payload: error }),
        
    markAllRead: () => 
      dispatch({ type: 'MARK_ALL_READ' })
  };
  
  return (
    <NotificationContext.Provider value={{ ...state, ...actions }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

const LoadingSpinner = () => {
  return (
    <div className="max-w-full mx-auto p-8 bg-[#0D1117] min-h-screen font-sans text-white">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative mb-8">
          <div className="w-20 h-20 bg-blue-500/20 rounded-2xl flex items-center justify-center animate-pulse">
            <FaBell className="w-10 h-10 text-blue-500 animate-bounce" />
          </div>
          <div className="absolute inset-0 w-20 h-20 bg-blue-500/10 rounded-2xl animate-ping"></div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-300 mb-4">
          Loading Notifications
        </h2>
        
        <p className="text-gray-500 mb-8">
          Fetching your latest updates...
        </p>
        
        <div className="flex items-center gap-2">
          {[0, 150, 300, 450].map((delay, index) => (
            <div 
              key={index}
              className="w-2 h-8 bg-blue-500 rounded animate-pulse" 
              style={{ animationDelay: `${delay}ms` }}
            />
          ))}
        </div>
        
        <div className="w-full max-w-4xl mt-12 space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-gray-800 rounded-2xl p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-600 rounded px-2 py-1 w-12"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-700 rounded w-full"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                  <div className="h-2 bg-gray-600 rounded w-16"></div>
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
                  <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
const NotificationFilter = ({ currentFilter, onFilterChange, unreadCount, totalCount }) => {
  const filters = [
    {
      key: 'all',
      label: 'All',
      icon: FaList,
      count: totalCount,
      color: 'bg-gray-600/20 text-gray-300 border-gray-600/30 hover:bg-gray-600/30'
    },
    {
      key: 'unread',
      label: 'Unread',
      icon: MdOutlineNotificationsActive,
      count: unreadCount,
      color: 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30'
    },
    {
      key: 'read',
      label: 'Read',
      icon: IoCheckmarkDone,
      count: totalCount - unreadCount,
      color: 'bg-green-600/20 text-green-400 border-green-600/30 hover:bg-green-600/30'
    }
  ];
  
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <FaFilter className="text-gray-400 w-4 h-4" />
        <span className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
          Filter Notifications
        </span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => {
          const IconComponent = filter.icon;
          const isActive = currentFilter === filter.key;
          
          return (
            <button
              key={filter.key}
              onClick={() => onFilterChange(filter.key)}
              className={`
                flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border transition-all duration-300
                ${isActive
                  ? 'bg-blue-500/20 text-blue-500 border-blue-500/50 shadow-lg shadow-blue-500/20'
                  : filter.color
                }
                hover:-translate-y-0.5 hover:shadow-lg
              `}
            >
              <IconComponent className="w-4 h-4" />
              <span>{filter.label}</span>
              <span className={`
                px-2 py-0.5 text-xs rounded-full font-bold
                ${isActive
                  ? 'bg-blue-500/30 text-blue-500'
                  : 'bg-white/10 text-gray-400'
                }
              `}>
                {filter.count}
              </span>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        {currentFilter === 'all' && `Showing all ${totalCount} notifications`}
        {currentFilter === 'unread' && `Showing ${unreadCount} unread notifications`}
        {currentFilter === 'read' && `Showing ${totalCount - unreadCount} read notifications`}
      </div>
    </div>
  );
};

const NotificationHeader = ({ unreadCount, totalCount, wsConnected, onMarkAllRead, onRefresh }) => {
  return (
    <div className="mb-12">
      <div className="flex justify-between items-center flex-wrap gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-extrabold bg-blue-500 bg-clip-text text-transparent drop-shadow-lg">
              Notifications
            </h1>
            
            <div className={`
              flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
              ${wsConnected 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }
            `}>
              {wsConnected ? (
                <>
                  <FaWifi className="w-3 h-3" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <CiWifiOff className="w-3 h-3" />
                  <span>Offline</span>
                </>
              )}
            </div>
          </div>
          
          <p className="text-lg text-gray-400">
            Stay updated with your latest notifications{" "}
            <span className="text-blue-500 font-semibold">
              ({unreadCount} unread of {totalCount} total)
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-green-600/20 text-green-400 border border-green-600/30 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-green-600/20 hover:bg-green-600/30"
              title="Mark all as read"
            >
              <IoCheckmarkDone className="w-4 h-4" />
              Mark All Read
            </button>
          )}
          
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-700/50 text-gray-300 border border-gray-600/50 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:bg-gray-600/50"
            title="Refresh notifications"
          >
            <IoRefresh className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <FaBell className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalCount}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Total Notifications</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
              <MdOutlineNotificationsActive className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{unreadCount}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Unread</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <IoCheckmarkDone className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalCount - unreadCount}</p>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Read</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NotificationCard = ({ notification, onMarkAsRead, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getNotificationIcon = (title) => {
  if (!title) return <MdNotificationsActive/>;   

  const titleLower = title.toLowerCase();
  if (titleLower.includes('project')) return <GoProjectSymlink />;
  if (titleLower.includes('team') || titleLower.includes('invite')) return <AiOutlineTeam/>;
  if (titleLower.includes('task') || titleLower.includes('deadline')) return < BiTask/>;
  if (titleLower.includes('system') || titleLower.includes('maintenance')) return <MdSystemUpdateAlt />;
  if (titleLower.includes('update')) return <RxUpdate />;
  return <MdNotificationsActive/>;
};


  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <div 
      className={`
        bg-gray-800 backdrop-blur-lg border rounded-2xl p-6 
        transition-all duration-300 hover:-translate-y-1 hover:shadow-xl 
        ${notification.is_read 
          ? 'border-white/10 hover:border-white/20' 
          : 'border-blue-500/30 hover:border-blue-500/50 bg-gray-800/90'
        }
        ${!notification.is_read ? 'relative' : ''}
      `}
    >
      {!notification.is_read && (
        <div className="absolute top-4 left-4 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
      )}

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0
            ${notification.is_read ? 'bg-gray-700' : 'bg-blue-500'}
          `}>
            <span>{getNotificationIcon(notification.title)}</span>
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`
                text-lg font-bold truncate
                ${notification.is_read ? 'text-gray-300' : 'text-white'}
              `}>
                {notification.title}
              </h3>
              {!notification.is_read && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-semibold uppercase tracking-wide rounded-full bg-blue-500/20 text-blue-500 border border-blue-500/30">
                  New
                </span>
              )}
            </div>
            
            <p className={`
              text-sm leading-relaxed mb-3
              ${notification.is_read ? 'text-gray-500' : 'text-gray-300'}
            `}>
              {notification.message}
            </p>
            
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <FaClock className="w-3 h-3" />
              <span>{formatDate(notification.created_at)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!notification.is_read && (
            <button
              onClick={handleMarkAsRead}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all duration-200 group"
              title="Mark as read"
            >
              <IoCheckmarkDone className="w-4 h-4 group-hover:scale-110 transition-transform" />
            </button>
          )}
          
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200 group"
            title="Delete notification"
          >
            <FaTimes className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          {notification.is_read ? (
            <>
              <FaCheck className="w-3 h-3 text-gray-500" />
              <span className="text-xs text-gray-500">Read</span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-xs text-blue-500 font-medium">Unread</span>
            </>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          ID: {notification.id}
        </div>
      </div>
    </div>
  );
};

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const existingNotificationIds = useRef(new Set());


  const token = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const { isConnected: wsConnected, error: wsError } = useWebSocket(
  token ? `ws://localhost:8000/notifications/ws/notifications?token=${token}` : null,
  (newNotification) => {
    console.log("New notification received:", newNotification);

    if (!existingNotificationIds.current.has(newNotification.id)) {
      setNotifications((prev) => [newNotification, ...prev]);
      existingNotificationIds.current.add(newNotification.id); // track it

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: "/favicon.ico",
        });
      }
    }
  },
  {
    reconnectDelay: 3000,
    maxReconnectAttempts: 5,
    onOpen: () => console.log("Connected to notification service"),
    onClose: () => console.log("Disconnected from notification service"),
  }
);


  useEffect(() => {
    fetchNotifications();
    requestNotificationPermission();
  }, []);

  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission();
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get("/notifications/me");
      console.log("Notifications fetched:", data);
      setNotifications(data);

      existingNotificationIds.current = new Set(data.map(n => n.id));

    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      await api.patch(`/notifications/${notificationId}`, { is_read: true });
    } catch (err) {
      console.error("Error marking notification as read:", err);
      fetchNotifications();
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      await api.delete(`/notifications/${notificationId}`);
    } catch (err) {
      console.error("Error deleting notification:", err);
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      await api.post("/notifications/mark-all-read");
    } catch (err) {
      console.error("Error marking all as read:", err);
      fetchNotifications();
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.is_read;
    if (filter === "read") return n.is_read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-full mx-auto p-8 bg-gray-900 h-full font-sans text-white">
      <NotificationHeader
        unreadCount={unreadCount}
        totalCount={notifications.length}
        wsConnected={wsConnected}
        onMarkAllRead={markAllAsRead}
        onRefresh={fetchNotifications}
      />

      <NotificationFilter
        currentFilter={filter}
        onFilterChange={setFilter}
        unreadCount={unreadCount}
        totalCount={notifications.length}
      />

      {error && (
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
          <p className="text-red-400">Error: {error}</p>
        </div>
      )}

      {wsError && (
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
          <p className="text-yellow-400">WebSocket issue: {wsError}</p>
        </div>
      )}

      {filteredNotifications.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaBell className="w-10 h-10 text-gray-500" />
          </div>
          <p className="text-gray-400 text-lg">
            {filter === 'unread' ? 'No unread notifications' : 
             filter === 'read' ? 'No read notifications' : 
             'No notifications yet'}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            {filter === 'all' ? 'New notifications will appear here' : ''}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((n) => (
            <NotificationCard
            key={n.id || n.created_at || Math.random()}
            notification={n}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
          />

          ))}
        </div>
      )}
    </div>
  );
};

export default function NotificationApp() {
  return (
    <NotificationProvider>
      <NotificationList />
    </NotificationProvider>
  );
}