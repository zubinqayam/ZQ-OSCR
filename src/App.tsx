/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bell, LayoutDashboard, Menu, MessageSquare, Search, Settings, User, X, ChevronDown, ChevronUp, Activity, ShieldAlert, Cpu, Bot, Send, Terminal, Paperclip, Mic, Camera, Link, Trash2, Copy, RefreshCw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const INITIAL_OPERATIONS = [
  { id: 1, name: "HarnessBoundary Policy Check", time: "2 minutes ago", status: "SUCCESS", classes: "bg-green-50 text-green-700 ring-green-600/20", details: { algaError: "Crit:0 | High:0 | Med:0 | Low:1", trustRating: "99.8%", integrityScore: "100%", recoveryConfidence: "High" } },
  { id: 2, name: "Telemetry Sync", time: "15 minutes ago", status: "PARTIAL_SUCCESS", classes: "bg-yellow-50 text-yellow-800 ring-yellow-600/20", details: { algaError: "Crit:0 | High:2 | Med:5 | Low:1", trustRating: "92.1%", integrityScore: "95%", recoveryConfidence: "High" } },
  { id: 3, name: "JanitorAgent Trace Rebuild", time: "1 hour ago", status: "RECOVERABLE_FAILURE", classes: "bg-orange-50 text-orange-800 ring-orange-600/20", details: { algaError: "Crit:1 | High:4 | Med:0 | Low:0", trustRating: "88.4%", integrityScore: "82%", recoveryConfidence: "Medium" } },
  { id: 4, name: "Nano Guard Valuation", time: "2 hours ago", status: "SUCCESS", classes: "bg-green-50 text-green-700 ring-green-600/20", details: { algaError: "Crit:0 | High:0 | Med:1 | Low:2", trustRating: "99.9%", integrityScore: "100%", recoveryConfidence: "High" } },
  { id: 5, name: "ALGA Anomaly Scan", time: "3 hours ago", status: "SUCCESS", classes: "bg-green-50 text-green-700 ring-green-600/20", details: { algaError: "Crit:0 | High:0 | Med:0 | Low:0", trustRating: "100%", integrityScore: "100%", recoveryConfidence: "High" } },
  { id: 6, name: "Deploy Sandbox Instance", time: "5 hours ago", status: "CRITICAL_FAILURE", classes: "bg-red-50 text-red-800 ring-red-600/20", details: { algaError: "Crit:5 | High:12 | Med:8 | Low:0", trustRating: "45.0%", integrityScore: "30%", recoveryConfidence: "Low" } },
];

const HEALTH_DATA = [
  { time: '00:00', integrity: 99.9 },
  { time: '04:00', integrity: 99.8 },
  { time: '08:00', integrity: 98.5 },
  { time: '12:00', integrity: 82.0 },
  { time: '16:00', integrity: 95.0 },
  { time: '20:00', integrity: 99.9 },
  { time: '24:00', integrity: 100 },
];

const SUGGESTED_COMMANDS = [
  "Run JanitorAgent trace rebuild",
  "Invoke Mr.Q Validation Layer",
  "Check ALGA anomaly scan results",
  "Deploy new Sandbox Instance",
  "Query HarnessBoundary policies",
  "Simulate system failure",
  "Show telemetry sync status",
];

type Attachment = {
  type: 'file' | 'link' | 'image';
  name: string;
  url?: string;
  data?: string;
  mimeType?: string;
};

type CommandDetail = {
  type: 'log' | 'plan' | 'data';
  content: string;
};

