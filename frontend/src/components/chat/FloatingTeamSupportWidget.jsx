import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  Typography,
  Chip,
  IconButton,
  Fab,
  Popover,
  Badge,
  Divider,
  Tabs,
  Tab,
  TextField,
  Avatar,
  List,
  ListItem,
  Dialog,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Megaphone,
  MessageSquare,
  Users,
  Headphones,
  PhoneCall,
  Send,
  X,
  Search,
  Clock,
  CheckCircle2,
  Sparkles,
  Phone,
} from 'lucide-react';
import CustomButton from '../common/Button';
import {
  fetchAnnouncements,
  acknowledgeAnnouncement,
  snoozeAnnouncement,
} from '../../store/slices/announcementSlice';
import { fetchTeamMembersApi } from '../../services/api/managerApi';
import {
  createSupportTicketApi,
  sendDirectMessageApi,
  getConversationApi,
} from '../../services/api/supportApi';

const FloatingTeamSupportWidget = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { announcements } = useSelector((state) => state.announcements);

  const [activeTab, setActiveTab] = useState(0); // 0 = Announcements, 1 = Contact Team, 2 = Contact Support
  const [popoverAnchor, setPopoverAnchor] = useState(null);
  // Persisted dismissed/acknowledged announcement IDs in localStorage
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('acknowledged_announcement_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Contact Team State
  const [teamMembers, setTeamMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChatMember, setActiveChatMember] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sendingMsg, setSendingMsg] = useState(false);

  // Contact Support State
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportPriority, setSupportPriority] = useState('Normal');
  const [submittingSupport, setSubmittingSupport] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchAnnouncements());
    loadTeamMembers();
  }, [dispatch]);

  const loadTeamMembers = async () => {
    try {
      const res = await fetchTeamMembersApi();
      const list = res.employees || res.data?.employees || res || [];
      if (Array.isArray(list)) {
        setTeamMembers(list);
      }
    } catch (e) {
      console.warn('Failed to load team for Contact Team widget:', e.message);
    }
  };

  const currentEmpId = String(user?._id || user?.id || 'demo_employee_id');

  // Filter announcements for logged in employee
  const relevantAnnouncements = announcements.filter((a) => {
    if (!a) return false;
    if (a.type === 'General') return true;
    if (a.targetEmployeeIds && a.targetEmployeeIds.includes(currentEmpId)) return true;
    return false;
  });

  // Find top unacknowledged & unsnoozed & undismissed announcement for Glass Overlay Popup Modal
  const activeOverlayItem = relevantAnnouncements.find((a) => {
    const itemId = String(a._id || a.id);
    const isAcked =
      (a.acknowledgedBy &&
        a.acknowledgedBy.some((id) => String(id._id || id) === currentEmpId || String(id) === 'current')) ||
      false;
    const isSnoozed =
      (a.snoozedBy &&
        a.snoozedBy.some((id) => String(id._id || id) === currentEmpId || String(id) === 'current')) ||
      false;
    const isLocallyDismissed = dismissedIds.includes(itemId);
    return !isAcked && !isSnoozed && !isLocallyDismissed;
  });

  const saveDismissedId = (cleanId) => {
    setDismissedIds((prev) => {
      if (prev.includes(cleanId)) return prev;
      const updated = [...prev, cleanId];
      try {
        localStorage.setItem('acknowledged_announcement_ids', JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage save failed:', e.message);
      }
      return updated;
    });
  };

  const handleAcknowledge = async (id) => {
    const cleanId = String(id);
    saveDismissedId(cleanId);
    await dispatch(acknowledgeAnnouncement(cleanId));
  };

  const handleSnooze = async (id) => {
    const cleanId = String(id);
    saveDismissedId(cleanId);
    await dispatch(snoozeAnnouncement(cleanId));
  };

  const handleOpenPopover = (e) => {
    setPopoverAnchor(e.currentTarget);
  };

  const handleClosePopover = () => {
    setPopoverAnchor(null);
  };

  const isPopoverOpen = Boolean(popoverAnchor);

  // Direct Message to Employee
  const handleOpenChat = async (member) => {
    setActiveChatMember(member);
    const partnerId = member._id || member.id;
    try {
      const res = await getConversationApi(partnerId);
      const list = res.conversation || res.data?.conversation || [];
      setChatHistory(list);
    } catch (e) {
      setChatHistory([]);
    }
  };

  const handleSendDirectMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeChatMember) return;

    const partnerId = activeChatMember._id || activeChatMember.id;
    const partnerName = `${activeChatMember.firstName || ''} ${activeChatMember.lastName || activeChatMember.name || ''}`.trim();

    setSendingMsg(true);
    try {
      const res = await sendDirectMessageApi({
        recipientId: partnerId,
        recipientName: partnerName,
        message: chatMessage,
      });

      const newMsg = res.message || res.data?.message || {
        _id: `msg_${Date.now()}`,
        senderId: currentEmpId,
        senderName: user?.firstName || 'Me',
        recipientId: partnerId,
        message: chatMessage,
        createdAt: new Date().toISOString(),
      };

      setChatHistory((prev) => [...prev, newMsg]);
      setChatMessage('');
    } catch (err) {
      console.error('Send message failed:', err.message);
    } finally {
      setSendingMsg(false);
    }
  };

  // Submit Support Ticket to Admin Queue
  const handleSubmitSupportTicket = async (e) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportMessage.trim()) return;

    setSubmittingSupport(true);
    setSupportSuccess(false);

    try {
      await createSupportTicketApi({
        subject: supportSubject,
        message: supportMessage,
        priority: supportPriority,
      });

      setSupportSuccess(true);
      setSupportSubject('');
      setSupportMessage('');
      setSupportPriority('Normal');
      setTimeout(() => setSupportSuccess(false), 4000);
    } catch (err) {
      alert(err.message || 'Failed to submit support ticket');
    } finally {
      setSubmittingSupport(false);
    }
  };

  const filteredMembers = teamMembers.filter((m) => {
    const name = `${m.firstName || ''} ${m.lastName || m.name || ''}`.toLowerCase();
    const desig = (m.designation || '').toLowerCase();
    const branch = (m.department || m.branch || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || desig.includes(query) || branch.includes(query);
  });

  return (
    <>
      {/* 1. GLASSMORPHISM OVERLAY POPUP MODAL FOR ANNOUNCEMENTS */}
      <Dialog
        open={Boolean(activeOverlayItem)}
        onClose={() => handleSnooze(activeOverlayItem?._id || activeOverlayItem?.id)}
        maxWidth="sm"
        fullWidth
        BackdropProps={{
          sx: {
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            backgroundColor: 'rgba(15, 23, 42, 0.68)',
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: '28px',
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.96) 0%, rgba(241, 245, 249, 0.98) 100%)',
            border: activeOverlayItem?.priority === 'Urgent'
              ? '2px solid rgba(239, 68, 68, 0.6)'
              : '2px solid rgba(37, 99, 235, 0.5)',
            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
            p: 1,
            overflow: 'hidden',
          },
        }}
      >
        {activeOverlayItem && (
          <Box sx={{ p: 3, position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '16px',
                    background: activeOverlayItem.priority === 'Urgent'
                      ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)'
                      : 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
                  }}
                >
                  <Megaphone size={26} />
                </Box>
                <Box>
                  <Typography variant="caption" fontWeight={800} color="#64748B" sx={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.72rem' }}>
                    Manager Announcement Broadcast
                  </Typography>
                  <Typography variant="h3" fontWeight={800} color="#0F172A">
                    {activeOverlayItem.title}
                  </Typography>
                </Box>
              </Box>

              <Chip
                label={`Priority: ${activeOverlayItem.priority}`}
                size="small"
                color={activeOverlayItem.priority === 'Urgent' ? 'error' : activeOverlayItem.priority === 'High' ? 'warning' : 'default'}
                sx={{ fontWeight: 800, fontSize: '0.75rem' }}
              />
            </Box>

            <Divider sx={{ mb: 2.5 }} />

            <Typography variant="body1" color="#334155" sx={{ lineHeight: 1.7, fontWeight: 500, mb: 3, fontSize: '1.02rem' }}>
              {activeOverlayItem.message}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 2, borderTop: '1px solid #E2E8F0', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: '#475569' }}>
                <Sparkles size={16} color="#8B5CF6" />
                <Typography variant="caption" fontWeight={700} color="#334155" sx={{ fontSize: '0.82rem' }}>
                  Sent by: <strong>{activeOverlayItem.senderName}</strong> ({activeOverlayItem.senderRole || 'Manager'})
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <CustomButton
                  variant="outlined"
                  color="neutral"
                  size="medium"
                  onClick={() => handleSnooze(activeOverlayItem._id || activeOverlayItem.id)}
                  startIcon={<Clock size={16} />}
                  sx={{ borderRadius: '12px', fontWeight: 700 }}
                >
                  Remind Me Later
                </CustomButton>

                <CustomButton
                  variant="contained"
                  color="primary"
                  size="medium"
                  onClick={() => handleAcknowledge(activeOverlayItem._id || activeOverlayItem.id)}
                  startIcon={<CheckCircle2 size={18} />}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 800,
                    px: 3,
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)',
                  }}
                >
                  Acknowledge
                </CustomButton>
              </Box>
            </Box>
          </Box>
        )}
      </Dialog>

      {/* 2. FLOATING BOTTOM-RIGHT CHAT & SUPPORT PORTAL ICON */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1200,
        }}
      >
        <Badge
          badgeContent={relevantAnnouncements.length}
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#8B5CF6',
              fontWeight: 800,
              fontSize: '0.75rem',
            },
          }}
        >
          <Fab
            onClick={handleOpenPopover}
            sx={{
              width: 60,
              height: 60,
              background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
              color: '#FFFFFF',
              boxShadow: '0 12px 28px rgba(37, 99, 235, 0.4)',
              '&:hover': {
                transform: 'scale(1.06)',
                background: 'linear-gradient(135deg, #1D4ED8 0%, #7C3AED 100%)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <MessageSquare size={26} />
          </Fab>
        </Badge>

        {/* Unified Announcements, Contact Team & Support Popover Drawer */}
        <Popover
          open={isPopoverOpen}
          anchorEl={popoverAnchor}
          onClose={handleClosePopover}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          PaperProps={{
            sx: {
              width: 440,
              maxHeight: 600,
              borderRadius: '24px',
              boxShadow: '0 24px 60px rgba(15, 23, 42, 0.25)',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2, backgroundColor: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Sparkles size={20} />
              </Box>
              <Box>
                <Typography variant="subtitle1" fontWeight={800} color="#FFFFFF">
                  InterSkill Connect & Support
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={handleClosePopover} sx={{ color: '#94A3B8' }}>
              <X size={20} />
            </IconButton>
          </Box>

          {/* Navigation Tabs */}
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="fullWidth"
            sx={{
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.82rem',
                textTransform: 'none',
                py: 1.5,
              },
            }}
          >
            <Tab icon={<Megaphone size={16} />} iconPosition="start" label={`Announce (${relevantAnnouncements.length})`} />
            <Tab icon={<Users size={16} />} iconPosition="start" label="Contact Team" />
            <Tab icon={<Headphones size={16} />} iconPosition="start" label="Support (8799903365)" />
          </Tabs>

          {/* TAB 1: ANNOUNCEMENTS */}
          {activeTab === 0 && (
            <Box sx={{ p: 0, overflowY: 'auto', maxHeight: 480 }}>
              <List sx={{ p: 0 }}>
                {relevantAnnouncements.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Megaphone size={36} color="#94A3B8" />
                    <Typography variant="body2" color="#64748B" sx={{ mt: 1 }}>
                      No active team announcements.
                    </Typography>
                  </Box>
                ) : (
                  relevantAnnouncements.map((item) => {
                    const itemId = item._id || item.id;
                    const isAck = (item.acknowledgedBy && item.acknowledgedBy.includes(currentEmpId)) || item.acknowledgedBy?.includes('current');
                    return (
                      <React.Fragment key={itemId}>
                        <ListItem
                          sx={{
                            p: 2.5,
                            backgroundColor: isAck ? '#FFFFFF' : '#2563EB08',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            gap: 0.75,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                              {item.title}
                            </Typography>
                            {isAck ? (
                              <Chip label="Acknowledged" size="small" color="success" sx={{ fontSize: '0.68rem', height: 20, fontWeight: 700 }} />
                            ) : (
                              <Chip label="New" size="small" color="primary" sx={{ fontSize: '0.68rem', height: 20, fontWeight: 700 }} />
                            )}
                          </Box>

                          <Typography variant="body2" color="#475569" sx={{ lineHeight: 1.5 }}>
                            {item.message}
                          </Typography>

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', mt: 1 }}>
                            <Typography variant="caption" color="#64748B" fontWeight={700}>
                              From: {item.senderName} • {item.type}
                            </Typography>
                            {!isAck && (
                              <CustomButton
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={() => handleAcknowledge(itemId)}
                                sx={{ fontSize: '0.72rem', py: 0.25, px: 1.5, borderRadius: '8px', fontWeight: 700 }}
                              >
                                Acknowledge
                              </CustomButton>
                            )}
                          </Box>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    );
                  })
                )}
              </List>
            </Box>
          )}

          {/* TAB 2: CONTACT TEAM */}
          {activeTab === 1 && (
            <Box sx={{ p: 2, overflowY: 'auto', maxHeight: 480, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                placeholder="Search employee by name or designation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                fullWidth
                InputProps={{
                  startAdornment: <Search size={18} color="#94A3B8" style={{ marginRight: 8 }} />,
                }}
              />

              <List sx={{ p: 0 }}>
                {filteredMembers.length === 0 ? (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Users size={32} color="#94A3B8" />
                    <Typography variant="body2" color="#64748B" sx={{ mt: 1 }}>
                      No employees match your search.
                    </Typography>
                  </Box>
                ) : (
                  filteredMembers.map((member) => {
                    const memberId = member._id || member.id;
                    const fullName = `${member.firstName || ''} ${member.lastName || member.name || ''}`.trim();
                    return (
                      <React.Fragment key={memberId}>
                        <ListItem
                          sx={{
                            p: 1.5,
                            borderRadius: '14px',
                            '&:hover': { backgroundColor: '#F8FAFC' },
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: '#2563EB', width: 40, height: 40, fontWeight: 700 }}>
                              {fullName.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                                {fullName}
                              </Typography>
                              <Typography variant="caption" color="#64748B" display="block">
                                {member.designation || 'Staff'} • {member.department || member.branch || 'Branch'}
                              </Typography>
                            </Box>
                          </Box>

                          <CustomButton
                            variant="outlined"
                            color="primary"
                            size="small"
                            onClick={() => handleOpenChat(member)}
                            startIcon={<MessageSquare size={14} />}
                            sx={{ borderRadius: '10px', fontSize: '0.78rem', fontWeight: 700 }}
                          >
                            Message
                          </CustomButton>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    );
                  })
                )}
              </List>
            </Box>
          )}

          {/* TAB 3: CONTACT SUPPORT */}
          {activeTab === 2 && (
            <Box sx={{ p: 2.5, overflowY: 'auto', maxHeight: 480, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Direct Call Phone Card */}
              <Card
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 10px 25px rgba(15, 23, 42, 0.2)',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '14px',
                      backgroundColor: '#10B981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FFFFFF',
                    }}
                  >
                    <PhoneCall size={24} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="#94A3B8">
                      Site Help Desk Support Line
                    </Typography>
                    <Typography variant="h3" fontWeight={800} color="#10B981" sx={{ mt: 0.25 }}>
                      8799903365
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2, pt: 1.5, borderTop: '1px solid #334155' }}>
                  <Typography variant="caption" color="#CBD5E1">
                    Available Mon - Sat (9:00 AM - 7:00 PM)
                  </Typography>
                  <CustomButton
                    variant="contained"
                    color="success"
                    size="small"
                    component="a"
                    href="tel:8799903365"
                    startIcon={<Phone size={14} />}
                    sx={{ borderRadius: '10px', fontWeight: 800, px: 2 }}
                  >
                    Call Now
                  </CustomButton>
                </Box>
              </Card>

              {/* Submit Support Message Form to Admin */}
              <Box component="form" onSubmit={handleSubmitSupportTicket} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="subtitle2" fontWeight={800} color="#0F172A">
                  Submit Support Ticket to Admin
                </Typography>

                {supportSuccess && (
                  <Alert severity="success" sx={{ borderRadius: '12px' }}>
                    Your support query has been delivered to the Admin queue!
                  </Alert>
                )}

                <TextField
                  label="Subject / Topic *"
                  placeholder="e.g., Attendance adjustment request"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  size="small"
                  fullWidth
                  required
                />

                <TextField
                  label="Detailed Message *"
                  placeholder="Explain your inquiry or issue for the portal administrator..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  multiline
                  rows={3}
                  size="small"
                  fullWidth
                  required
                />

                <CustomButton
                  variant="contained"
                  color="primary"
                  type="submit"
                  loading={submittingSupport}
                  startIcon={<Send size={16} />}
                  sx={{ borderRadius: '12px', fontWeight: 800, py: 1 }}
                >
                  Submit Query to Admin
                </CustomButton>
              </Box>
            </Box>
          )}
        </Popover>
      </Box>

      {/* 3. DIRECT MESSAGE CHAT DIALOG */}
      {activeChatMember && (
        <Dialog
          open={Boolean(activeChatMember)}
          onClose={() => setActiveChatMember(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '24px', p: 1 },
          }}
        >
          <DialogTitle sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#0F172A', color: '#FFFFFF', borderRadius: '16px 16px 0 0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: '#2563EB', width: 36, height: 36, fontWeight: 700 }}>
                {(activeChatMember.firstName || 'E').charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} color="#FFFFFF">
                  {`${activeChatMember.firstName || ''} ${activeChatMember.lastName || activeChatMember.name || ''}`}
                </Typography>
                <Typography variant="caption" color="#94A3B8">
                  {activeChatMember.designation || 'Staff'}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setActiveChatMember(null)} sx={{ color: '#94A3B8' }}>
              <X size={18} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 340, minHeight: 240, overflowY: 'auto' }}>
            {chatHistory.length === 0 ? (
              <Box sx={{ my: 'auto', textAlign: 'center', p: 2 }}>
                <MessageSquare size={32} color="#94A3B8" />
                <Typography variant="body2" color="#64748B" sx={{ mt: 1 }}>
                  Start a direct chat with {activeChatMember.firstName || 'Teammate'}
                </Typography>
              </Box>
            ) : (
              chatHistory.map((msg) => {
                const isMe = String(msg.senderId) === currentEmpId;
                return (
                  <Box
                    key={msg._id || msg.id}
                    sx={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '80%',
                      p: 1.5,
                      borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                      backgroundColor: isMe ? '#2563EB' : '#F1F5F9',
                      color: isMe ? '#FFFFFF' : '#0F172A',
                    }}
                  >
                    <Typography variant="body2" sx={{ lineHeight: 1.4, fontWeight: 500 }}>
                      {msg.message}
                    </Typography>
                  </Box>
                );
              })
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2, borderTop: '1px solid #E2E8F0' }}>
            <Box component="form" onSubmit={handleSendDirectMessage} sx={{ display: 'flex', gap: 1, width: '100%' }}>
              <TextField
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                size="small"
                fullWidth
                autoFocus
              />
              <CustomButton variant="contained" color="primary" type="submit" loading={sendingMsg} sx={{ borderRadius: '10px', px: 2 }}>
                <Send size={18} />
              </CustomButton>
            </Box>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default FloatingTeamSupportWidget;
