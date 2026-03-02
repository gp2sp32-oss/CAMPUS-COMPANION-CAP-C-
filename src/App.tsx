/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  MapPin, 
  Bell, 
  Send, 
  User, 
  Bot,
  ChevronRight,
  BarChart3,
  FileText,
  Clock,
  Coffee,
  Library,
  Search,
  Trophy,
  Mic2,
  Phone,
  LogOut,
  Zap,
  ShieldAlert,
  CreditCard,
  Briefcase,
  Store,
  Users,
  Lock,
  Calendar,
  AlertCircle,
  History,
  Navigation,
  Info,
  Hash,
  Video,
  MessageSquare,
  Settings,
  X,
  Edit3,
  Trash2,
  Plus,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getChatResponse } from './services/geminiService';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

type ChatMode = 'buddy' | 'coach';

const TIMETABLES: Record<string, string[]> = {
  'CSE': ['MON: DS, COA, MATHS', 'TUE: JAVA, OS, DBMS', 'WED: AI, ML, CN', 'THU: FLAT, WT, SE', 'FRI: LABS'],
  'ECE': ['MON: EDC, NT, MATHS', 'TUE: STLD, SS, RVSP', 'WED: AC, DC, VLSI', 'THU: MPMC, DSP, CS', 'FRI: LABS'],
  'MECH': ['MON: TD, ME, MATHS', 'TUE: KOM, DOM, MS', 'WED: HT, MT, TE', 'THU: CAD, CAM, FEA', 'FRI: LABS'],
  'CIVIL': ['MON: SM, FM, MATHS', 'TUE: SA, EE, GTE', 'WED: WRE, TE, CT', 'THU: PCS, DSS, RCC', 'FRI: LABS'],
  'Pharmacy': ['MON: PA, PC, MATHS', 'TUE: HAP, POC, BC', 'WED: PH, MC, PGY', 'THU: PJ, PP, PT', 'FRI: LABS'],
  'BBA': ['MON: POM, ACC, ECO', 'TUE: OB, MKT, HRM', 'WED: BRM, FM, MIS', 'THU: BL, QT, ED', 'FRI: SEMINARS'],
  'MBA': ['MON: AFM, ME, OB', 'TUE: MM, HRM, OM', 'WED: BRM, BE, QT', 'THU: SAPM, FD, IFM', 'FRI: CASE STUDIES'],
};

const CLUB_DETAILS: Record<string, { brief: string; members: string; head: string }> = {
  'Tech Club': { brief: 'The hub for all things coding, robotics, and innovation at Anurag University.', members: '450+', head: 'Dr. Srinivas' },
  'A-Cube': { brief: 'Anurag Arts and Aesthetics Club for creative minds to express themselves.', members: '200+', head: 'Prof. Lakshmi' },
  'Sahaya': { brief: 'Social service wing focusing on community development and social impact.', members: '300+', head: 'Dr. Ramesh' },
  'Sports': { brief: 'Promoting physical fitness and competitive spirit across all departments.', members: '500+', head: 'Coach Reddy' },
};

const FACULTY_EMAILS: Record<string, { name: string; email: string }[]> = {
  'CSE': [{ name: 'Dr. A. Sharma (HOD)', email: 'hod.cse@anurag.edu.in' }, { name: 'Prof. B. Rao', email: 'b.rao@anurag.edu.in' }],
  'ECE': [{ name: 'Dr. C. Reddy (HOD)', email: 'hod.ece@anurag.edu.in' }, { name: 'Prof. D. Kumar', email: 'd.kumar@anurag.edu.in' }],
  'MECH': [{ name: 'Dr. E. Khan (HOD)', email: 'hod.mech@anurag.edu.in' }, { name: 'Prof. F. Singh', email: 'f.singh@anurag.edu.in' }],
  'CIVIL': [{ name: 'Dr. G. Murthy (HOD)', email: 'hod.civil@anurag.edu.in' }, { name: 'Prof. H. Patel', email: 'h.patel@anurag.edu.in' }],
  'Pharmacy': [{ name: 'Dr. I. Gupta (HOD)', email: 'hod.pharmacy@anurag.edu.in' }, { name: 'Prof. J. Das', email: 'j.das@anurag.edu.in' }],
  'BBA': [{ name: 'Dr. K. Reddy (HOD)', email: 'hod.bba@anurag.edu.in' }, { name: 'Prof. L. Rao', email: 'l.rao@anurag.edu.in' }],
  'MBA': [{ name: 'Dr. M. Rao (HOD)', email: 'hod.mba@anurag.edu.in' }, { name: 'Prof. N. Kumar', email: 'n.kumar@anurag.edu.in' }],
};

const STUDENT_FAQS = [
  { q: "What is the minimum attendance requirement?", a: "Students must maintain at least 75% attendance in each subject to be eligible for exams." },
  { q: "How can I apply for a leave?", a: "Leave applications must be submitted via the student portal and approved by the HOD." },
  { q: "What is the dress code?", a: "Students are expected to wear formal/semi-formal attire. Identity cards are mandatory at all times." },
  { q: "Where is the library located?", a: "The central library is located in the I-Block, 2nd floor." },
];