type CommandMessage = {
  id: number;
  role: 'user' | 'ai';
  text: string;
  details?: CommandDetail;
  attachments?: Attachment[];
};

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [operations, setOperations] = useState(() => {
    try {
      const saved = localStorage.getItem('ZQ_OPERATIONS');
      return saved ? JSON.parse(saved) : INITIAL_OPERATIONS;
    } catch {
      return INITIAL_OPERATIONS;
    }
  });
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [currentAttachments, setCurrentAttachments] = useState<Attachment[]>([]);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [commandText, setCommandText] = useState('');
  const [commandHistory, setCommandHistory] = useState<CommandMessage[]>(() => {
    try {
      const saved = localStorage.getItem('ZQ_COMMAND_HISTORY');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { 
        id: 1, 
        role: 'ai', 
        text: 'ZQ AI LOGIC™ System ready. Waiting for orchestrator command...',
        details: {
          type: 'log',
          content: '[INFO] Kernel: HarnessBoundary active\n[INFO] Policy Engine: Tiers 1-3 loaded\n[INFO] ALGA: Security baseline verified'
        }
      }
    ];
  });
  const [isAiHubOpen, setIsAiHubOpen] = useState(false);
  const [hubSearchValue, setHubSearchValue] = useState('');
  const [expandedCommandId, setExpandedCommandId] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAiHubOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [commandHistory, isAiHubOpen]);

  useEffect(() => {
    localStorage.setItem('ZQ_OPERATIONS', JSON.stringify(operations));
  }, [operations]);

  useEffect(() => {
    localStorage.setItem('ZQ_COMMAND_HISTORY', JSON.stringify(commandHistory));
  }, [commandHistory]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraModalOpen && videoRef.current) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(s => {
            stream = s;
            if (videoRef.current) {
              videoRef.current.srcObject = s;
              videoRef.current.play().catch(e => console.error("Video play error:", e));
            }
          })
          .catch(err => console.error("Camera error:", err));
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraModalOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newAttachments = await Promise.all(Array.from(files).map(async (f) => {
        const data = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(f);
        });
        return {
          type: (f.type.startsWith('image/') ? 'image' : 'file') as const,
          name: f.name,
          data,
          mimeType: f.type
        };
      }));
      setCurrentAttachments(prev => [...prev, ...newAttachments]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAddLink = () => {
    const url = prompt("Enter URL to attach:");
    if (url) {
      setCurrentAttachments(prev => [...prev, {
        type: 'link' as const,
        name: url,
        url: url
      }]);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setCommandText(prev => prev ? `${prev} ${transcript}` : transcript);
    };
    
    recognition.start();
  };

  const openCamera = async () => setIsCameraModalOpen(true);

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCurrentAttachments(prev => [...prev, {
          type: 'image' as const,
          name: `capture-${Date.now()}.jpg`,
          data: dataUrl
        }]);
        setIsCameraModalOpen(false);
      }
    }
  };

  const filteredHistory = commandHistory.filter(cmd => 
    cmd.text.toLowerCase().includes(hubSearchValue.toLowerCase()) || 
    (cmd.details?.content && cmd.details.content.toLowerCase().includes(hubSearchValue.toLowerCase()))
  );

  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const handleCommandSubmit = async (textToSubmit: string = commandText) => {
    if (!textToSubmit.trim() && currentAttachments.length === 0) return;

    setIsAiHubOpen(true);
    setShowSuggestions(false);
    const newCmdId = Date.now();
    const attachmentsToSave = [...currentAttachments];
    const userMessage: CommandMessage = { 
      id: newCmdId, 
      role: 'user', 
      text: textToSubmit,
      attachments: attachmentsToSave.length > 0 ? attachmentsToSave : undefined
    };

    setCommandHistory(prev => [...prev, userMessage]);
    setCommandText('');
    setCurrentAttachments([]);
    setIsLoadingAi(true);

    try {
      const response = await fetch('/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSubmit,
          history: commandHistory,
          attachments: attachmentsToSave
        })
      });
      const data = await response.json();

      setCommandHistory(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'ai', 
        text: data.reply || 'No response received. Continuing autonomous operation.'
      }]);
    } catch (e) {
       console.error("AI Router Error", e);
       setCommandHistory(prev => [...prev, { 
        id: Date.now() + 1, 
        role: 'ai', 
        text: 'Command received. Instructing JanitorAgent and scheduling task evaluation. (Fallback Offline Mode)',
        details: {
          type: 'plan',
          content: '1. Acquire lock on HarnessBoundary.\n2. Execute anomaly scan.\n3. Reconcile degraded components.\n4. Output SystemHealthArtifact.'
        }
      }]);
    } finally {
      setIsLoadingAi(false);
      simulateOperation();
    }
  };

  const simulateOperation = () => {
    const newId = operations.length > 0 ? Math.max(...operations.map(o => o.id)) + 1 : 1;
    const roll = Math.random();
    let status = "SUCCESS";
    let classes = "bg-green-50 text-green-700 ring-green-600/20";
    if (roll > 0.9) {
      status = "CRITICAL_FAILURE";
      classes = "bg-red-50 text-red-800 ring-red-600/20";
    } else if (roll > 0.7) {
      status = "RECOVERABLE_FAILURE";
      classes = "bg-orange-50 text-orange-800 ring-orange-600/20";
    } else if (roll > 0.4) {
      status = "PARTIAL_SUCCESS";
      classes = "bg-yellow-50 text-yellow-800 ring-yellow-600/20";
    }

    const newOp = {
      id: newId,
      name: `Dynamic Task Allocation [Node-${Math.floor(Math.random() * 1000)}]`,
      time: "Just now",
      status,
      classes,
      details: {
        algaError: status === "SUCCESS" ? "Crit:0 | High:0 | Med:0 | Low:0" : "Crit:1 | High:2 | Med:1 | Low:0",
        trustRating: status === "SUCCESS" ? "99.9%" : "85.4%",
        integrityScore: status === "SUCCESS" ? "100%" : "88%",
        recoveryConfidence: status === "SUCCESS" || status === "PARTIAL_SUCCESS" ? "High" : "Low"
      }
    };
    setOperations([newOp, ...operations]);
  };

  const filteredOperations = operations.filter((op) => {
    const matchesSearch = op.name.toLowerCase().includes(appliedSearch.toLowerCase()) || op.status.toLowerCase().includes(appliedSearch.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || op.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-screen w-full bg-gray-50 font-sans text-gray-900">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        multiple 
        onChange={handleFileUpload} 
      />
      {/* Sidebar */}
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-900/50 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside className={`${isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 flex shadow-xl' : 'hidden'} w-64 shrink-0 flex-col border-r border-gray-200 bg-white md:static md:flex md:shadow-none transition-transform`}>
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 px-6 text-lg font-semibold tracking-tight text-gray-900">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-600" />
            <span>ZQ AI LOGIC™</span>
          </div>
          <button 
            className="rounded-md p-1 hover:bg-gray-100 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto space-y-1 p-4">
          <a href="#" className="flex items-center gap-3 rounded-md bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            System Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            Operations Log
          </a>
          <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
            <ShieldAlert className="h-4 w-4 text-gray-500" />
            Policy Engine
          </a>
          <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
            <Activity className="h-4 w-4 text-gray-500" />
            Forensics & ALGA
          </a>
        </nav>
        <div className="shrink-0 border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white shadow-sm">
              ZQ
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Administrator</span>
              <span className="text-xs text-green-600 font-medium">System Ready</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm md:px-6 relative z-30">
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="hidden md:flex flex-1 max-w-2xl relative">
              <div 
                className="relative w-full cursor-text"
                onClick={() => setIsAiHubOpen(true)}
              >
                <Bot className="absolute top-2.5 left-3 h-4 w-4 text-blue-500" />
                <div className="flex h-9 w-full items-center rounded-md border border-gray-300 bg-gray-50 pl-9 pr-10 text-sm text-gray-500 transition-all hover:bg-white hover:border-blue-400">
                  Provide instruction to ZQ Planner or interrogate trace logs...
                </div>
                <button 
                  onClick={() => setIsAiHubOpen(true)}
                  className="absolute right-1.5 top-1.5 rounded p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            <span className="font-semibold md:hidden">ZQ System</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={simulateOperation}
              className="hidden sm:inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <Activity className="h-4 w-4" />
              Simulate Operation
            </button>
            <button className="relative rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full border-2 border-white bg-red-500"></span>
            </button>
            <button 
              onClick={() => setIsProfileModalOpen(true)}
              className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100"
            >
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Content Workspace */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-32">
            <div className="mx-auto max-w-6xl space-y-6 lg:space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">System Overview</h1>
                <p className="mt-1 text-sm text-gray-500">Sovereign-grade operational intelligence dashboard.</p>
              </div>
              <button
                onClick={simulateOperation}
                className="sm:hidden inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                <Activity className="h-4 w-4" />
                Simulate Operation
              </button>
            </div>
            
            {/* Metric Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Integrity Score", value: "99.9%", trend: "+0.1%", trendUp: true },
                { label: "Active Sessions", value: "1,204", trend: "+12", trendUp: true },
                { label: "Quarantined", value: "3", trend: "-1", trendUp: true },
                { label: "System Status", value: "Nominal", isStatus: true },
              ].map((stat, i) => (
                <div key={i} className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="text-sm font-medium text-gray-500">{stat.label}</div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                    {stat.trend && (
                      <span className={`text-xs font-semibold ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.trend}
                      </span>
                    )}
                    {stat.isStatus && (
                      <span className="inline-flex h-2 w-2 rounded-full bg-green-500 relative mt-2 text-transparent">
                         <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Middle Section: Chart & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health (24h)</h2>
                <div className="h-64 w-full min-h-[256px]">
                  <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                    <LineChart data={HEALTH_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                      <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '0.5rem', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                      />
                      <Line type="monotone" dataKey="integrity" stroke="#2563EB" strokeWidth={2} dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm flex flex-col">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Forensic Actions</h2>
                <div className="flex flex-1 flex-col justify-center space-y-3">
                  <button className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors text-left group">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Invoke JanitorAgent</span>
                      <span className="text-xs text-gray-500">Reconcile degraded sessions</span>
                    </div>
                    <Activity className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                  </button>
                  <button className="flex items-center justify-between rounded-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors text-left group">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Run Mr.Q Validation</span>
                      <span className="text-xs text-gray-500">Stress-test current policies</span>
                    </div>
                    <ShieldAlert className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="min-h-[400px] rounded-xl border border-gray-200 bg-white shadow-sm flex flex-col">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between border-b border-gray-200 p-6 gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-lg font-semibold text-gray-900 shrink-0">Operations Log</h2>
                  <div className="relative hidden sm:block">
                    <Search className="absolute top-2 left-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search operations..."
                      className="h-8 w-48 rounded-md border border-gray-300 bg-gray-50 pl-9 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setAppliedSearch(searchValue);
                      }}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {['ALL', 'SUCCESS', 'PARTIAL_SUCCESS', 'RECOVERABLE_FAILURE', 'CRITICAL_FAILURE'].map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        statusFilter === status 
                          ? 'bg-gray-900 text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 p-6">
                <div className="flex flex-col gap-3">
                  {filteredOperations.length > 0 ? (
                    filteredOperations.map((op) => (
                      <div key={op.id} className="flex flex-col rounded-lg border border-gray-200 bg-white overflow-hidden transition-all duration-200 shadow-sm hover:shadow-md">
                        <div 
                          className="flex cursor-pointer items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-50"
                          onClick={() => setExpandedId(expandedId === op.id ? null : op.id)}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">{op.name}</span>
                            <span className="text-xs text-gray-500 mt-0.5">{op.time}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${op.classes} hidden sm:inline-flex`}>
                              {op.status.replace('_', ' ')}
                            </span>
                             <span className={`inline-flex items-center justify-center rounded-full h-3 w-3 ring-1 ring-inset ${op.classes} sm:hidden`} title={op.status.replace('_', ' ')} />
                            <button className="text-gray-400 hover:text-gray-600">
                              {expandedId === op.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                        
                        {/* Expanded details */}
                        {expandedId === op.id && (
                          <div className="border-t border-gray-100 bg-white p-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="flex flex-col space-y-1 text-center bg-gray-50 rounded p-3">
                                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Integrity Score</span>
                                <span className="text-sm font-medium text-gray-900">{op.details.integrityScore}</span>
                              </div>
                              <div className="flex flex-col space-y-1 text-center bg-gray-50 rounded p-3">
                                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Trust Rating</span>
                                <span className="text-sm font-medium text-gray-900">{op.details.trustRating}</span>
                              </div>
                              <div className="flex flex-col space-y-1 text-center bg-gray-50 rounded p-3">
                                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">ALGA Error %</span>
                                <span className="text-xs font-mono text-gray-700 mt-1">{op.details.algaError}</span>
                              </div>
                              <div className="flex flex-col space-y-1 text-center bg-gray-50 rounded p-3">
                                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Recovery Conf.</span>
                                <span className="text-sm font-medium text-gray-900">{op.details.recoveryConfidence}</span>
                              </div>
                            </div>
                            <div className="mt-4 flex flex-wrap justify-end gap-2">
                              {op.status !== 'SUCCESS' && (
                                <button className="rounded px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200">
                                  Queue Reconciliation
                                </button>
                              )}
                              <button className="rounded px-3 py-1.5 text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                                View Full Trace
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 py-12 text-sm text-gray-500">
                      No operations found matching your criteria.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Central AI Control Hub (Persistent Chat Box) */}
        {!isAiHubOpen && (
          <div className="absolute bottom-0 inset-x-0 border-t border-gray-200 bg-white/90 backdrop-blur-md p-4 sm:p-6 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
            <div className="mx-auto max-w-4xl relative">
              {/* Suggestions */}
              {showSuggestions && commandText.trim() && (
                <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-20">
                  {SUGGESTED_COMMANDS.filter(c => c.toLowerCase().includes(commandText.toLowerCase())).map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 last:border-0 truncate"
                      onClick={() => {
                        setCommandText(suggestion);
                        setShowSuggestions(false);
                        handleCommandSubmit(suggestion);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="relative flex flex-col bg-white rounded-xl border border-gray-300 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                {currentAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-4 pt-3">
                    {currentAttachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        {att.type === 'file' && <Paperclip className="h-3 w-3" />}
                        {att.type === 'link' && <Link className="h-3 w-3" />}
                        {att.type === 'image' && <Camera className="h-3 w-3" />}
                        <span className="truncate max-w-[150px]">{att.name}</span>
                        <button onClick={() => setCurrentAttachments(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 text-gray-400 hover:text-gray-600"><X className="h-3 w-3"/></button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  className="w-full border-none bg-transparent pt-3 pb-2 px-4 text-sm font-medium outline-none placeholder:font-normal placeholder:text-gray-400 focus:ring-0"
                  placeholder="Provide instruction to ZQ Planner or interrogate trace logs..."
                  value={commandText}
                  onChange={(e) => {
                    setCommandText(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCommandSubmit();
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <div className="flex items-center justify-between px-2 pb-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => fileInputRef.current?.click()} title="Upload File" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"><Paperclip className="h-4 w-4" /></button>
                    <button onClick={startVoiceInput} title="Voice Input" className={`rounded-md p-1.5 transition-colors ${isRecording ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}><Mic className="h-4 w-4" /></button>
                    <button onClick={openCamera} title="Camera" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"><Camera className="h-4 w-4" /></button>
                    <button onClick={handleAddLink} title="Deep Review Link" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"><Link className="h-4 w-4" /></button>
                  </div>
                  <button 
                    onClick={() => handleCommandSubmit()}
                    className="rounded-lg bg-blue-600 p-1.5 text-white shadow-sm transition-colors hover:bg-blue-700 flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>

      {/* Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 px-4 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsProfileModalOpen(false)}
              className="absolute right-4 top-4 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-md ring-4 ring-blue-50">
                ZQ
              </div>
              <h3 className="mt-4 text-xl font-bold text-gray-900">Administrator</h3>
              <p className="text-sm font-medium text-gray-500">Level 5 Mission-Critical</p>
              
              <div className="mt-4 flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 ring-1 ring-inset ring-green-600/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                System Ready
              </div>
              
              <div className="mt-6 w-full space-y-2 border-t border-gray-100 pt-4">
                <button className="w-full flex items-center justify-between rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <span>Policy Engine Config</span>
                  <Settings className="h-4 w-4 text-gray-400" />
                </button>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="w-full rounded-lg bg-gray-900 px-4 py-2 mt-2 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
                >
                  Confirm & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Command Hub Drawer */}
      {isAiHubOpen && (
        <div className="fixed inset-0 z-[100] flex">
          <div 
            className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsAiHubOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-full max-w-sm border-l border-gray-200 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6 bg-gray-50">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-gray-900">AI Command Hub</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCommandHistory([])}
                  title="Clear History"
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-200 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setIsAiHubOpen(false)}
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Search within Hub */}
            <div className="border-b border-gray-200 p-3 bg-white">
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search history..."
                  className="w-full rounded-md border border-gray-300 bg-gray-50 pl-9 pr-3 py-2 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
                  value={hubSearchValue}
                  onChange={(e) => setHubSearchValue(e.target.value)}
                />
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {filteredHistory.map(cmd => (
                <div key={cmd.id} className={`flex ${cmd.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`rounded-2xl px-4 py-2 text-sm max-w-[85%] ${
                    cmd.role === 'user' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    <div className="font-medium relative group">
                      {cmd.role === 'ai' && <Bot className="h-4 w-4 mb-0.5 text-gray-500 inline-block mr-2 align-top" />}
                      {cmd.role === 'user' && <Terminal className="h-4 w-4 mb-0.5 text-blue-200 inline-block mr-2" />}
                      {cmd.role === 'ai' ? (
                        <div className="inline-block align-top break-words max-w-full [&_p]:mb-2 [&_p:last-child]:mb-0 [&_pre]:bg-gray-800 [&_pre]:text-gray-100 [&_pre]:p-2 [&_pre]:rounded [&_code]:bg-gray-200 [&_code]:px-1 [&_code]:rounded">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{cmd.text}</ReactMarkdown>
                        </div>
                      ) : (
                        cmd.text
                      )}
                      
                      {cmd.role === 'ai' && (
                        <button
                          onClick={() => navigator.clipboard.writeText(cmd.text)}
                          className="absolute -right-2 -top-2 rounded bg-white p-1 text-gray-400 shadow opacity-0 group-hover:opacity-100 transition-opacity hover:text-blue-600"
                          title="Copy to clipboard"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                    {cmd.attachments && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {cmd.attachments.map((att, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            {att.type === 'image' && att.data && (
                              <img src={att.data} alt={att.name} className="max-w-[200px] h-auto rounded-md shadow-sm border border-gray-200" />
                            )}
                            <div className={`flex items-center gap-1 rounded px-2 py-1 text-xs w-fit ${cmd.role === 'user' ? 'bg-blue-700/50 text-blue-100 border border-blue-500/30' : 'bg-gray-200 text-gray-700 border border-gray-300'}`}>
                              {att.type === 'file' && <Paperclip className="h-3 w-3" />}
                              {att.type === 'link' && <Link className="h-3 w-3" />}
                              {att.type === 'image' && <Camera className="h-3 w-3" />}
                              <span className="truncate max-w-[150px]">{att.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {cmd.details && (
                      <div className="mt-2 text-xs">
                        <button 
                          className={`flex items-center gap-1 font-semibold hover:underline ${cmd.role === 'user' ? 'text-blue-200' : 'text-blue-600'}`}
                          onClick={() => setExpandedCommandId(expandedCommandId === cmd.id ? null : cmd.id)}
                        >
                          {expandedCommandId === cmd.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          {cmd.details.type === 'log' ? 'System Logs' : cmd.details.type === 'plan' ? 'Execution Plan' : 'Data Details'}
                        </button>
                        {expandedCommandId === cmd.id && (
                          <div className={`mt-2 rounded p-2 whitespace-pre-wrap font-mono text-left overflow-x-auto ${cmd.role === 'user' ? 'bg-blue-700/50 text-blue-100' : 'bg-gray-800 text-gray-200'}`}>
                            {cmd.details.content}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoadingAi && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-4 py-2 text-sm bg-gray-100 text-gray-800 border border-gray-200">
                    <div className="flex items-center gap-2">
                       <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
                       <span className="text-gray-500">Processing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 p-4 bg-gray-50 relative">
              {/* Suggestions */}
              {showSuggestions && commandText.trim() && (
                <div className="absolute bottom-full left-4 right-4 mb-2 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-20">
                  {SUGGESTED_COMMANDS.filter(c => c.toLowerCase().includes(commandText.toLowerCase())).map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 border-b border-gray-100 last:border-0 truncate"
                      onClick={() => {
                        setCommandText(suggestion);
                        setShowSuggestions(false);
                        handleCommandSubmit(suggestion);
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
              <div className="relative flex flex-col bg-white rounded-xl border border-gray-300 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                {currentAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 px-4 pt-3">
                    {currentAttachments.map((att, i) => (
                      <div key={i} className="flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-xs text-gray-700">
                        {att.type === 'file' && <Paperclip className="h-3 w-3" />}
                        {att.type === 'link' && <Link className="h-3 w-3" />}
                        {att.type === 'image' && <Camera className="h-3 w-3" />}
                        <span className="truncate max-w-[150px]">{att.name}</span>
                        <button onClick={() => setCurrentAttachments(prev => prev.filter((_, idx) => idx !== i))} className="ml-1 text-gray-400 hover:text-gray-600"><X className="h-3 w-3"/></button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Provide instruction..."
                  className="w-full border-none bg-transparent pt-3 pb-2 px-4 text-sm font-medium outline-none placeholder:text-gray-400 focus:ring-0"
                  value={commandText}
                  onChange={(e) => {
                    setCommandText(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCommandSubmit();
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  autoFocus
                />
                <div className="flex items-center justify-between px-2 pb-2">
                  <div className="flex items-center gap-1">
                    <button onClick={() => fileInputRef.current?.click()} title="Upload File" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"><Paperclip className="h-4 w-4" /></button>
                    <button onClick={startVoiceInput} title="Voice Input" className={`rounded-md p-1.5 transition-colors ${isRecording ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}><Mic className="h-4 w-4" /></button>
                    <button onClick={openCamera} title="Camera" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"><Camera className="h-4 w-4" /></button>
                    <button onClick={handleAddLink} title="Deep Review Link" className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"><Link className="h-4 w-4" /></button>
                  </div>
                  <button 
                    onClick={() => handleCommandSubmit(commandText)}
                    className="rounded-lg bg-blue-600 p-1.5 text-white shadow-sm transition-colors hover:bg-blue-700 flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {isCameraModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl overflow-hidden flex flex-col items-center">
             <div className="w-full flex justify-between items-center mb-4">
                <span className="font-semibold px-2">Capture Image</span>
                <button onClick={() => setIsCameraModalOpen(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100"><X className="h-5 w-5"/></button>
             </div>
             <div className="bg-black w-full aspect-video rounded-lg overflow-hidden flex items-center justify-center relative">
               <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
             </div>
             <button onClick={captureImage} className="mt-4 rounded-full bg-blue-600 p-4 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-colors duration-200">
               <Camera className="h-6 w-6" />
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
