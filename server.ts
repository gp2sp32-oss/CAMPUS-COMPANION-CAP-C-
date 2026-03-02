import express from "express";
import { createServer as createViteServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import Database from "better-sqlite3";

const db = new Database("university.db");

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT,
    type TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS users (
    rollNo TEXT PRIMARY KEY,
    password TEXT,
    branch TEXT,
    year TEXT,
    type TEXT DEFAULT 'student'
  );

  CREATE TABLE IF NOT EXISTS timetables (
    branch TEXT PRIMARY KEY,
    schedule TEXT -- JSON string of array
  );

  CREATE TABLE IF NOT EXISTS clubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    brief TEXT,
    members TEXT,
    head TEXT,
    category TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    date TEXT,
    description TEXT,
    location TEXT
  );

  CREATE TABLE IF NOT EXISTS holidays (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    name TEXT
  );

  CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    branch TEXT,
    year TEXT,
    semester TEXT,
    subject_name TEXT,
    UNIQUE(branch, year, semester, subject_name)
  );
`);

// Seed initial data
const initialClubs = [
  { name: 'SPECDAM', brief: 'Cultural Club focusing on arts and performances.', members: '250+', head: 'Dr. Anitha', category: 'Cultural' },
  { name: 'AALAAP', brief: 'Music Club for vocalists and instrumentalists.', members: '150+', head: 'Prof. Srinivas', category: 'Cultural' },
  { name: 'Literaze', brief: 'Literary Club for writers, poets, and debaters.', members: '120+', head: 'Dr. Madhavi', category: 'Literary' },
  { name: 'Click Cadets', brief: 'Photography Club capturing campus moments.', members: '80+', head: 'Mr. Rahul', category: 'Technical' },
  { name: 'Kriya', brief: 'Event Management Club organizing university fests.', members: '300+', head: 'Dr. Ramesh', category: 'Management' },
  { name: 'Sports', brief: 'Promoting physical fitness and competitive spirit.', members: '500+', head: 'Coach Reddy', category: 'Sports' },
];

const initialHolidays = [
  { date: '2026-01-01', name: 'New Year\'s Day' },
  { date: '2026-01-14', name: 'Sankranti' },
  { date: '2026-01-26', name: 'Republic Day' },
  { date: '2026-03-28', name: 'Ugadi' },
  { date: '2026-05-01', name: 'May Day' },
  { date: '2026-08-15', name: 'Independence Day' },
  { date: '2026-10-02', name: 'Gandhi Jayanti' },
];

const initialEvents = [
  { title: 'Agastra 2026', date: '2026-03-15', description: 'Annual Cultural Fest of Anurag University.', location: 'Main Ground' },
  { title: 'HackAnurag', date: '2026-04-10', description: '24-hour hackathon for innovative solutions.', location: 'I-Block' },
  { title: 'Sports Meet', date: '2026-02-20', description: 'Inter-departmental sports competitions.', location: 'Sports Complex' },
];

// Check and seed
const clubCount = db.prepare("SELECT COUNT(*) as count FROM clubs").get() as { count: number };
if (clubCount.count === 0) {
  const insert = db.prepare("INSERT INTO clubs (name, brief, members, head, category) VALUES (?, ?, ?, ?, ?)");
  initialClubs.forEach(c => insert.run(c.name, c.brief, c.members, c.head, c.category));
}

const holidayCount = db.prepare("SELECT COUNT(*) as count FROM holidays").get() as { count: number };
if (holidayCount.count === 0) {
  const insert = db.prepare("INSERT INTO holidays (date, name) VALUES (?, ?)");
  initialHolidays.forEach(h => insert.run(h.date, h.name));
}

const eventCount = db.prepare("SELECT COUNT(*) as count FROM events").get() as { count: number };
if (eventCount.count === 0) {
  const insert = db.prepare("INSERT INTO events (title, date, description, location) VALUES (?, ?, ?, ?)");
  initialEvents.forEach(e => insert.run(e.title, e.date, e.description, e.location));
}

// Seed initial timetables if empty
const initialTimetables = {
  'CSE': ['MON: DS, COA, MATHS', 'TUE: JAVA, OS, DBMS', 'WED: AI, ML, CN', 'THU: FLAT, WT, SE', 'FRI: LABS'],
  'ECE': ['MON: EDC, NT, MATHS', 'TUE: STLD, SS, RVSP', 'WED: AC, DC, VLSI', 'THU: MPMC, DSP, CS', 'FRI: LABS'],
  'MECH': ['MON: TD, ME, MATHS', 'TUE: KOM, DOM, MS', 'WED: HT, MT, TE', 'THU: CAD, CAM, FEA', 'FRI: LABS'],
  'CIVIL': ['MON: SM, FM, MATHS', 'TUE: SA, EE, GTE', 'WED: WRE, TE, CT', 'THU: PCS, DSS, RCC', 'FRI: LABS'],
  'Pharmacy': ['MON: PA, PC, MATHS', 'TUE: HAP, POC, BC', 'WED: PH, MC, PGY', 'THU: PJ, PP, PT', 'FRI: LABS'],
  'BBA': ['MON: POM, ACC, ECO', 'TUE: OB, MKT, HRM', 'WED: BRM, FM, MIS', 'THU: BL, QT, ED', 'FRI: SEMINARS'],
  'MBA': ['MON: AFM, ME, OB', 'TUE: MM, HRM, OM', 'WED: BRM, BE, QT', 'THU: SAPM, FD, IFM', 'FRI: CASE STUDIES'],
};

const count = db.prepare("SELECT COUNT(*) as count FROM timetables").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare("INSERT INTO timetables (branch, schedule) VALUES (?, ?)");
  Object.entries(initialTimetables).forEach(([branch, schedule]) => {
    insert.run(branch, JSON.stringify(schedule));
  });
}

async function startServer() {
  const app = express();
  app.use(express.json());
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server });
  const PORT = 3000;

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Clubs & Events Routes
  app.get("/api/clubs", (req, res) => {
    res.json(db.prepare("SELECT * FROM clubs").all());
  });

  app.get("/api/events", (req, res) => {
    res.json(db.prepare("SELECT * FROM events").all());
  });

  app.get("/api/holidays", (req, res) => {
    res.json(db.prepare("SELECT * FROM holidays").all());
  });

  app.get("/api/subjects/:branch/:year", (req, res) => {
    const { branch, year } = req.params;
    res.json(db.prepare("SELECT * FROM subjects WHERE branch = ? AND year = ?").all());
  });

  // Sync with Portal (Simulation)
  app.post("/api/sync-portal", (req, res) => {
    // In a real app, this would use a scraper or official API
    // Here we simulate fetching and updating
    
    // Example: Adding a new event found on portal
    const newEvent = { title: 'Tech Expo 2026', date: '2026-05-20', description: 'Showcasing student innovations.', location: 'Auditorium' };
    try {
      db.prepare("INSERT INTO events (title, date, description, location) VALUES (?, ?, ?, ?)").run(newEvent.title, newEvent.date, newEvent.description, newEvent.location);
    } catch (e) {}

    // Example: Adding subjects for CSE 3rd Year
    const cseSubjects = ['Data Science', 'Compiler Design', 'Web Technologies', 'Cloud Computing', 'Professional Elective-I'];
    const insertSub = db.prepare("INSERT OR IGNORE INTO subjects (branch, year, semester, subject_name) VALUES (?, ?, ?, ?)");
    cseSubjects.forEach(s => insertSub.run('CSE', '3rd Year', 'I', s));

    res.json({ success: true, message: "Synced with Anurag University Portal successfully." });
  });

  // Timetable Routes
  app.get("/api/timetables/:branch", (req, res) => {
    const row = db.prepare("SELECT * FROM timetables WHERE branch = ?").get(req.params.branch) as { branch: string, schedule: string } | undefined;
    if (row) {
      res.json(JSON.parse(row.schedule));
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  app.post("/api/timetables", (req, res) => {
    const { branch, schedule } = req.body;
    db.prepare("INSERT OR REPLACE INTO timetables (branch, schedule) VALUES (?, ?)").run(branch, JSON.stringify(schedule));
    
    // Broadcast update
    const broadcastMsg = JSON.stringify({
      type: "timetable_update",
      branch,
      schedule
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(broadcastMsg);
      }
    });

    res.json({ success: true });
  });

  // Auth Routes
  app.post("/api/auth/register", (req, res) => {
    const { rollNo, password, branch, year, type } = req.body;
    try {
      db.prepare("INSERT INTO users (rollNo, password, branch, year, type) VALUES (?, ?, ?, ?, ?)").run(rollNo, password, branch, year, type || 'student');
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: "User already exists or invalid data" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    const { rollNo, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE rollNo = ? AND password = ?").get(rollNo, password);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.get("/api/announcements", (req, res) => {
    const announcements = db.prepare("SELECT * FROM announcements ORDER BY timestamp DESC LIMIT 10").all();
    res.json(announcements);
  });

  app.post("/api/announcements", (req, res) => {
    const { title, content, type } = req.body;
    const info = db.prepare("INSERT INTO announcements (title, content, type) VALUES (?, ?, ?)").run(title, content, type);
    
    const newAnnouncement = {
      id: info.lastInsertRowid,
      title,
      content,
      type,
      timestamp: new Date().toISOString()
    };

    // Broadcast to all connected clients
    const broadcastMsg = JSON.stringify({
      type: "announcement_update",
      data: newAnnouncement
    });

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(broadcastMsg);
      }
    });

    res.json(newAnnouncement);
  });

  // WebSocket logic
  const clients = new Map<WebSocket, { roomId: string; rollNo: string }>();

  wss.on("connection", (ws) => {
    console.log("New connection");

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === "join") {
          clients.set(ws, { roomId: message.roomId, rollNo: message.rollNo });
          console.log(`${message.rollNo} joined ${message.roomId}`);
          
          // Notify others in room
          const systemMsg = JSON.stringify({
            type: "system",
            content: `${message.rollNo} joined the channel.`,
            roomId: message.roomId,
            timestamp: new Date().toISOString()
          });
          
          broadcastToRoom(message.roomId, systemMsg);
        } else if (message.type === "message") {
          const clientInfo = clients.get(ws);
          if (clientInfo) {
            const chatMsg = JSON.stringify({
              type: "message",
              sender: clientInfo.rollNo,
              content: message.content,
              roomId: clientInfo.roomId,
              timestamp: new Date().toISOString()
            });
            broadcastToRoom(clientInfo.roomId, chatMsg);
          }
        }
      } catch (err) {
        console.error("WS Error:", err);
      }
    });

    ws.on("close", () => {
      const clientInfo = clients.get(ws);
      if (clientInfo) {
        const systemMsg = JSON.stringify({
          type: "system",
          content: `${clientInfo.rollNo} left the channel.`,
          roomId: clientInfo.roomId,
          timestamp: new Date().toISOString()
        });
        broadcastToRoom(clientInfo.roomId, systemMsg);
        clients.delete(ws);
      }
    });
  });

  function broadcastToRoom(roomId: string, message: string) {
    wss.clients.forEach((client) => {
      const info = clients.get(client);
      if (client.readyState === WebSocket.OPEN && info?.roomId === roomId) {
        client.send(message);
      }
    });
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("index.html", { root: "dist" });
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
