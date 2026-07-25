import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  Typography,
  Chip,
  TextField,
  Avatar,
  List,
  ListItem,
  Divider,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Megaphone,
  Users,
  Headphones,
  PhoneCall,
  Search,
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Phone,
  X,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import CustomButton from '../../components/common/Button';
import {
  fetchAnnouncements,
  acknowledgeAnnouncement,
  snoozeAnnouncement,
  publishAnnouncement,
} from '../../store/slices/announcementSlice';
import CreateAnnouncementModal from '../../components/announcements/CreateAnnouncementModal';
import { fetchTeamMembersApi } from '../../services/api/managerApi';
import {
  createSupportTicketApi,
  sendDirectMessageApi,
  getConversationApi,
} from '../../services/api/supportApi';

const EmployeeAnnouncementsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { announcements, isLoading } = useSelector((state) => state.announcements);

  const [activeTab, setActiveTab] = useState(0); // 0 = Announcements, 1 = Contact Team, 2 = Contact Support
  const [searchQuery, setSearchQuery] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);

  // Direct Message State
  const [activeChatMember, setActiveChatMember] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sendingMsg, setSendingMsg] = useState(false);

  // Support Form State
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportPriority, setSupportPriority] = useState('Normal');
  const roleName = user?.role?.name || user?.role || 'Employee';
  const isManagerOrAdmin = roleName === 'Manager' || roleName === 'Admin';
  const [openAnnounceModal, setOpenAnnounceModal] = useState(false);

  const handlePublishAnnouncement = async (payload) => {
    await dispatch(publishAnnouncement(payload));
  };
  const [supportSuccess, setSupportSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchAnnouncements());
    loadTeam();
  }, [dispatch]);

  const loadTeam = async () => {
    try {
      const res = await fetchTeamMembersApi();
      const list = res.employees || res.data?.employees || res || [];
      if (Array.isArray(list)) {
        setTeamMembers(list);
      }
    } catch (e) {
      console.warn('Failed to load team:', e.message);
    }
  };

  const currentEmpId = String(user?._id || user?.id || 'demo_employee_id');

  const relevantAnnouncements = announcements.filter((a) => {
    if (!a) return false;
    if (a.type === 'General') return true;
    if (a.targetEmployeeIds && a.targetEmployeeIds.includes(currentEmpId)) return true;
    return false;
  });

  const handleAcknowledge = async (id) => {
    await dispatch(acknowledgeAnnouncement(id));
  };

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
    <Box sx={{ pb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
        <PageHeader
          title="Announcements & Team Connect Hub"
          subtitle="View Manager Broadcasts, Message Teammates & Contact Support Desk (8799903365)"
        />
        {isManagerOrAdmin && (
          <CustomButton
            variant="contained"
            color="secondary"
            onClick={() => setOpenAnnounceModal(true)}
            startIcon={<Megaphone size={18} />}
            sx={{
              py: 1.25,
              px: 3,
              borderRadius: '14px',
              fontSize: '0.92rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
              boxShadow: '0 6px 18px rgba(37, 99, 235, 0.25)',
            }}
          >
            + Make Announcement
          </CustomButton>
        )}
      </Box>

      {/* Tabs Navigation */}
      <Tabs
        value={activeTab}
        onChange={(e, val) => setActiveTab(val)}
        sx={{
          mb: 3,
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          p: 0.5,
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
          border: '1px solid #E2E8F0',
          '& .MuiTab-root': {
            fontWeight: 800,
            fontSize: '0.9rem',
            textTransform: 'none',
            borderRadius: '12px',
            py: 1.5,
          },
        }}
      >
        <Tab icon={<Megaphone size={18} />} iconPosition="start" label={`Announcements (${relevantAnnouncements.length})`} />
        <Tab icon={<Users size={18} />} iconPosition="start" label={`Contact Team (${teamMembers.length})`} />
        <Tab icon={<Headphones size={18} />} iconPosition="start" label="Contact Support (8799903365)" />
      </Tabs>

      {/* TAB 0: ANNOUNCEMENTS LIST */}
      {activeTab === 0 && (
        <Grid container spacing={2.5}>
          {relevantAnnouncements.length === 0 ? (
            <Grid item xs={12}>
              <Card sx={{ p: 6, textAlign: 'center', borderRadius: '20px' }}>
                <Megaphone size={48} color="#94A3B8" />
                <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ mt: 2 }}>
                  No Team Announcements
                </Typography>
                <Typography variant="body2" color="#64748B">
                  You are all caught up! New manager broadcasts will appear here.
                </Typography>
              </Card>
            </Grid>
          ) : (
            relevantAnnouncements.map((item) => {
              const itemId = item._id || item.id;
              const isAck = item.acknowledgedBy && item.acknowledgedBy.includes(currentEmpId);

              return (
                <Grid item xs={12} key={itemId}>
                  <Card
                    sx={{
                      p: 3,
                      borderRadius: '20px',
                      background: isAck
                        ? '#FFFFFF'
                        : 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(241, 245, 249, 0.95) 100%)',
                      border: isAck ? '1px solid #E2E8F0' : '2px solid #2563EB40',
                      boxShadow: '0 8px 25px rgba(15, 23, 42, 0.06)',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '14px',
                            backgroundColor: item.priority === 'Urgent' ? '#EF444415' : '#2563EB15',
                            color: item.priority === 'Urgent' ? '#EF4444' : '#2563EB',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Megaphone size={24} />
                        </Box>

                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
                            <Typography variant="h3" fontWeight={800} color="#0F172A">
                              {item.title}
                            </Typography>
                            <Chip
                              label={item.type === 'Personal' ? 'Personal Message' : 'General Announcement'}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                backgroundColor: item.type === 'Personal' ? '#8B5CF620' : '#2563EB20',
                                color: item.type === 'Personal' ? '#6D28D9' : '#1D4ED8',
                              }}
                            />
                            <Chip
                              label={`Priority: ${item.priority}`}
                              size="small"
                              color={item.priority === 'Urgent' ? 'error' : item.priority === 'High' ? 'warning' : 'default'}
                              sx={{ fontWeight: 800, fontSize: '0.72rem' }}
                            />
                          </Box>

                          <Typography variant="body1" color="#334155" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                            {item.message}
                          </Typography>

                          <Typography variant="caption" color="#64748B" fontWeight={700} sx={{ mt: 1, display: 'block' }}>
                            Published by: {item.senderName} ({item.senderRole || 'Manager'})
                          </Typography>
                        </Box>
                      </Box>

                      {isAck ? (
                        <Chip
                          icon={<CheckCircle2 size={16} color="#10B981" />}
                          label="Acknowledged"
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: 800 }}
                        />
                      ) : (
                        <CustomButton
                          variant="contained"
                          color="primary"
                          onClick={() => handleAcknowledge(itemId)}
                          startIcon={<CheckCircle2 size={18} />}
                          sx={{ borderRadius: '12px', fontWeight: 800, px: 3 }}
                        >
                          Acknowledge
                        </CustomButton>
                      )}
                    </Box>
                  </Card>
                </Grid>
              );
            })
          )}
        </Grid>
      )}

      {/* TAB 1: CONTACT TEAM DIRECTORY */}
      {activeTab === 1 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            placeholder="Search team member by name, designation, or branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <Search size={20} color="#94A3B8" style={{ marginRight: 10 }} />,
            }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px', backgroundColor: '#FFFFFF' } }}
          />

          <Grid container spacing={2.5}>
            {filteredMembers.length === 0 ? (
              <Grid item xs={12}>
                <Card sx={{ p: 4, textAlign: 'center', borderRadius: '16px' }}>
                  <Users size={36} color="#94A3B8" />
                  <Typography variant="body2" color="#64748B" sx={{ mt: 1 }}>
                    No team members found.
                  </Typography>
                </Card>
              </Grid>
            ) : (
              filteredMembers.map((member) => {
                const memberId = member._id || member.id;
                const fullName = `${member.firstName || ''} ${member.lastName || member.name || ''}`.trim();
                return (
                  <Grid item xs={12} sm={6} md={4} key={memberId}>
                    <Card sx={{ p: 2.5, borderRadius: '20px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar sx={{ bgcolor: '#2563EB', width: 48, height: 48, fontWeight: 800 }}>
                          {fullName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={800} color="#0F172A">
                            {fullName}
                          </Typography>
                          <Typography variant="body2" color="#64748B">
                            {member.designation || 'Staff'}
                          </Typography>
                          <Typography variant="caption" color="#94A3B8" display="block">
                            {member.department || member.branch || 'Branch'}
                          </Typography>
                        </Box>
                      </Box>

                      <CustomButton
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => handleOpenChat(member)}
                        startIcon={<MessageSquare size={16} />}
                        sx={{ borderRadius: '12px', fontWeight: 800 }}
                      >
                        Send Direct Message
                      </CustomButton>
                    </Card>
                  </Grid>
                );
              })
            )}
          </Grid>
        </Box>
      )}

      {/* TAB 2: CONTACT SUPPORT DESK */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                p: 3.5,
                borderRadius: '24px',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: '#FFFFFF',
                boxShadow: '0 16px 40px rgba(15, 23, 42, 0.25)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: '16px',
                    backgroundColor: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  <PhoneCall size={28} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700} color="#94A3B8">
                    Direct Support Helpline
                  </Typography>
                  <Typography variant="h2" fontWeight={800} color="#10B981" sx={{ mt: 0.25 }}>
                    8799903365
                  </Typography>
                </Box>
              </Box>

              <Typography variant="body2" color="#CBD5E1" sx={{ lineHeight: 1.6, mb: 3 }}>
                Need urgent technical assistance, portal access resolution, or shift attendance support? Call our dedicated hotline directly.
              </Typography>

              <CustomButton
                variant="contained"
                color="success"
                fullWidth
                size="large"
                component="a"
                href="tel:8799903365"
                startIcon={<Phone size={20} />}
                sx={{ borderRadius: '14px', fontWeight: 800, py: 1.5, fontSize: '1rem' }}
              >
                Call Hotline: 8799903365
              </CustomButton>
            </Card>
          </Grid>

          <Grid item xs={12} md={7}>
            <Card sx={{ p: 3.5, borderRadius: '24px', border: '1px solid #E2E8F0' }}>
              <Typography variant="h3" fontWeight={800} color="#0F172A" sx={{ mb: 1 }}>
                Submit Support Ticket to Admin Queue
              </Typography>
              <Typography variant="body2" color="#64748B" sx={{ mb: 3 }}>
                Fill out your query below. Portal administrators will review and address your ticket promptly.
              </Typography>

              {supportSuccess && (
                <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }}>
                  Support ticket submitted successfully! Admin will review your query.
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmitSupportTicket} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Subject / Topic *"
                  placeholder="e.g., Request for attendance correction"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  label="Detailed Inquiry / Issue *"
                  placeholder="Write your issue description here..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                  required
                />

                <CustomButton
                  variant="contained"
                  color="primary"
                  type="submit"
                  loading={submittingSupport}
                  startIcon={<Send size={18} />}
                  sx={{ borderRadius: '14px', fontWeight: 800, py: 1.5, fontSize: '0.95rem' }}
                >
                  Submit Ticket to Admin
                </CustomButton>
              </Box>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Direct Messaging Modal */}
      {activeChatMember && (
        <Dialog
          open={Boolean(activeChatMember)}
          onClose={() => setActiveChatMember(null)}
          maxWidth="xs"
          fullWidth
          PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}
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
                  Start a direct conversation with {activeChatMember.firstName || 'Teammate'}
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

      {/* Manager / Admin Create Announcement Modal */}
      <CreateAnnouncementModal
        open={openAnnounceModal}
        onClose={() => setOpenAnnounceModal(false)}
        onPublish={handlePublishAnnouncement}
      />
    </Box>
  );
};

export default EmployeeAnnouncementsPage;
