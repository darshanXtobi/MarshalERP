import { WebSocketServer, WebSocket } from 'ws';

const activeClients = new Map(); // ws -> clientData
let wss = null;

export function initWebSocketServer(server) {
  wss = new WebSocketServer({ server, path: '/api/ws/live' });

  wss.on('connection', (ws, req) => {
    const clientData = {
      id: Math.random().toString(36).substring(2, 9),
      userType: 'guest',
      studentId: null,
      name: 'Anonymous',
      prn: null,
      connectedAt: new Date().toISOString(),
      viewingMarksheet: false,
      examTitle: null,
      lastPing: Date.now()
    };
    activeClients.set(ws, clientData);

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleMessage(ws, data);
      } catch (e) {
        console.error('WS Parse Error:', e.message);
      }
    });

    ws.on('close', () => {
      activeClients.delete(ws);
      broadcastLiveMetrics();
    });

    // Send initial handshake
    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'Live WebSocket connected to MarshalERP Engine' }));
    broadcastLiveMetrics();
  });

  // Heartbeat ping interval
  setInterval(() => {
    const now = Date.now();
    for (const [ws, data] of activeClients.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        if (now - data.lastPing > 45000) {
          ws.terminate();
          activeClients.delete(ws);
        } else {
          ws.ping();
        }
      }
    }
  }, 30000);

  console.log('--- WebSocket Live Engine initialized on /api/ws/live ---');
}

function handleMessage(ws, data) {
  const client = activeClients.get(ws);
  if (!client) return;
  client.lastPing = Date.now();

  switch (data.type) {
    case 'IDENTIFY':
      client.userType = data.userType || 'student';
      client.studentId = data.studentId || null;
      client.userId = data.userId || null;
      client.name = data.name || 'User';
      client.prn = data.prn || null;
      client.role = data.role || null;
      broadcastLiveMetrics();
      break;

    case 'VIEW_MARKSHEET_START':
      client.viewingMarksheet = true;
      client.examTitle = data.examTitle || 'Semester Examination';
      client.examId = data.examId || null;
      broadcastLiveMetrics();
      break;

    case 'VIEW_MARKSHEET_STOP':
      client.viewingMarksheet = false;
      client.examTitle = null;
      broadcastLiveMetrics();
      break;

    case 'PING':
      ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      break;
  }
}

export function broadcastEvent(event, payload = {}) {
  if (!wss) return;
  const message = JSON.stringify({ type: event, ...payload, timestamp: new Date().toISOString() });
  for (const [ws] of activeClients.entries()) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

export function getLiveMetrics() {
  const students = [];
  const marksheetViewers = [];
  let staffCount = 0;

  for (const [, client] of activeClients.entries()) {
    if (client.userType === 'student') {
      const studentInfo = {
        studentId: client.studentId,
        name: client.name,
        prn: client.prn,
        viewingMarksheet: client.viewingMarksheet,
        examTitle: client.examTitle,
        connectedAt: client.connectedAt
      };
      students.push(studentInfo);
      if (client.viewingMarksheet) {
        marksheetViewers.push(studentInfo);
      }
    } else if (client.userType === 'staff') {
      staffCount++;
    }
  }

  return {
    totalConnections: activeClients.size,
    onlineStudentsCount: students.length,
    marksheetViewersCount: marksheetViewers.length,
    staffCount,
    marksheetViewers,
    students
  };
}

export function broadcastLiveMetrics() {
  const metrics = getLiveMetrics();
  broadcastEvent('LIVE_METRICS_UPDATE', metrics);
}