const REMINDERS = [
  { date: '2026-03-09', event: 'Mid Exams Start' },
  { date: '2026-03-15', event: 'Hackathon Registration Deadline' },
  { date: '2026-03-20', event: 'Fee Payment Last Date' },
];

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginType, setLoginType] = useState<'student' | 'admin'>('student');
  const [year, setYear] = useState('');
  const [branch, setBranch] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [password, setPassword] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showTimetable, setShowTimetable] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [showFAQs, setShowFAQs] = useState(false);
  const [showFaculty, setShowFaculty] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light' | 'reader'>('dark');
  const [showForgotPass, setShowForgotPass] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [chatMode, setChatMode] = useState<ChatMode>('buddy');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const [buddyMessages, setBuddyMessages] = useState<Message[]>([
    { role: 'assistant', content: "Buddy Mode Active. 👋" }
  ]);
  const [coachMessages, setCoachMessages] = useState<Message[]>([
    { role: 'assistant', content: "ANTI-PROCRASTINATION MODE ACTIVATED. 😤" }
  ]);
  
  const [lastBuddyQuery, setLastBuddyQuery] = useState<Message[] | null>(null);
  const [lastCoachQuery, setLastCoachQuery] = useState<Message[] | null>(null);
  const [lastUserQuery, setLastUserQuery] = useState('');

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const networkChatEndRef = useRef<HTMLDivElement>(null);

  const [showSOS, setShowSOS] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showClubsAndEvents, setShowClubsAndEvents] = useState(false);
  const [showSyllabus, setShowSyllabus] = useState(false);
  const [showNetworking, setShowNetworking] = useState(false);
  const [showMobileLeftSidebar, setShowMobileLeftSidebar] = useState(false);
  const [showMobileRightSidebar, setShowMobileRightSidebar] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [activeChannel, setActiveChannel] = useState('club:Tech Club');
  const [networkMessages, setNetworkMessages] = useState<Record<string, any[]>>({});
  const [networkInput, setNetworkInput] = useState('');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [adminAnnouncement, setAdminAnnouncement] = useState('');
  const [dynamicTimetable, setDynamicTimetable] = useState<string[]>([]);
  const [adminTimetableInput, setAdminTimetableInput] = useState('');
  const [adminTimetableBranch, setAdminTimetableBranch] = useState('CSE');
  const [isSyncing, setIsSyncing] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const BUS_ROUTES = Array.from({ length: 22 }, (_, i) => {
    const routeNo = i + 1;
    const buses = [routeNo * 3 - 2, routeNo * 3 - 1, routeNo * 3].filter(n => n <= 65);
    const destinations = [
      "Uppal - Boduppal", "LB Nagar - Hayathnagar", "Secunderabad - ECIL", "Kukatpally - Miyapur",
      "Dilsukhnagar - Malakpet", "Tarnaka - Habsiguda", "Mehdipatnam - Banjara Hills", "SR Nagar - Ameerpet",
      "Nagole - Bandlaguda", "Vanasthalipuram - Panama", "Kothapet - Chaitanyapuri", "Cherlapally - Kushaiguda",
      "Malkajgiri - Alwal", "Balanagar - Jeedimetla", "Patancheru - Lingampally", "Gachibowli - Kondapur",
      "Attapur - Rajendranagar", "Santoshnagar - Chandrayangutta", "Charminar - Falaknuma", "Abids - Koti",
      "Himayatnagar - RTC X Roads", "Vidyanagar - Osmania"
    ];
    return {
      route: routeNo,
      buses,
      destination: destinations[i] || "Various Locations"
    };
  });

  const messages = chatMode === 'buddy' ? buddyMessages : coachMessages;

  useEffect(() => {
    if (isLoggedIn) {
      fetch('/api/announcements')
        .then(res => res.json())
        .then(data => setAnnouncements(data))
        .catch(err => console.error('Failed to fetch announcements:', err));

      fetch('/api/clubs')
        .then(res => res.json())
        .then(data => setClubs(data))
        .catch(err => console.error('Failed to fetch clubs:', err));

      fetch('/api/events')
        .then(res => res.json())
        .then(data => setEvents(data))
        .catch(err => console.error('Failed to fetch events:', err));

      fetch('/api/holidays')
        .then(res => res.json())
        .then(data => setHolidays(data))
        .catch(err => console.error('Failed to fetch holidays:', err));

      if (branch) {
        fetch(`/api/timetables/${branch}`)
          .then(res => res.json())
          .then(data => setDynamicTimetable(data))
          .catch(err => console.error('Failed to fetch timetable:', err));

        fetch(`/api/subjects/${branch}/${year}`)
          .then(res => res.json())
          .then(data => setSubjects(data))
          .catch(err => console.error('Failed to fetch subjects:', err));
      }
    }
  }, [isLoggedIn, branch, year]);

  useEffect(() => {
    if (isLoggedIn) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}`);
      socketRef.current = socket;

      socket.onopen = () => {
        if (showNetworking) {
          socket.send(JSON.stringify({ type: 'join', roomId: activeChannel, rollNo }));
        }
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'announcement_update') {
          setAnnouncements(prev => [data.data, ...prev].slice(0, 10));
        } else if (data.type === 'timetable_update') {
          if (data.branch === branch) {
            setDynamicTimetable(data.schedule);
          }
        } else {
          setNetworkMessages(prev => ({
            ...prev,
            [data.roomId]: [...(prev[data.roomId] || []), data]
          }));
        }
      };

      return () => {
        socket.close();
      };
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && showNetworking && socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'join', roomId: activeChannel, rollNo }));
    }
  }, [showNetworking, activeChannel, isLoggedIn]);

  const sendNetworkMessage = (content: string) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'message', content }));
      setNetworkInput('');
    }
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollNetworkToBottom = () => {
    networkChatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (showNetworking) {
      scrollNetworkToBottom();
    }
  }, [networkMessages, activeChannel, showNetworking]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    
    if (isRegistering) {
      if (!rollNo.trim() || !password.trim() || !branch || !year) {
        setAuthError('Please fill all fields');
        return;
      }
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rollNo, password, branch, year, type: loginType })
        });
        if (res.ok) {
          setIsRegistering(false);
          setAuthError('Registration successful! Please sign in.');
        } else {
          const data = await res.json();
          setAuthError(data.error || 'Registration failed');
        }
      } catch (err) {
        setAuthError('Network error');
      }
    } else {
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rollNo, password })
        });
        if (res.ok) {
          const data = await res.json();
          setBranch(data.user.branch);
          setYear(data.user.year);
          setLoginType(data.user.type);
          setIsLoggedIn(true);
        } else {
          setAuthError('Invalid credentials');
        }
      } catch (err) {
        setAuthError('Network error');
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setBuddyMessages([{ role: 'assistant', content: "Buddy Mode Active. 👋" }]);
    setCoachMessages([{ role: 'assistant', content: "ANTI-PROCRASTINATION MODE ACTIVATED. 😤" }]);
    setRollNo('');
    setPassword('');
    setBranch('');
    setYear('');
    setLoginType('student');
    setShowStats(false);
    setShowNetworking(false);
    setShowAdminPanel(false);
    setShowForgotPass(false);
    setForgotEmail('');
    setShowCodeInput(false);
    setVerificationCode('');
  };

  const postAnnouncement = async () => {
    if (!adminAnnouncement.trim()) return;
    try {
      await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Admin Update',
          content: adminAnnouncement,
          type: 'info'
        })
      });
      setAdminAnnouncement('');
    } catch (err) {
      console.error('Failed to post announcement:', err);
    }
  };

  const postTimetableUpdate = async () => {
    if (!adminTimetableInput.trim()) return;
    const schedule = adminTimetableInput.split('\n').filter(line => line.trim());
    try {
      const res = await fetch('/api/timetables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch: adminTimetableBranch, schedule })
      });
      if (res.ok) {
        setAdminTimetableInput('');
        alert('Timetable updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update timetable:', err);
    }
  };
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript;
      if (transcript) {
        setInput(transcript);
        // Auto-send voice queries
        handleSendMessage(undefined, transcript);
      }
    };

    recognition.start();
  };

  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Clean text for speech (remove stars and emojis for clearer reading)
    const cleanText = text.replace(/\*/g, '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const toggleMode = () => {
    const newMode = chatMode === 'buddy' ? 'coach' : 'buddy';
    setChatMode(newMode);
  };

  const restoreHistory = () => {
    if (lastUserQuery) {
      setInput(lastUserQuery);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, voiceInput?: string) => {
    e?.preventDefault();
    const finalInput = voiceInput || input;
    if (!finalInput.trim() || isLoading) return;

    const userMessage = finalInput.trim();
    setLastUserQuery(userMessage);
    setInput('');
    
    // Save current history as "last query" before updating
    if (chatMode === 'buddy') setLastBuddyQuery([...buddyMessages]);
    else setLastCoachQuery([...coachMessages]);

    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    
    if (chatMode === 'buddy') setBuddyMessages(newMessages);
    else setCoachMessages(newMessages);
    
    setIsLoading(true);

    const history = newMessages.map(m => ({
      role: m.role === 'user' ? 'user' as const : 'model' as const,
      parts: [{ text: m.content }]
    }));

    const contextualMessage = `[Student Info: ${year}, ${branch}, Mode: ${chatMode}] ${userMessage}`;

    const response = await getChatResponse(contextualMessage, history, chatMode);
    
    // Clean response of stars as requested
    const cleanResponse = response.replace(/\*/g, '');
    
    const finalMessages: Message[] = [...newMessages, { role: 'assistant', content: cleanResponse }];
    if (chatMode === 'buddy') setBuddyMessages(finalMessages);
    else setCoachMessages(finalMessages);
    
    setIsLoading(false);
    speak(cleanResponse);
  };

  const BuddyLogo = ({ size = "lg" }: { size?: "sm" | "lg" }) => (
    <motion.div 
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative group cursor-pointer"
    >
      <div className={`absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${size === 'sm' ? 'scale-75' : ''}`}></div>
      <div className={`relative ${size === 'sm' ? 'w-10 h-10' : 'w-12 h-12'} bg-white rounded-2xl flex items-center justify-center shadow-xl border border-white/20 overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 rounded-2xl"></div>
        <Bot className={`text-[#0a192f] ${size === 'sm' ? 'w-6 h-6' : 'w-7 h-7'} relative z-10`} />
        
        {/* Animated background elements */}
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 opacity-10"
        >
          <div className="absolute top-0 left-0 w-full h-full border-2 border-dashed border-emerald-500 rounded-full scale-150" />
        </motion.div>

        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white z-20"
        />
      </div>
    </motion.div>
  );

  const SidebarContent = () => (
    <div className="space-y-4">
      <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">
          {loginType === 'student' ? 'Student Profile' : 'Faculty Profile'}
        </p>
        <p className="text-sm font-bold text-white mb-0.5">{rollNo}</p>
        <p className="text-[10px] text-zinc-400 flex items-center gap-2">
          <span className="w-1 h-1 bg-emerald-500 rounded-full" />
          {branch} {loginType === 'student' ? `• ${year}` : ''}
        </p>
      </div>

      {loginType === 'student' && (
        <button 
          onClick={() => setShowStats(!showStats)}
          className={`w-full ${theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-black'} font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg`}
        >
          <BarChart3 size={16} />
          {showStats ? 'HIDE STATS' : 'ANALYZE MY STATS'}
        </button>
      )}

      <button 
        onClick={() => {
          setShowNetworking(true);
          setShowMobileLeftSidebar(false);
        }}
        className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 uppercase tracking-widest"
      >
        <Users size={16} />
        NETWORKING
      </button>

      {loginType === 'admin' && (
        <button 
          onClick={() => {
            setShowAdminPanel(true);
            setShowMobileLeftSidebar(false);
          }}
          className="w-full bg-blue-600 text-white font-black py-4 rounded-xl text-sm hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 uppercase tracking-widest"
        >
          <Settings size={18} />
          ADMIN CONTROLS
        </button>
      )}
    </div>
  );

  const PortalContent = () => (
    <div className="flex-1 p-8 overflow-y-auto space-y-10 scrollbar-hide">
      {loginType === 'student' && (
        <AnimatePresence>
          {showStats && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 overflow-hidden"
            >
              <div className={`p-4 border ${theme === 'dark' ? 'border-zinc-800/50 bg-zinc-900/30' : 'border-zinc-200 bg-zinc-100'} rounded-xl backdrop-blur-sm`}>
                <p className="text-[10px] uppercase text-zinc-500 mb-1">Attendance</p>
                <div className="flex items-end justify-between mb-2">
                  <span className="text-2xl font-mono font-bold">85%</span>
                </div>
                <div className={`w-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'} h-1.5 rounded-full overflow-hidden`}>
                  <div className={`${theme === 'dark' ? 'bg-white' : 'bg-zinc-900'} h-full w-[85%] rounded-full`} />
                </div>
              </div>
              <div className={`p-4 border ${theme === 'dark' ? 'border-zinc-800/50 bg-zinc-900/30' : 'border-zinc-200 bg-zinc-100'} rounded-xl backdrop-blur-sm flex justify-between items-center`}>
                <div>
                  <p className="text-[10px] uppercase text-zinc-500">Current CGPA</p>
                  <p className="text-2xl font-mono font-bold">8.9</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <section className="space-y-4">
        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-black flex items-center gap-2">
          <Calendar size={12} />
          {loginType === 'student' ? 'Academic Schedule' : 'Scheduled Classes'}
        </h3>
        <button 
          onClick={() => setShowTimetable(true)}
          className={`w-full py-4 rounded-xl border font-black text-xs transition-all flex items-center justify-center gap-2 group ${
            theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
          }`}
        >
          <Clock size={16} className="group-hover:rotate-12 transition-transform" />
          VIEW TIMETABLE
        </button>
      </section>

      {loginType === 'student' && (
        <>
          <button 
            onClick={() => setShowRoutes(true)}
            className={`w-full ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'} border font-black py-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 group`}
          >
            <Navigation size={16} />
            BUS ROUTES
          </button>

          <div>
            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">Resources</h3>
            <div className="space-y-2">
              <button 
                onClick={() => {
                  if (!branch || !year) return;
                  const syllabusUrl = `https://anurag.edu.in/syllabus/${branch.toLowerCase()}-${(year.split(' ')[0] || '').toLowerCase()}`;
                  window.open(syllabusUrl, '_blank');
                }}
                className={`w-full text-left p-3.5 rounded-xl border ${theme === 'dark' ? 'border-zinc-800/50 hover:border-zinc-500 hover:bg-zinc-900/50' : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100'} transition-all flex items-center gap-3 group`}
              >
                <FileText size={16} className="text-zinc-500 group-hover:text-white" />
                <span className="text-xs font-medium">Syllabus Portal ({branch})</span>
              </button>
              <button 
                onClick={() => setShowFaculty(true)}
                className={`w-full text-left p-3.5 rounded-xl border ${theme === 'dark' ? 'border-zinc-800/50 hover:border-zinc-500 hover:bg-zinc-900/50' : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100'} transition-all flex items-center gap-3 group`}
              >
                <User size={16} className="text-zinc-500 group-hover:text-white" />
                <span className="text-xs font-medium">Faculty Contacts</span>
              </button>
              <button 
                onClick={() => setShowFAQs(true)}
                className={`w-full text-left p-3.5 rounded-xl border ${theme === 'dark' ? 'border-zinc-800/50 hover:border-zinc-500 hover:bg-zinc-900/50' : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100'} transition-all flex items-center gap-3 group`}
              >
                <ShieldAlert size={16} className="text-zinc-500 group-hover:text-white" />
                <span className="text-xs font-medium">Student FAQs & Rules</span>
              </button>
            </div>
          </div>

          <button 
            onClick={() => setShowSOS(true)}
            className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-black py-4 rounded-xl text-xs hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 group"
          >
            <AlertCircle size={16} className="group-hover:animate-pulse" />
            SOS EMERGENCY
          </button>
        </>
      )}
    </div>
  );

  const NavigatorContent = () => (
    <>
      <div className="p-8 border-b border-zinc-800">
        <div className="flex flex-col gap-6 mb-8">
          <button 
            onClick={() => {
              const themes: ('dark' | 'light' | 'reader')[] = ['dark', 'light', 'reader'];
              const nextIndex = (themes.indexOf(theme) + 1) % themes.length;
              setTheme(themes[nextIndex]);
            }}
            className={`w-full py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${
              theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 
              theme === 'light' ? 'bg-zinc-900 text-white hover:bg-black' : 
              'bg-[#5b4636] text-[#f4ecd8] hover:opacity-90'
            }`}
          >
            <Zap size={14} />
            Switch Theme: {theme}
          </button>

          <div className="flex items-center gap-2">
            <Navigation size={18} className="text-blue-500" />
            <h2 className="text-sm font-bold tracking-widest uppercase text-zinc-200">Campus Navigator</h2>
          </div>
        </div>
        
        <div className="mb-4">
          <motion.div 
            className="aspect-video bg-white rounded-2xl border border-zinc-200 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-[#f8f9fa]">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              <div className="absolute top-[15%] left-[20%] w-12 h-8 bg-zinc-200 rounded border border-zinc-300 flex items-center justify-center text-[6px] font-bold text-zinc-500">Block A</div>
              <div className="absolute top-[15%] right-[20%] w-12 h-8 bg-zinc-200 rounded border border-zinc-300 flex items-center justify-center text-[6px] font-bold text-zinc-500">Block B</div>
              <div className="absolute bottom-[30%] left-[20%] w-12 h-8 bg-zinc-200 rounded border border-zinc-300 flex items-center justify-center text-[6px] font-bold text-zinc-500">Block C</div>
              <div className="absolute bottom-[30%] right-[20%] w-12 h-8 bg-zinc-200 rounded border border-zinc-300 flex items-center justify-center text-[6px] font-bold text-zinc-500">Block D</div>
              <div className="absolute top-[40%] left-[40%] w-14 h-10 bg-blue-100 rounded border border-blue-200 flex items-center justify-center text-[6px] font-bold text-blue-500">I-Block</div>
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-2 bg-zinc-800 flex items-center justify-center text-[4px] text-white font-black uppercase tracking-widest">Entrance</div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg relative">
                <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-40" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto space-y-10 scrollbar-hide">
        <section>
          <h3 className="text-[10px] uppercase tracking-widest text-white font-black flex items-center gap-2 mb-4">
            <Bell size={12} />
            Live Updates
          </h3>
          <div className="space-y-3">
            {announcements.length > 0 ? (
              announcements.map((ann, i) => (
                <motion.div 
                  key={ann.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 border border-emerald-500/30 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase text-emerald-500">{ann.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium">{ann.content}</p>
                  <p className="text-[8px] text-zinc-600 mt-2 font-mono uppercase">{new Date(ann.timestamp).toLocaleTimeString()}</p>
                </motion.div>
              ))
            ) : (
              <>
                <div className="p-4 border border-yellow-500/30 rounded-2xl bg-yellow-500/10 hover:bg-yellow-500/20 transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={14} className="text-yellow-500" />
                    <span className="text-[10px] font-bold uppercase text-yellow-500">Hackathon 2026</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium">Registrations Open! Win prizes up to 50k.</p>
                </div>
                <div className="p-4 border border-yellow-500/30 rounded-2xl bg-yellow-500/5 hover:bg-yellow-500/10 transition-all">
                  <div className="flex items-center gap-2 mb-2">
                    <Mic2 size={14} className="text-yellow-500" />
                    <span className="text-[10px] font-bold uppercase text-yellow-500">Agastra Auditions</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-medium">Showcase your talent. Auditions start Monday.</p>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <div className="p-6 border-t border-zinc-800">
        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
          <Search size={12} className="animate-pulse" />
          ANURAG NETWORK: SECURE
        </div>
      </div>
    </>
  );

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#112240]/80 backdrop-blur-2xl rounded-3xl p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 relative overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />

          <div className="flex flex-col items-center mb-10 relative z-10">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="mb-6"
            >
              <BuddyLogo />
            </motion.div>
            <h1 className="text-3xl font-black text-white tracking-tight mb-1">
              {loginType === 'student' ? 'Cap C' : 'Admin Portal'}
            </h1>
            <p className="text-emerald-400/80 text-xs font-bold uppercase tracking-[0.2em]">
              Anurag University
            </p>
          </div>

          <div className="flex bg-[#0a192f]/50 p-1 rounded-xl mb-8 border border-white/5">
            <button 
              onClick={() => { setLoginType('student'); setIsRegistering(false); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${loginType === 'student' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              Student
            </button>
            <button 
              onClick={() => { setLoginType('admin'); setIsRegistering(false); }}
              className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${loginType === 'admin' ? 'bg-emerald-500 text-black' : 'text-zinc-500 hover:text-white'}`}
            >
              Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 relative z-10">
            {authError && (
              <div className={`p-3 rounded-xl text-[10px] font-bold uppercase text-center ${authError.includes('successful') ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                {authError}
              </div>
            )}
            <div className="space-y-4">
              {(loginType === 'student' || isRegistering) && (
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Branch</label>
                  <select 
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-[#0a192f]/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-400 transition-all appearance-none cursor-pointer backdrop-blur-md"
                  >
                    <option value="" disabled>Select Branch</option>
                    <option>CSE</option>
                    <option>ECE</option>
                    <option>MECH</option>
                    <option>CIVIL</option>
                    <option>Pharmacy</option>
                    <option>BBA</option>
                    <option>MBA</option>
                  </select>
                </div>
              )}

              {(loginType === 'student' || isRegistering) && (
                <div>
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Academic Year</label>
                  <select 
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full bg-[#0a192f]/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-400 transition-all appearance-none cursor-pointer backdrop-blur-md"
                  >
                    <option value="" disabled>Select Year</option>
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
              )}

              <div className="relative">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">
                  {loginType === 'student' ? 'Roll Number' : 'Faculty ID'}
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input 
                    type="text"
                    required
                    placeholder="Enter your university ID"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    className="w-full bg-[#0a192f]/50 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-emerald-400 transition-all placeholder:text-zinc-600 backdrop-blur-md"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input 
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#0a192f]/50 border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white focus:outline-none focus:border-emerald-400 transition-all placeholder:text-zinc-600 backdrop-blur-md"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-[#0a192f] font-black py-5 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 group"
            >
              {isRegistering ? 'CREATE ACCOUNT' : 'SIGN IN'}
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex flex-col gap-4">
              <button 
                type="button"
                onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }}
                className="w-full text-emerald-400 text-[10px] font-bold uppercase tracking-widest hover:text-emerald-300 transition-colors"
              >
                {isRegistering ? 'Already have an account? Sign In' : 'New Student? Register Here'}
              </button>
              
              {!isRegistering && (
                <button 
                  type="button"
                  onClick={() => setShowForgotPass(true)}
                  className="w-full text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          </form>

          {/* Forgot Password Modal */}
          <AnimatePresence>
            {showForgotPass && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              >
                <motion.div 
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="w-full max-w-sm bg-[#112240] border border-white/10 rounded-3xl p-8 shadow-2xl"
                >
                  {!showCodeInput ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Reset Password</h2>
                        <p className="text-zinc-400 text-xs">Enter your university email to receive a 4-digit code.</p>
                      </div>
                      <input 
                        type="email"
                        placeholder="email@anurag.edu.in"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full bg-[#0a192f]/50 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-emerald-400 transition-all"
                      />
                      <button 
                        onClick={() => {
                          if (forgotEmail) {
                            setShowCodeInput(true);
                            alert("A 4-digit code has been sent to your email (Simulated: 1234)");
                          }
                        }}
                        className="w-full bg-emerald-500 text-[#0a192f] font-black py-4 rounded-xl hover:bg-emerald-400 transition-all uppercase text-xs"
                      >
                        Send Code
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="text-center">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">Enter Code</h2>
                        <p className="text-zinc-400 text-xs">A 4-digit code was sent to {forgotEmail}</p>
                      </div>
                      <input 
                        type="text"
                        maxLength={4}
                        placeholder="0000"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        className="w-full bg-[#0a192f]/50 border border-white/10 rounded-2xl px-5 py-4 text-white text-center text-2xl font-black tracking-[1em] focus:outline-none focus:border-emerald-400 transition-all"
                      />
                      <button 
                        onClick={() => {
                          if (verificationCode === '1234') {
                            setIsLoggedIn(true);
                            setShowForgotPass(false);
                          } else {
                            alert("Invalid code. Try 1234");
                          }
                        }}
                        className="w-full bg-emerald-500 text-[#0a192f] font-black py-4 rounded-xl hover:bg-emerald-400 transition-all uppercase text-xs"
                      >
                        Verify & Login
                      </button>
                    </div>
                  )}
                  <button 
                    onClick={() => { setShowForgotPass(false); setShowCodeInput(false); }}
                    className="w-full mt-4 text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Back to Login
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  const themeClasses = {
    dark: 'bg-black text-white border-zinc-800',
    light: 'bg-zinc-50 text-zinc-900 border-zinc-200',
    reader: 'bg-[#f4ecd8] text-[#5b4636] border-[#dcd0b8]'
  };

  return (
    <div className={`flex h-screen ${themeClasses[theme]} font-sans selection:bg-white selection:text-black overflow-hidden transition-colors duration-500 flex-col lg:flex-row`}>
      {/* Mobile Header */}
      <header className="lg:hidden h-16 border-b border-zinc-800 bg-black/50 backdrop-blur-md flex items-center justify-between px-4 z-40">
        <button 
          onClick={() => setShowMobileLeftSidebar(true)}
          className="p-2 text-zinc-400 hover:text-white"
        >
          <Users size={24} />
        </button>
        <div className="flex items-center gap-2">
          <BuddyLogo size="sm" />
          <span className="font-black text-xs tracking-tighter uppercase">Cap C</span>
        </div>
        <button 
          onClick={() => setShowMobileRightSidebar(true)}
          className="p-2 text-zinc-400 hover:text-white"
        >
          <Navigation size={24} />
        </button>
      </header>

      {/* Mobile Left Sidebar Overlay */}
      <AnimatePresence>
        {showMobileLeftSidebar && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileLeftSidebar(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 left-0 w-80 z-[70] border-r ${theme === 'dark' ? 'bg-zinc-950' : theme === 'light' ? 'bg-white' : 'bg-[#efe6cf]'} p-6 flex flex-col lg:hidden`}
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <BuddyLogo size="sm" />
                  <h1 className="text-sm font-bold tracking-tighter uppercase leading-tight">Cap C</h1>
                </div>
                <button onClick={() => setShowMobileLeftSidebar(false)} className="p-2 text-zinc-500">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <SidebarContent />
                <div className="mt-8">
                  <PortalContent />
                </div>
              </div>
              <div className="pt-6 border-t border-zinc-800 mt-auto">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 text-red-400 rounded-xl font-bold text-xs uppercase tracking-widest"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Right Sidebar Overlay */}
      <AnimatePresence>
        {showMobileRightSidebar && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileRightSidebar(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed inset-y-0 right-0 w-80 z-[70] border-l ${theme === 'dark' ? 'bg-zinc-950' : theme === 'light' ? 'bg-white' : 'bg-[#efe6cf]'} flex flex-col lg:hidden`}
            >
              <div className="p-4 flex justify-start">
                <button onClick={() => setShowMobileRightSidebar(false)} className="p-2 text-zinc-500">
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto scrollbar-hide">
                <NavigatorContent />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      {/* Desktop Sidebar - Portal */}
      <aside className={`hidden lg:flex w-80 border-r ${theme === 'dark' ? 'bg-zinc-950/50' : theme === 'light' ? 'bg-white' : 'bg-[#efe6cf]'} backdrop-blur-xl flex-col`}>
        <div className="p-8 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BuddyLogo size="sm" />
              <h1 className="text-lg font-bold tracking-tighter uppercase leading-tight">Cap C</h1>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-red-400"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">
                {loginType === 'student' ? 'Student Profile' : 'Faculty Profile'}
              </p>
              <p className="text-sm font-bold text-white mb-0.5">{rollNo}</p>
              <p className="text-[10px] text-zinc-400 flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                {branch} {loginType === 'student' ? `• ${year}` : ''}
              </p>
            </div>

            {loginType === 'student' && (
              <button 
                onClick={() => setShowStats(!showStats)}
                className={`w-full ${theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-black'} font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg`}
              >
                <BarChart3 size={16} />
                {showStats ? 'HIDE STATS' : 'ANALYZE MY STATS'}
              </button>
            )}

            <button 
              onClick={() => setShowNetworking(true)}
              className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl text-sm hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 uppercase tracking-widest"
            >
              <Users size={18} />
              NETWORKING
            </button>

            <button 
              onClick={() => setShowClubsAndEvents(true)}
              className="w-full bg-zinc-800 text-white font-black py-4 rounded-xl text-sm hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 shadow-lg uppercase tracking-widest border border-zinc-700"
            >
              <Trophy size={18} className="text-yellow-500" />
              CLUBS & EVENTS
            </button>

            <button 
              onClick={() => setShowSyllabus(true)}
              className="w-full bg-zinc-800 text-white font-black py-4 rounded-xl text-sm hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 shadow-lg uppercase tracking-widest border border-zinc-700"
            >
              <BookOpen size={18} className="text-blue-400" />
              SYLLABUS
            </button>

            {loginType === 'admin' && (
              <button 
                onClick={() => setShowAdminPanel(true)}
                className="w-full bg-blue-600 text-white font-black py-4 rounded-xl text-sm hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 uppercase tracking-widest"
              >
                <Settings size={18} />
                ADMIN CONTROLS
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 p-8 overflow-y-auto space-y-10">
          {loginType === 'student' && (
            <AnimatePresence>
              {showStats && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className={`p-4 border ${theme === 'dark' ? 'border-zinc-800/50 bg-zinc-900/30' : 'border-zinc-200 bg-zinc-100'} rounded-xl backdrop-blur-sm`}>
                    <p className="text-[10px] uppercase text-zinc-500 mb-1">Attendance</p>
                    <div className="flex items-end justify-between mb-2">
                      <span className="text-2xl font-mono font-bold">85%</span>
                    </div>
                    <div className={`w-full ${theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'} h-1.5 rounded-full overflow-hidden`}>
                      <div className={`${theme === 'dark' ? 'bg-white' : 'bg-zinc-900'} h-full w-[85%] rounded-full`} />
                    </div>
                  </div>
                  <div className={`p-4 border ${theme === 'dark' ? 'border-zinc-800/50 bg-zinc-900/30' : 'border-zinc-200 bg-zinc-100'} rounded-xl backdrop-blur-sm flex justify-between items-center`}>
                    <div>
                      <p className="text-[10px] uppercase text-zinc-500">Current CGPA</p>
                      <p className="text-2xl font-mono font-bold">8.9</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          <section className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-black flex items-center gap-2">
              <Calendar size={12} />
              {loginType === 'student' ? 'Academic Schedule' : 'Scheduled Classes'}
            </h3>
            <button 
              onClick={() => setShowTimetable(true)}
              className={`w-full py-4 rounded-xl border font-black text-xs transition-all flex items-center justify-center gap-2 group ${
                theme === 'dark' ? 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:bg-zinc-800' : 'bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              <Clock size={16} className="group-hover:rotate-12 transition-transform" />
              VIEW TIMETABLE
            </button>
          </section>

          {loginType === 'student' && (
            <>
              <button 
                onClick={() => setShowRoutes(true)}
                className={`w-full ${theme === 'dark' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20' : 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'} border font-black py-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 group`}
              >
                <Navigation size={16} />
                BUS ROUTES
              </button>

              <div>
                <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4">Resources</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      if (!branch || !year) return;
                      const syllabusUrl = `https://anurag.edu.in/syllabus/${branch.toLowerCase()}-${(year.split(' ')[0] || '').toLowerCase()}`;
                      window.open(syllabusUrl, '_blank');
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border ${theme === 'dark' ? 'border-zinc-800/50 hover:border-zinc-500 hover:bg-zinc-900/50' : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100'} transition-all flex items-center gap-3 group`}
                  >
                    <FileText size={16} className="text-zinc-500 group-hover:text-white" />
                    <span className="text-xs font-medium">Syllabus Portal ({branch})</span>
                  </button>
                  <button 
                    onClick={() => setShowFaculty(true)}
                    className={`w-full text-left p-3.5 rounded-xl border ${theme === 'dark' ? 'border-zinc-800/50 hover:border-zinc-500 hover:bg-zinc-900/50' : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100'} transition-all flex items-center gap-3 group`}
                  >
                    <User size={16} className="text-zinc-500 group-hover:text-white" />
                    <span className="text-xs font-medium">Faculty Contacts</span>
                  </button>
                  <button 
                    onClick={() => setShowFAQs(true)}
                    className={`w-full text-left p-3.5 rounded-xl border ${theme === 'dark' ? 'border-zinc-800/50 hover:border-zinc-500 hover:bg-zinc-900/50' : 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-100'} transition-all flex items-center gap-3 group`}
                  >
                    <ShieldAlert size={16} className="text-zinc-500 group-hover:text-white" />
                    <span className="text-xs font-medium">Student FAQs & Rules</span>
                  </button>
                  {(year === '3rd Year' || year === '4th Year') && (
                    <button className="w-full text-left p-3.5 rounded-xl border border-emerald-900/30 bg-emerald-500/5 hover:border-emerald-500 transition-all flex items-center gap-3 group">
                      <Briefcase size={16} className="text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-400">Internship Guide</span>
                    </button>
                  )}
                </div>
              </div>

              <button 
                onClick={() => setShowSOS(true)}
                className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-black py-4 rounded-xl text-xs hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 group"
              >
                <AlertCircle size={16} className="group-hover:animate-pulse" />
                SOS EMERGENCY
              </button>
            </>
          )}
        </div>

        {/* SOS Modal */}
        <AnimatePresence>
          {showSOS && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-sm bg-zinc-900 border border-red-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)]"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <AlertCircle className="text-red-500 w-10 h-10" />
                  </div>
                  <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Emergency SOS</h2>
                  <p className="text-zinc-400 text-sm mb-8">Contacting your registered guardian and university security...</p>
                  
                  <div className="w-full space-y-4 mb-8">
                    <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                      <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Guardian Contact</p>
                      <p className="text-white font-mono">+91 98765 43210</p>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                      <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Campus Security</p>
                      <p className="text-white font-mono">040-1234-5678</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => setShowSOS(false)}
                    className="w-full bg-zinc-800 text-white font-bold py-4 rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-widest text-xs"
                  >
                    Cancel SOS
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Syllabus Modal */}
        <AnimatePresence>
          {showSyllabus && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`w-full max-w-2xl h-[70vh] ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-3xl p-8 shadow-2xl flex flex-col`}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className={`text-2xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                      Academic Syllabus
                    </h2>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                      {branch} • {year} • Subjects
                    </p>
                  </div>
                  <button onClick={() => setShowSyllabus(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
                  {subjects.length > 0 ? (
                    <div className="space-y-4">
                      {subjects.map((sub, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} flex items-center justify-between group hover:border-blue-500/30 transition-all`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold">
                              {i + 1}
                            </div>
                            <div>
                              <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{sub.subject_name}</h4>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Semester {sub.semester}</p>
                            </div>
                          </div>
                          <button className="p-2 bg-zinc-900 rounded-lg text-zinc-500 hover:text-white transition-colors">
                            <Download size={16} />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12">
                      <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6">
                        <BookOpen size={40} className="text-zinc-600" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">No Subjects Found</h3>
                      <p className="text-xs text-zinc-500 max-w-xs">
                        We haven't synced the syllabus for {branch} {year} yet. Use the "Sync with Portal" button in Admin Panel to fetch latest data.
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setShowSyllabus(false)}
                  className="w-full mt-8 bg-zinc-800 text-white font-bold py-4 rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-widest text-xs"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showClubsAndEvents && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`w-full max-w-4xl h-[80vh] ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-3xl p-8 shadow-2xl flex flex-col`}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className={`text-2xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                      Clubs & Campus Events
                    </h2>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                      Synced with Anurag University Portal
                    </p>
                  </div>
                  <button onClick={() => setShowClubsAndEvents(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-12 pr-4 scrollbar-hide">
                  {/* Events Section */}
                  <section>
                    <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <Calendar size={14} />
                      Upcoming Events
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {events.map((event, i) => (
                        <motion.div 
                          key={i}
                          whileHover={{ y: -5 }}
                          className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} group transition-all`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                              {event.date}
                            </div>
                            <MapPin size={14} className="text-zinc-600" />
                          </div>
                          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{event.title}</h4>
                          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{event.description}</p>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono uppercase">
                            <Navigation size={10} />
                            {event.location}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* Clubs Section */}
                  <section>
                    <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <Users size={14} />
                      Student Clubs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {clubs.map((club, i) => (
                        <motion.div 
                          key={i}
                          onClick={() => {
                            setSelectedClub(club.name);
                            setShowClubsAndEvents(false);
                          }}
                          className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800 hover:border-blue-500/50' : 'bg-zinc-50 border-zinc-200 hover:border-blue-500/50'} cursor-pointer transition-all group`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <Bot size={24} className="text-blue-500 group-hover:text-white" />
                          </div>
                          <h4 className="font-bold text-white mb-1">{club.name}</h4>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">{club.category}</p>
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{club.brief}</p>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="flex-1 overflow-y-auto space-y-12 pr-4 scrollbar-hide">
                  {/* Events Section */}
                  <section>
                    <h3 className="text-xs font-black text-emerald-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <Calendar size={14} />
                      Upcoming Events
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {events.map((event, i) => (
                        <motion.div 
                          key={i}
                          whileHover={{ y: -5 }}
                          className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} group transition-all`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                              {event.date}
                            </div>
                            <MapPin size={14} className="text-zinc-600" />
                          </div>
                          <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{event.title}</h4>
                          <p className="text-xs text-zinc-500 mb-4 leading-relaxed">{event.description}</p>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono uppercase">
                            <Navigation size={10} />
                            {event.location}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </section>

                  {/* Clubs Section */}
                  <section>
                    <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                      <Users size={14} />
                      Student Clubs
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {clubs.map((club, i) => (
                        <motion.div 
                          key={i}
                          onClick={() => {
                            setSelectedClub(club.name);
                            setShowClubsAndEvents(false);
                          }}
                          className={`p-6 rounded-2xl border ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800 hover:border-blue-500/50' : 'bg-zinc-50 border-zinc-200 hover:border-blue-500/50'} cursor-pointer transition-all group`}
                        >
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            <Bot size={24} className="text-blue-500 group-hover:text-white" />
                          </div>
                          <h4 className="font-bold text-white mb-1">{club.name}</h4>
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">{club.category}</p>
                          <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{club.brief}</p>
                        </motion.div>
                      ))}
                    </div>
                  </section>
                </div>

                <div className="mt-8 pt-8 border-t border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-mono uppercase">
                    <History size={12} />
                    Last Synced: {new Date().toLocaleDateString()}
                  </div>
                  <button 
                    onClick={() => setShowClubsAndEvents(false)}
                    className="bg-zinc-800 text-white font-black px-8 py-3 rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-widest text-xs"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Timetable Modal */}
        <AnimatePresence>
          {showTimetable && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`w-full max-w-lg ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border rounded-3xl p-8 shadow-2xl`}
              >
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className={`text-xl font-black uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                      {branch} Timetable
                    </h2>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mt-1">
                      Academic Year: {year}
                    </p>
                  </div>
                  <button onClick={() => setShowTimetable(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  {dynamicTimetable?.map((slot, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-4 rounded-2xl border ${
                        theme === 'dark' ? 'bg-zinc-950 border-zinc-800 text-zinc-300' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                      } font-mono text-xs flex items-center gap-4 group hover:border-emerald-500/30 transition-all`}
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-500 group-hover:animate-ping" />
                      {slot}
                    </motion.div>
                  ))}
                  {(!dynamicTimetable || dynamicTimetable.length === 0) && (
                    <p className="text-center py-8 text-zinc-500 text-xs italic">No timetable available for this branch yet.</p>
                  )}
                </div>

                <button 
                  onClick={() => setShowTimetable(false)}
                  className="w-full mt-8 bg-emerald-500 text-black font-black py-4 rounded-xl hover:bg-emerald-400 transition-all uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bus Routes Modal */}
        <AnimatePresence>
          {showRoutes && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-2xl bg-zinc-900 border border-blue-500/30 rounded-3xl p-8 shadow-[0_0_50px_rgba(59,130,246,0.1)] max-h-[80vh] flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">University Bus Routes</h2>
                    <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">65 Buses • 22 Routes • 3 Buses per Route</p>
                  </div>
                  <button onClick={() => setShowRoutes(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500">
                    <ChevronRight className="rotate-90" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
                  {BUS_ROUTES.map((route) => (
                    <div key={route.route} className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 hover:border-blue-500/30 transition-all group">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500 font-black text-xs">
                            R{route.route}
                          </div>
                          <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{route.destination}</h3>
                        </div>
                        <div className="flex gap-1">
                          {route.buses.map(bus => (
                            <span key={bus} className="px-2 py-1 bg-zinc-900 rounded text-[9px] font-mono text-zinc-500 border border-zinc-800">
                              #{bus}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowRoutes(false)}
                  className="w-full mt-6 bg-zinc-800 text-white font-bold py-4 rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-widest text-xs"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 border-t border-zinc-800 text-[10px] text-zinc-600 font-mono flex items-center justify-between">
          <span>STATUS: OPTIMAL</span>
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-black relative">
        <AnimatePresence>
          {showNetworking ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="absolute inset-0 z-50 bg-black flex flex-col"
            >
              {/* Networking Header */}
              <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-8 bg-zinc-950/50 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setShowNetworking(false)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white"
                  >
                    <ChevronRight size={20} className="rotate-180" />
                  </button>
                  <div>
                    <h2 className="text-sm font-black tracking-widest uppercase text-emerald-400">Networking Portal</h2>
                    <p className="text-[10px] text-zinc-500 font-mono uppercase">Connect • Collaborate • Engage</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setShowSearch(!showSearch)}
                    className={`p-2 rounded-lg transition-all ${showSearch ? 'bg-emerald-500 text-black' : 'hover:bg-zinc-800 text-zinc-500'}`}
                  >
                    <Search size={20} />
                  </button>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold">128 Online</span>
                </div>
              </header>

              <div className="flex-1 flex overflow-hidden">
                {/* Channels List / Search Results */}
                <aside className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-950/30">
                  {showSearch ? (
                    <div className="p-4 flex flex-col h-full">
                      <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={14} />
                        <input 
                          type="text"
                          autoFocus
                          placeholder="Search friends/branch..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 transition-all"
                        />
                      </div>
                      
                      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
                        <h3 className="text-[9px] uppercase tracking-widest text-zinc-600 font-black mb-2 px-2">Search Results</h3>
                        {[
                          { name: 'Rahul Sharma', branch: 'CSE', year: '3rd', roll: '21AG1A0501' },
                          { name: 'Priya Reddy', branch: 'ECE', year: '2nd', roll: '22AG1A0412' },
                          { name: 'Karthik V', branch: 'MECH', year: '4th', roll: '20AG1A0345' },
                          { name: 'Sneha Kapoor', branch: 'CSE', year: '1st', roll: '23AG1A0589' },
                          { name: 'Anish Kumar', branch: 'CIVIL', year: '3rd', roll: '21AG1A0102' }
                        ].filter(u => 
                          u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.branch.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.roll.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map(user => (
                          <button 
                            key={user.roll}
                            onClick={() => {
                              setActiveChannel(`dm:${user.roll}`);
                              setShowSearch(false);
                              setSearchQuery('');
                            }}
                            className="w-full text-left p-3 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold text-zinc-400 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                                {user.name.split(' ').map(n => n?.[0] || '').join('')}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-zinc-200">{user.name}</p>
                                <p className="text-[9px] text-zinc-500 uppercase font-mono">{user.branch} • {user.year} Year</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 space-y-8">
                      <section>
                        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-4">Clubs & Orgs</h3>
                        <div className="space-y-1">
                          {['Tech Club', 'A-Cube', 'Sahaya', 'Sports'].map(club => (
                            <button 
                              key={club}
                              onClick={() => setActiveChannel(`club:${club}`)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                activeChannel === `club:${club}` ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                              }`}
                            >
                              <span className="opacity-50">#</span>
                              {club}
                            </button>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-4">Academic Discussion</h3>
                        <div className="space-y-1">
                          {['CSE', 'ECE', 'MECH'].map(dept => (
                            <button 
                              key={dept}
                              onClick={() => setActiveChannel(`academic:${dept}`)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                                activeChannel === `academic:${dept}` ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                              }`}
                            >
                              <span className="opacity-50">#</span>
                              {dept}-Forum
                            </button>
                          ))}
                        </div>
                      </section>

                      <section>
                        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-black mb-4">Mentorship</h3>
                        <button 
                          onClick={() => setActiveChannel('mentorship')}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                            activeChannel === 'mentorship' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                          }`}
                        >
                          <GraduationCap size={14} />
                          Senior Connect
                        </button>
                      </section>
                    </div>
                  )}
                </aside>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col bg-black">
                  <div className="flex-1 overflow-y-auto p-8 space-y-4">
                    {(networkMessages[activeChannel] || []).map((msg, idx) => (
                      <div key={idx} className={`flex flex-col ${msg.type === 'system' ? 'items-center' : (msg.sender === rollNo ? 'items-end' : 'items-start')}`}>
                        {msg.type === 'system' ? (
                          <span className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest bg-zinc-900/50 px-3 py-1 rounded-full">
                            {msg.content}
                          </span>
                        ) : (
                          <div className={`max-w-[70%] ${msg.sender === rollNo ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                              <span className="text-[10px] font-black text-zinc-500 uppercase">{msg.sender}</span>
                              <span className="text-[8px] text-zinc-700 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className={`p-4 rounded-2xl border ${
                              msg.sender === rollNo ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100' : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                            }`}>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Safe Reach Out / Icebreakers */}
                  <div className="px-8 py-4 border-t border-zinc-800 bg-zinc-950/30">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-600 font-black mb-3 flex items-center gap-2">
                      <ShieldAlert size={12} />
                      Safe Reach Out Templates
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      {[
                        "Hi! I'm interested in joining the club. How can I get started?",
                        "Hello senior, I'd love to get some advice on internship prep.",
                        "Hey! Anyone up for a quick discussion on the recent assignment?",
                        "Hi buddy! Looking for some guidance on choosing electives."
                      ].map((template, i) => (
                        <button 
                          key={i}
                          onClick={() => setNetworkInput(template)}
                          className="shrink-0 bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-xl text-[10px] font-bold text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="p-8 border-t border-zinc-800 bg-zinc-950/50">
                    <form 
                      onSubmit={(e) => { e.preventDefault(); sendNetworkMessage(networkInput); }}
                      className="max-w-4xl mx-auto relative"
                    >
                      <input 
                        type="text"
                        value={networkInput}
                        onChange={(e) => setNetworkInput(e.target.value)}
                        placeholder={activeChannel.startsWith('dm:') ? `Message ${activeChannel.split(':')[1]}...` : `Message #${activeChannel.split(':')[1] || activeChannel}...`}
                        className="w-full bg-black border border-zinc-800 rounded-2xl pl-5 pr-14 py-4 text-sm focus:outline-none focus:border-emerald-500 transition-all placeholder:text-zinc-700"
                      />
                      <button 
                        type="submit"
                        disabled={!networkInput.trim()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl text-emerald-500 hover:bg-emerald-500/10 transition-all disabled:text-zinc-800"
                      >
                        <Send size={20} />
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Header */}
        <header className={`h-16 border-b ${theme === 'dark' ? 'border-zinc-800 bg-black/50' : theme === 'light' ? 'border-zinc-200 bg-white/50' : 'border-[#dcd0b8] bg-[#efe6cf]/50'} backdrop-blur-md sticky top-0 z-10`}>
          <div className="flex items-center justify-between px-8 h-full">
            <div className="flex items-center gap-4">
              <BuddyLogo size="sm" />
              <div>
                <h2 className="text-sm font-bold tracking-widest uppercase">
                  {chatMode === 'buddy' ? 'Buddy Mode' : 'Anti-Procrastination Coach'}
                </h2>
                <p className="text-[10px] text-zinc-500 font-mono">
                  {chatMode === 'buddy' ? 'BUDDY INTELLIGENCE v4.0' : 'COACH MODE v1.0'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => speak(messages[messages.length - 1]?.content || "")}
                className={`p-2 rounded-lg transition-all ${isSpeaking ? 'text-emerald-500' : 'text-zinc-500 hover:text-white'}`}
                title="Listen to last message"
              >
                <Zap size={20} />
              </button>
              <button 
                onClick={() => setShowCalendar(true)}
                className={`p-2 rounded-lg transition-all ${theme === 'dark' ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-600'}`}
              >
                <Calendar size={20} />
              </button>
              <button 
                onClick={toggleMode}
                className={`flex items-center gap-2 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800 hover:border-white' : 'bg-zinc-100 border-zinc-200 hover:border-zinc-400'} border px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all group`}
              >
                <Zap size={14} className={chatMode === 'coach' ? 'text-emerald-500' : 'text-zinc-500'} />
                SWITCH TO {chatMode === 'buddy' ? 'COACH' : 'BUDDY'}
              </button>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-12 space-y-10 scrollbar-hide">
          <div className="max-w-4xl mx-auto space-y-10">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-zinc-800' 
                    : (chatMode === 'coach' ? 'bg-emerald-500 text-black' : '')
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : (chatMode === 'buddy' ? <BuddyLogo size="sm" /> : <Zap size={18} />)}
                </div>
                <div className={`max-w-[80%] p-5 rounded-2xl border backdrop-blur-sm ${
                  msg.role === 'user' 
                    ? 'bg-zinc-900/50 border-zinc-800 text-zinc-200' 
                    : 'bg-zinc-950/50 border-zinc-800 text-white'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${chatMode === 'coach' ? 'bg-emerald-500 text-black' : ''}`}>
                  {chatMode === 'buddy' ? <BuddyLogo size="sm" /> : <Zap size={18} />}
                </div>
                <div className="max-w-[80%] p-5 rounded-2xl border bg-zinc-950/50 border-zinc-800 flex items-center gap-2">
                  <div className="flex gap-1">
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Restore Button */}
        <div className="absolute bottom-32 right-8 z-20">
          <button 
            onClick={restoreHistory}
            className="flex items-center gap-2 bg-zinc-900/80 backdrop-blur border border-zinc-800 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-zinc-500 transition-all shadow-2xl"
          >
            <History size={12} />
            Restore Previous Query
          </button>
        </div>

        {/* Input Area */}
        <div className="p-12 border-t border-zinc-800 bg-black/50 backdrop-blur-md">
          <form 
            onSubmit={handleSendMessage}
            className="max-w-5xl mx-auto relative"
          >
            <button 
              type="button"
              onClick={startListening}
              className={`absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${isListening ? 'text-red-500 animate-pulse' : 'text-zinc-500 hover:text-white'}`}
            >
              <Mic2 size={20} />
            </button>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={chatMode === 'buddy' ? "Hi buddy, how can I help you? 👋" : "Tell me what you're procrastinating on..."}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl pl-12 pr-14 py-4 text-sm focus:outline-none focus:border-white transition-all placeholder:text-zinc-600 shadow-inner"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all ${
                isLoading || !input.trim() 
                  ? 'text-zinc-700' 
                  : chatMode === 'buddy' ? 'text-white hover:bg-zinc-800' : 'text-emerald-500 hover:bg-emerald-500/10'
              }`}
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-center text-[10px] text-zinc-600 mt-4 font-mono uppercase tracking-widest">
            Anurag University • Buddy Intelligence System
          </p>
        </div>
      </main>

      {/* Right Sidebar - Info & Nav */}
      <aside className={`hidden lg:flex w-96 border-l ${themeClasses[theme]} flex-col ${theme === 'dark' ? 'bg-zinc-950/50' : theme === 'light' ? 'bg-white' : 'bg-[#efe6cf]'} backdrop-blur-xl`}>
        <NavigatorContent />
      </aside>

      {/* Modals */}
      <AnimatePresence>
        {showNetworking && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-6xl h-[85vh] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden flex shadow-2xl"
            >
              {/* Networking Sidebar */}
              <div className="w-72 border-r border-zinc-800 bg-zinc-900/50 flex flex-col">
                <div className="p-6 border-b border-zinc-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500">Networking</h3>
                    <button 
                      onClick={() => setShowSearch(!showSearch)}
                      className={`p-2 rounded-lg transition-all ${showSearch ? 'bg-emerald-500 text-black' : 'hover:bg-zinc-800 text-zinc-500'}`}
                    >
                      <Search size={16} />
                    </button>
                  </div>
                  
                  {showSearch ? (
                    <div className="relative">
                      <input 
                        type="text"
                        placeholder="Search friends..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500 transition-all"
                      />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button className="flex-1 bg-zinc-800 text-white text-[10px] font-bold py-2 rounded-lg border border-zinc-700">CHANNELS</button>
                      <button className="flex-1 text-zinc-500 text-[10px] font-bold py-2 rounded-lg hover:bg-zinc-800 transition-all">DIRECTS</button>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                  {showSearch ? (
                    <div className="space-y-1">
                      {['Rahul (CSE)', 'Sneha (ECE)', 'Vikram (MECH)', 'Ananya (CSE)'].filter(f => f.toLowerCase().includes(searchQuery.toLowerCase())).map(friend => {
                        const channelId = `dm:${friend}`;
                        const lastMsg = networkMessages[channelId]?.slice(-1)[0];
                        return (
                          <button 
                            key={friend}
                            onClick={() => {
                              setActiveChannel(channelId);
                              setShowSearch(false);
                            }}
                            className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group ${activeChannel === channelId ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'}`}
                          >
                            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                              {friend?.[0] || '?'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-0.5">
                                <span className="text-sm font-medium text-zinc-100 truncate">{friend}</span>
                                {lastMsg && (
                                  <span className="text-[10px] text-zinc-500">
                                    {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-500 truncate">
                                {lastMsg ? lastMsg.content || lastMsg.text : 'Start a conversation'}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <>
                      <div>
                        <p className="text-[10px] uppercase font-black text-emerald-500/50 mb-2 px-4 mt-2">Channels</p>
                        <div className="space-y-0.5">
                          {[
                            { name: 'Tech Club', type: 'club' },
                            { name: 'A-Cube', type: 'club' },
                            { name: 'Sahaya', type: 'club' },
                            { name: 'CSE Forum', type: 'academic' },
                            { name: 'ECE Hub', type: 'academic' },
                            { name: 'Senior Connect', type: 'mentor' }
                          ].map(item => {
                            const channelId = `${item.type}:${item.name}`;
                            const lastMsg = networkMessages[channelId]?.slice(-1)[0];
                            const isActive = activeChannel === channelId;
                            return (
                              <button 
                                key={channelId}
                                onClick={() => setActiveChannel(channelId)}
                                className={`w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group ${isActive ? 'bg-[#2a3942]' : 'hover:bg-[#202c33]'}`}
                              >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${
                                  item.type === 'club' ? 'bg-emerald-600' : 
                                  item.type === 'academic' ? 'bg-blue-600' : 'bg-purple-600'
                                }`}>
                                  <Hash size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-sm font-medium text-zinc-100 truncate">{item.name}</span>
                                    {lastMsg && (
                                      <span className="text-[10px] text-zinc-500">
                                        {new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-zinc-500 truncate">
                                    {lastMsg ? `${lastMsg.sender}: ${lastMsg.content || lastMsg.text}` : `Welcome to #${item.name}`}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">124 Online</span>
                  </div>
                  <button 
                    onClick={() => setShowNetworking(false)}
                    className="text-[10px] font-bold text-zinc-600 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    Close
                  </button>
                </div>
              </div>

               {/* Networking Chat Area */}
              <div className="flex-1 flex flex-col bg-[#0b141a]">
                <div className="h-16 border-b border-zinc-800 flex items-center justify-between px-6 bg-[#202c33]">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setActiveChannel('club:Tech Club')}
                      className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-all mr-1 md:hidden"
                      title="Back to Channels"
                    >
                      <ChevronRight className="rotate-180" size={18} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-zinc-400 overflow-hidden border border-zinc-600">
                      {activeChannel.startsWith('dm:') ? (
                        <div className="w-full h-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                          {activeChannel.split(':')[1][0]}
                        </div>
                      ) : (
                        <Hash size={20} />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-100">{activeChannel.split(':')[1]}</h4>
                      <p className="text-[10px] text-emerald-500 font-medium">
                        {activeChannel.startsWith('dm:') ? 'online' : '124 members'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-zinc-400">
                    <Search size={18} className="cursor-pointer hover:text-white transition-colors" />
                    <button className="p-1 hover:bg-zinc-700 rounded-full transition-all">
                      <LogOut className="rotate-90" size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat opacity-90">
                  <div className="max-w-4xl mx-auto space-y-2">
                    <div className="flex justify-center my-4">
                      <span className="px-3 py-1 bg-[#182229] text-[10px] text-zinc-500 rounded-lg uppercase tracking-widest font-bold border border-zinc-800/50 shadow-sm">
                        Today
                      </span>
                    </div>
                    
                    {networkMessages[activeChannel]?.map((msg, idx) => {
                      const isSelf = msg.sender === rollNo;
                      return (
                        <div key={idx} className={`flex ${isSelf ? 'justify-end' : 'justify-start'} mb-1`}>
                          <div className={`max-w-[85%] md:max-w-[65%] px-3 py-2 rounded-xl shadow-sm relative group ${
                            isSelf 
                              ? 'bg-[#005c4b] text-zinc-100 rounded-tr-none' 
                              : 'bg-[#202c33] text-zinc-100 rounded-tl-none border border-zinc-800/30'
                          }`}>
                            {!isSelf && !activeChannel.startsWith('dm:') && (
                              <p className="text-[10px] font-bold text-emerald-500 mb-1">{msg.sender}</p>
                            )}
                            <p className="text-xs leading-relaxed pr-12">{msg.text || msg.content}</p>
                            <div className="absolute bottom-1 right-2 flex items-center gap-1">
                              <span className="text-[9px] text-zinc-400 font-medium">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                              </span>
                              {isSelf && (
                                <div className="flex items-center">
                                  <svg viewBox="0 0 16 15" width="14" height="14" className="text-blue-400 fill-current">
                                    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L5.066 9.879a.32.32 0 0 1-.484.033L1.582 7.062a.37.37 0 0 0-.512.074l-.4.5a.322.322 0 0 0 .034.433l4.173 3.766c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512z"></path>
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={networkChatEndRef} />
                  </div>
                </div>

                <div className="p-3 bg-[#202c33] border-t border-zinc-800">
                  <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <div className="flex items-center gap-3 text-zinc-400">
                      <button className="p-2 hover:bg-zinc-700 rounded-full transition-all">
                        <Zap size={20} />
                      </button>
                      <button className="p-2 hover:bg-zinc-700 rounded-full transition-all">
                        <Plus size={20} />
                      </button>
                      <button className="p-2 hover:bg-zinc-700 rounded-full transition-all">
                        <Coffee size={20} />
                      </button>
                    </div>
                    <form 
                      onSubmit={(e) => { e.preventDefault(); sendNetworkMessage(networkInput); }}
                      className="flex-1 relative"
                    >
                      <input 
                        type="text"
                        value={networkInput}
                        onChange={(e) => setNetworkInput(e.target.value)}
                        placeholder="Type a message"
                        className="w-full bg-[#2a3942] border-none rounded-xl px-5 py-2.5 text-sm text-zinc-100 focus:outline-none transition-all placeholder:text-zinc-500"
                      />
                    </form>
                    <button 
                      onClick={() => sendNetworkMessage(networkInput)}
                      disabled={!networkInput.trim()}
                      className={`p-3 rounded-full transition-all ${
                        networkInput.trim() 
                          ? 'bg-emerald-500 text-black hover:bg-emerald-400' 
                          : 'text-zinc-500'
                      }`}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Club Details Modal */}
      <AnimatePresence>
        {selectedClub && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-zinc-900 border border-emerald-500/30 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                  <Users className="text-emerald-500 w-10 h-10" />
                </div>
                <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{selectedClub}</h2>
                <p className="text-zinc-400 text-sm mb-8">{CLUB_DETAILS[selectedClub]?.brief}</p>
                
                <div className="w-full space-y-4 mb-8">
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Active Members</p>
                    <p className="text-white font-mono">{CLUB_DETAILS[selectedClub]?.members}</p>
                  </div>
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <p className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Faculty Head</p>
                    <p className="text-white font-mono">{CLUB_DETAILS[selectedClub]?.head}</p>
                  </div>
                </div>

                <button 
                  onClick={() => setSelectedClub(null)}
                  className="w-full bg-emerald-500 text-black font-bold py-4 rounded-xl hover:bg-emerald-400 transition-all uppercase tracking-widest text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calendar Modal */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">University Calendar</h2>
                <button onClick={() => setShowCalendar(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-8">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={`${d}-${i}`} className="text-center text-[10px] font-black text-zinc-600 uppercase py-2">{d}</div>
                ))}
                {Array.from({ length: 31 }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `2026-03-${day.toString().padStart(2, '0')}`;
                  const isHoliday = holidays.some(h => h.date === dateStr);
                  const isEvent = events.some(e => e.date === dateStr);
                  const holidayName = holidays.find(h => h.date === dateStr)?.name;
                  const eventTitle = events.find(e => e.date === dateStr)?.title;

                  return (
                    <button 
                      key={day}
                      onClick={() => (isHoliday || isEvent) && setSelectedDate(dateStr)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-mono relative transition-all ${
                        selectedDate === dateStr ? 'bg-white text-black ring-4 ring-white/20' : 
                        isHoliday ? 'bg-red-500/20 text-red-500 border border-red-500/30' :
                        isEvent ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                        'hover:bg-zinc-800 text-zinc-400'
                      }`}
                      title={holidayName || eventTitle}
                    >
                      {day}
                      {(isHoliday || isEvent) && (
                        <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isHoliday ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-2xl border ${
                    holidays.some(h => h.date === selectedDate) ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
                  }`}
                >
                  <p className="text-[10px] uppercase font-black mb-1 tracking-widest">
                    {holidays.some(h => h.date === selectedDate) ? 'Holiday' : 'Campus Event'} on {selectedDate}
                  </p>
                  <p className="text-white font-bold">
                    {holidays.find(h => h.date === selectedDate)?.name || 
                     events.find(e => e.date === selectedDate)?.title}
                  </p>
                </motion.div>
              )}

              <button 
                onClick={() => setShowCalendar(false)}
                className="w-full mt-8 bg-zinc-800 text-white font-bold py-4 rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-widest text-xs"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAQs Modal */}
      <AnimatePresence>
        {showFAQs && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-y-auto max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">Student FAQs & Rules</h2>
                <button onClick={() => setShowFAQs(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500">
                  <ChevronRight className="rotate-90" />
                </button>
              </div>
              <div className="space-y-6">
                {STUDENT_FAQS.map((faq, i) => (
                  <div key={i} className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <p className="text-sm font-bold text-white mb-2">Q: {faq.q}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">A: {faq.a}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowFAQs(false)}
                className="w-full mt-8 bg-zinc-800 text-white font-bold py-4 rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-widest text-xs"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Faculty Modal */}
      <AnimatePresence>
        {showFaculty && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-white uppercase tracking-tight">{branch} Faculty Contacts</h2>
                <button onClick={() => setShowFaculty(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500">
                  <ChevronRight className="rotate-90" />
                </button>
              </div>
              <div className="space-y-4">
                {FACULTY_EMAILS[branch]?.map((fac, i) => (
                  <div key={i} className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{fac.name}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{fac.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => window.location.href = `mailto:${fac.email}`}
                        className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 transition-all"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setShowFaculty(false)}
                className="w-full mt-8 bg-zinc-800 text-white font-bold py-4 rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-widest text-xs"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Admin Panel Modal */}
      <AnimatePresence>
        {showAdminPanel && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Settings className="text-blue-500" size={24} />
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Admin Control Panel</h2>
                </div>
                <button onClick={() => setShowAdminPanel(false)} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500">
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Notes & PDF Management */}
                <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <FileText size={14} />
                    Notes & PDFs
                  </h3>
                  <div className="space-y-3">
                    {['CSE_Notes_Sem4.pdf', 'ECE_Lab_Manual.pdf', 'Maths_Formula_Sheet.pdf'].map((file, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-zinc-900 rounded-xl border border-zinc-800/50">
                        <span className="text-[10px] text-zinc-300 font-mono truncate mr-2">{file}</span>
                        <div className="flex gap-2">
                          <button className="p-1.5 hover:bg-blue-500/20 text-blue-400 rounded transition-all" title="Edit">
                            <Edit3 size={12} />
                          </button>
                          <button className="p-1.5 hover:bg-red-500/20 text-red-400 rounded transition-all" title="Delete">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <button className="w-full py-2 border border-dashed border-zinc-800 rounded-xl text-[10px] text-zinc-500 hover:text-white hover:border-zinc-500 transition-all flex items-center justify-center gap-2">
                      <Plus size={12} />
                      Upload New Resource
                    </button>
                  </div>
                </div>

                {/* Timetable Management */}
                <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800">
                  <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar size={14} />
                    Timetable Controls
                  </h3>
                  <div className="space-y-3">
                    <select 
                      value={adminTimetableBranch}
                      onChange={(e) => setAdminTimetableBranch(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-[10px] text-white focus:outline-none focus:border-blue-500 transition-all"
                    >
                      {Object.keys(TIMETABLES).map(b => <option key={b}>{b}</option>)}
                    </select>
                    <textarea 
                      placeholder="Enter schedule (one per line)..."
                      value={adminTimetableInput}
                      onChange={(e) => setAdminTimetableInput(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-[10px] text-white focus:outline-none focus:border-blue-500 transition-all h-24 resize-none font-mono"
                    />
                    <button 
                      onClick={postTimetableUpdate}
                      className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all"
                    >
                      Update Schedule
                    </button>
                  </div>
                </div>

                {/* Live Updates Management */}
                <div className="p-6 bg-zinc-950 rounded-2xl border border-zinc-800 md:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <Bell size={14} />
                      Live Updates & Broadcasts
                    </h3>
                    <button 
                      onClick={async () => {
                        setIsSyncing(true);
                        try {
                          const res = await fetch('/api/sync-portal', { method: 'POST' });
                          if (res.ok) {
                            const data = await res.json();
                            alert(data.message);
                            // Refresh data
                            window.location.reload();
                          }
                        } catch (e) {
                          console.error(e);
                        } finally {
                          setIsSyncing(false);
                        }
                      }}
                      disabled={isSyncing}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        isSyncing ? 'bg-zinc-800 text-zinc-600' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20 hover:bg-blue-500 hover:text-white'
                      }`}
                    >
                      <Zap size={12} className={isSyncing ? 'animate-spin' : ''} />
                      {isSyncing ? 'Syncing...' : 'Sync with Portal'}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <textarea 
                      placeholder="Type a campus-wide announcement..."
                      value={adminAnnouncement}
                      onChange={(e) => setAdminAnnouncement(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 transition-all h-24 resize-none"
                    />
                    <div className="flex gap-3">
                      <button 
                        onClick={postAnnouncement}
                        className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all"
                      >
                        Post Announcement
                      </button>
                      <button className="flex-1 py-3 bg-yellow-600 text-black font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-yellow-500 transition-all">
                        Highlight Event
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowAdminPanel(false)}
                className="w-full mt-8 bg-zinc-800 text-white font-bold py-4 rounded-xl hover:bg-zinc-700 transition-all uppercase tracking-widest text-xs"
              >
                Close Admin Panel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
