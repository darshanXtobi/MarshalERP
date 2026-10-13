import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext(null);

export function WebSocketProvider({ children }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState({
    totalConnections: 0,
    onlineStudentsCount: 0,
    marksheetViewersCount: 0,
    marksheetViewers: [],
    students: []
  });
  const [lastNotification, setLastNotification] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/ws/live`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setConnected(true);
      if (user) {
        socket.send(JSON.stringify({
          type: 'IDENTIFY',
          userType: user.userType || 'student',
          studentId: user.studentId || user.id,
          userId: user.id,
          name: user.displayName || user.name,
          prn: user.prn || null,
          role: user.role
        }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'LIVE_METRICS_UPDATE') {
          setLiveMetrics(data);
        } else if (data.type === 'MARKSHEET_PUBLISHED') {
          setLastNotification({
            type: 'MARKSHEET_PUBLISHED',
            title: 'Official Marksheet Live!',
            message: 'Your semester results have just been released by the Examination Controller.',
            timestamp: new Date().toLocaleTimeString()
          });
        } else if (data.type === 'ATTENDANCE_UPDATED') {
          setLastNotification({
            type: 'ATTENDANCE_UPDATED',
            title: 'Attendance Updated',
            message: 'A new lecture attendance record has been submitted by faculty.',
            timestamp: new Date().toLocaleTimeString()
          });
        }
      } catch (err) {
        console.error('WS message parse error:', err);
      }
    };

    socket.onclose = () => {
      setConnected(false);
    };

    return () => {
      socket.close();
    };
  }, [user]);

  const startViewingMarksheet = (examId, examTitle) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'VIEW_MARKSHEET_START',
        examId,
        examTitle
      }));
    }
  };

  const stopViewingMarksheet = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'VIEW_MARKSHEET_STOP'
      }));
    }
  };

  return (
    <WebSocketContext.Provider value={{
      connected,
      liveMetrics,
      lastNotification,
      startViewingMarksheet,
      stopViewingMarksheet
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useLiveSocket() {
  return useContext(WebSocketContext);
}
