'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Send, 
  X, 
  ArrowLeft,
  User,
  Shield,
  Filter
} from 'lucide-react';

export interface Ticket {
  id: string;
  ticket_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_USER' | 'RESOLVED' | 'CLOSED';
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string | null;
  sender_name: string;
  sender_role: 'user' | 'admin' | 'owner';
  message: string;
  created_at: string;
}

const CATEGORIES = [
  'All',
  'VPN Connection',
  'Gift Cards',
  'Subscription Credentials',
  'Game Top-ups',
  'Software',
  'Billing & Slip',
  'General',
];

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-white/10 text-white border-white/20',
  IN_PROGRESS: 'bg-white/15 text-white border-white/30',
  WAITING_USER: 'bg-white/5 text-zinc-400 border-white/10',
  RESOLVED: 'bg-white/20 text-white border-white/40',
  CLOSED: 'bg-black text-zinc-500 border-zinc-800',
};

const PRIORITY_BADGES: Record<string, string> = {
  LOW: 'text-zinc-400 border-zinc-700',
  MEDIUM: 'text-zinc-200 border-zinc-600',
  HIGH: 'text-white border-zinc-400 font-semibold',
  URGENT: 'text-white bg-white/20 border-white font-bold',
};

export default function TicketCenter({
  userRole = 'user',
  userEmail,
}: {
  userRole?: 'user' | 'admin' | 'owner';
  userEmail?: string;
}) {
  const [verifiedUser, setVerifiedUser] = useState<{
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin' | 'owner';
  } | null>(userEmail ? { id: '', email: userEmail, name: '', role: userRole } : null);
  const [authChecked, setAuthChecked] = useState(false);

  const effectiveRole: 'user' | 'admin' | 'owner' = verifiedUser?.role ?? 'user';
  const effectiveEmail = verifiedUser?.email || userEmail || '';

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  
  // Active selected ticket for thread conversation view
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // New Ticket Modal State
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState(userEmail || '');
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('VPN Connection');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newInitialMessage, setNewInitialMessage] = useState('');
  const [creatingTicket, setCreatingTicket] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/me', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (!active) return;
        const u = data.user ?? null;
        setVerifiedUser(u);
        if (u) {
          setNewCustomerEmail(u.email);
          if (u.name) setNewCustomerName((prev) => prev || u.name);
        }
        setAuthChecked(true);
      })
      .catch(() => {
        if (!active) return;
        setVerifiedUser(null);
        setAuthChecked(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!verifiedUser) {
      setTickets([]);
      setLoading(false);
      return;
    }
    fetchTickets();
  }, [authChecked, verifiedUser?.id, verifiedUser?.role]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tickets', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && Array.isArray(data.tickets)) {
        setTickets(data.tickets);
      } else {
        setTickets([]);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const openTicketThread = async (ticket: Ticket) => {
    setActiveTicket(ticket);
    try {
      setLoadingMessages(true);
      const res = await fetch(`/api/tickets/${ticket.id}`);
      const data = await res.json();
      if (res.ok && data.messages) {
        setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to load ticket thread:', err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    try {
      setSendingReply(true);
      const res = await fetch(`/api/tickets/${activeTicket.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: replyText.trim(),
        }),
      });

      if (res.ok) {
        setReplyText('');
        const updatedRes = await fetch(`/api/tickets/${activeTicket.id}`);
        const updatedData = await updatedRes.json();
        if (updatedData.messages) {
          setMessages(updatedData.messages);
        }
        if (updatedData.ticket) {
          setActiveTicket(updatedData.ticket);
        }
        fetchTickets();
      }
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        if (activeTicket && activeTicket.id === ticketId) {
          setActiveTicket((prev) => (prev ? { ...prev, status: newStatus as any } : null));
        }
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus as any } : t))
        );
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newInitialMessage.trim()) return;

    try {
      setCreatingTicket(true);
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newCustomerName.trim() || verifiedUser?.name || 'Customer',
          subject: newSubject.trim(),
          category: newCategory,
          priority: newPriority,
          message: newInitialMessage.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.ticket) {
        setIsNewModalOpen(false);
        setNewSubject('');
        setNewInitialMessage('');
        fetchTickets();
        openTicketThread(data.ticket);
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setCreatingTicket(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    const matchesSearch =
      t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customer_email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* If looking at an individual ticket conversation */}
      {activeTicket ? (
        <div className="p-6 rounded-[20px] bg-[#0c0c0e] border border-[#1f1f23] space-y-6 animate-in fade-in duration-200">
          
          {/* Thread Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1f1f23]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveTicket(null)}
                className="p-2 rounded-xl bg-[#141417] hover:bg-[#1a1a1e] border border-white/10 text-white transition-colors cursor-pointer"
                title="Back to all tickets"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-white tracking-wider">
                    {activeTicket.ticket_number}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                      STATUS_COLORS[activeTicket.status] || ''
                    }`}
                  >
                    {activeTicket.status.replace('_', ' ')}
                  </span>
                  <span
                    className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                      PRIORITY_BADGES[activeTicket.priority] || ''
                    }`}
                  >
                    {activeTicket.priority} Priority
                  </span>
                </div>
                <h3 className="text-lg font-medium text-white">{activeTicket.subject}</h3>
                <div className="text-xs font-mono text-[#a1a4a5] mt-0.5">
                  Raised by {activeTicket.customer_name} ({activeTicket.customer_email}) · Category: {activeTicket.category}
                </div>
              </div>
            </div>

            {/* Quick Status Control */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {activeTicket.status !== 'RESOLVED' && activeTicket.status !== 'CLOSED' ? (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(activeTicket.id, 'RESOLVED')}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mark Resolved</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(activeTicket.id, 'OPEN')}
                  className="px-3.5 py-1.5 rounded-xl bg-[#141417] hover:bg-[#1a1a1e] border border-white/10 text-white text-xs font-mono font-medium transition-colors cursor-pointer"
                >
                  Reopen Ticket
                </button>
              )}
            </div>
          </div>

          {/* Conversation Thread History */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
            {loadingMessages ? (
              <div className="py-12 text-center text-xs font-mono text-[#a1a4a5]">
                Loading conversation messages...
              </div>
            ) : messages.length === 0 ? (
              <div className="py-8 text-center text-xs font-mono text-[#a1a4a5]">
                No messages recorded for this ticket yet.
              </div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.sender_role === 'admin' || msg.sender_role === 'owner';

                return (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-[16px] border text-xs font-mono space-y-2 ${
                      isAdmin
                        ? 'bg-[#141417] border-white/20 ml-4 sm:ml-12'
                        : 'bg-[#0c0c0e] border-[#1f1f23] mr-4 sm:mr-12'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{msg.sender_name}</span>
                        {isAdmin ? (
                          <span className="px-1.5 py-0.2 rounded bg-white/15 text-white text-[9px] uppercase tracking-wider font-bold">
                            {msg.sender_role === 'owner' ? 'Owner' : 'Support Desk'}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-white/5 text-zinc-400 text-[9px] uppercase tracking-wider">
                            Customer
                          </span>
                        )}
                      </div>
                      <span className="text-[#a1a4a5]">{formatDate(msg.created_at)}</span>
                    </div>

                    <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Reply Composer Form */}
          <form onSubmit={handleSendReply} className="pt-3 border-t border-[#1f1f23] space-y-3">
            <div className="flex gap-2">
              <textarea
                rows={3}
                required
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  effectiveRole === 'admin' || effectiveRole === 'owner'
                    ? 'Write official support reply or resolution steps...'
                    : 'Add follow-up details, configuration errors, or client log output...'
                }
                className="flex-1 p-3 rounded-xl bg-[#141417] border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#a1a4a5]">
                Signed as: <strong>{effectiveRole.toUpperCase()}</strong> ({effectiveEmail || 'Active Session'})
              </span>
              <button
                type="submit"
                disabled={sendingReply || !replyText.trim()}
                className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingReply ? 'Sending...' : 'Send Message'}</span>
              </button>
            </div>
          </form>

        </div>
      ) : (
        /* Ticket Master List View */
        <div className="space-y-6">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-zinc-400" />
                <span>Support Ticket System</span>
              </h2>
              <p className="text-xs text-[#a1a4a5] mt-0.5">
                {effectiveRole === 'admin' || effectiveRole === 'owner'
                  ? 'Manage and resolve customer support queries, connection bottlenecks, and billing issues.'
                  : 'Track your inquiries, request assistance with node configurations, or submit error logs.'}
              </p>
            </div>

            {verifiedUser && (
              <button
                type="button"
                onClick={() => setIsNewModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Open New Ticket</span>
              </button>
            )}
          </div>

          {!authChecked ? (
            <div className="p-12 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] text-center text-xs font-mono text-[#a1a4a5]">
              Verifying session...
            </div>
          ) : !verifiedUser ? (
            <div className="p-12 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] text-center space-y-4">
              <Shield className="w-8 h-8 text-zinc-500 mx-auto" />
              <div className="space-y-1.5">
                <h3 className="text-base font-medium text-white">Sign In Required</h3>
                <p className="text-xs text-[#a1a4a5] max-w-md mx-auto leading-relaxed">
                  Support tickets are protected by account authentication and Row-Level Security so only you and authorized support staff can view your conversations.
                </p>
              </div>
              <Link
                href="/login?callbackUrl=/tickets"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-semibold uppercase tracking-wider transition-colors"
              >
                <span>Sign In to View or Open Tickets</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <>

          {/* Search & Filter Controls */}
          <div className="p-4 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search ticket #, subject, customer email or name..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141417] border border-white/10 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                />
              </div>

              {/* Status Selector */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#141417] border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-white/30 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              <span className="text-[11px] font-mono text-[#a1a4a5] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                <span>Category:</span>
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-full text-xs font-mono transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-white text-black font-semibold'
                      : 'bg-[#141417] text-[#a1a4a5] hover:text-white hover:bg-[#1c1c20]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Ticket Cards Grid */}
          <div className="space-y-3">
            {loading ? (
              <div className="p-12 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] text-center text-xs font-mono text-[#a1a4a5]">
                Loading support tickets...
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] text-center space-y-3">
                <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto" />
                <h4 className="text-sm font-medium text-white">No Tickets Found</h4>
                <p className="text-xs text-[#a1a4a5] max-w-sm mx-auto">
                  {tickets.length === 0
                    ? 'No support tickets have been opened yet. If you have questions about your configuration or orders, submit a new ticket.'
                    : 'No tickets match the selected filters.'}
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-mono font-medium cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Open First Ticket</span>
                </button>
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => openTicketThread(ticket)}
                  className="p-5 rounded-[16px] bg-[#0c0c0e] border border-[#1f1f23] hover:border-white/30 hover:bg-[#111114] transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-white tracking-wider">
                        {ticket.ticket_number}
                      </span>
                      <span
                        className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                          STATUS_COLORS[ticket.status] || ''
                        }`}
                      >
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span
                        className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                          PRIORITY_BADGES[ticket.priority] || ''
                        }`}
                      >
                        {ticket.priority}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">
                        {ticket.category}
                      </span>
                    </div>

                    <h4 className="text-sm font-medium text-white group-hover:text-zinc-200 transition-colors truncate">
                      {ticket.subject}
                    </h4>

                    <div className="text-xs font-mono text-[#a1a4a5]">
                      From: {ticket.customer_name} ({ticket.customer_email})
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs font-mono text-[#a1a4a5]">
                    <div className="text-right">
                      <div className="text-white font-medium flex items-center gap-1 justify-end">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{ticket.message_count || 1} msgs</span>
                      </div>
                      <div className="text-[10px] text-[#a1a4a5] mt-0.5">
                        {formatDate(ticket.updated_at || ticket.created_at)}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
          </>
          )}

        </div>
      )}

      {/* Open New Ticket Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg rounded-[20px] bg-[#0c0c0e] border border-[#1f1f23] p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f23]">
              <div>
                <h3 className="text-base font-medium text-white">Open Support Ticket</h3>
                <p className="text-xs text-[#a1a4a5]">We respond to developer inquiries in &lt; 15 minutes</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded text-[#a1a4a5] hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a4a5] uppercase tracking-wider mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder="e.g. Ruwan Silva"
                    className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-[#a1a4a5] uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    readOnly
                    value={newCustomerEmail}
                    placeholder="ruwan@corp.lk"
                    className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-white/10 text-zinc-400 placeholder-zinc-500 focus:outline-none cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#a1a4a5] uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-white/10 text-white focus:outline-none focus:border-white/30 cursor-pointer"
                  >
                    <option value="VPN Connection">VPN Connection (High-Speed VLESS)</option>
                    <option value="Gift Cards">Gift Cards &amp; Digital Codes</option>
                    <option value="Subscription Credentials">Subscriptions (Netflix / Spotify / ChatGPT)</option>
                    <option value="Game Top-ups">Game Top-ups (Free Fire / PUBG / Valorant)</option>
                    <option value="Software">Software Licenses</option>
                    <option value="Billing & Slip">Billing &amp; Bank Slip Verification</option>
                    <option value="General">General Question</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#a1a4a5] uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-white/10 text-white focus:outline-none focus:border-white/30 cursor-pointer"
                  >
                    <option value="LOW">Low (General guidance)</option>
                    <option value="MEDIUM">Medium (Setup trouble)</option>
                    <option value="HIGH">High (Service outage / billing)</option>
                    <option value="URGENT">Urgent (Complete connection drop)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#a1a4a5] uppercase tracking-wider mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Cannot connect to VLESS node via NetMod or v2rayNG"
                  className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                />
              </div>

              <div>
                <label className="block text-[#a1a4a5] uppercase tracking-wider mb-1">
                  Issue Description &amp; Error Details *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newInitialMessage}
                  onChange={(e) => setNewInitialMessage(e.target.value)}
                  placeholder="Provide client OS, error codes, ping test output, or order reference ID..."
                  className="w-full px-3 py-2 rounded-xl bg-[#141417] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#141417] hover:bg-[#1a1a1e] border border-white/10 text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingTicket}
                  className="px-5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold uppercase tracking-wider cursor-pointer disabled:opacity-50"
                >
                  {creatingTicket ? 'Submitting...' : 'Submit Ticket ›'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
