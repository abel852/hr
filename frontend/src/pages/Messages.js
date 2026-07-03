import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ConfirmDialog from '../components/common/ConfirmDialog';
import ComposeModal from '../components/messages/ComposeModal';
import MessageViewer from '../components/messages/MessageViewer';
import { useAuth } from '../context/AuthContext';

const TABS = {
  INBOX: 'inbox',
  SENT: 'sent',
  TRASH: 'trash'
};

const authConfig = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const Messages = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState(TABS.INBOX);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMap, setUserMap] = useState({});
  const [selected, setSelected] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null, type: 'delete' });
  const [working, setWorking] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      let url = '/api/messages/inbox';
      if (tab === TABS.SENT) url = '/api/messages/sent';
      if (tab === TABS.TRASH) url = '/api/messages/trash';
      const [res, recRes] = await Promise.all([
        axios.get(url, authConfig()),
        axios.get('/api/messages/recipients', authConfig()).catch(() => ({ data: [] }))
      ]);
      const list = Array.isArray(recRes.data) ? recRes.data : [];
      const map = {};
      list.forEach(r => { map[r._id] = { name: r.name, role: r.role, department: r.department }; });
      setUserMap(map);
      const myEmpId = user?._id || user?.employeeId || user?.user?.employeeId || user?.user?._id;
      const msgs = (res.data.messages || []).map(m => ({
        ...m,
        senderName: m.senderName || (map[m.sender]?.name || m.sender),
        senderRole: map[m.sender]?.role,
        recipientName: m.recipientName || (map[m.recipient]?.name || m.recipient),
        recipientRole: map[m.recipient]?.role,
        _direction: (m.sender === myEmpId || m.sender?._id === myEmpId) ? 'sent' : ((m.recipient === myEmpId || m.recipient?._id === myEmpId) ? 'inbox' : 'other')
      }));
      setMessages(msgs);
      setSelected(msgs[0] || null);
    } catch (e) {
      setMessages([]);
      setSelected(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [tab]);

  const openDelete = (id) => setConfirm({ open: true, id, type: 'delete' });
  const openRestore = (id) => setConfirm({ open: true, id, type: 'restore' });
  const openPurge = (id) => setConfirm({ open: true, id, type: 'purge' });

  const doConfirm = async () => {
    if (!confirm.id) return;
    setWorking(true);
    try {
      if (confirm.type === 'delete') {
        await axios.delete(`/api/messages/${confirm.id}`, authConfig());
      } else if (confirm.type === 'restore') {
        await axios.put(`/api/messages/${confirm.id}/restore`, null, authConfig());
      } else if (confirm.type === 'purge') {
        await axios.delete(`/api/messages/${confirm.id}/purge`, authConfig());
      }
      await load();
    } catch (e) {
      // noop
    } finally {
      setWorking(false);
      setConfirm({ open: false, id: null, type: 'delete' });
    }
  };

  const markRead = async (id) => {
    try {
      await axios.put(`/api/messages/${id}/read`, null, authConfig());
      setMessages(prev => prev.map(m => m._id === id ? { ...m, status: 'read', readAt: new Date().toISOString() } : m));
      if (selected?._id === id) setSelected(s => s ? { ...s, status: 'read', readAt: new Date().toISOString() } : s);
    } catch {}
  };

  const doReply = (msg) => {
    setReplyTo(msg);
    setComposeOpen(true);
  };

  const Actions = ({ m }) => (
    <div className="flex items-center gap-2">
      {tab !== TABS.TRASH && <button className="btn btn-secondary" onClick={() => doReply(m)}>Reply</button>}
      {tab === TABS.INBOX && m.status !== 'read' && <button className="btn btn-secondary" onClick={() => markRead(m._id)}>Mark as read</button>}
      {tab !== TABS.TRASH && <button className="btn btn-danger" onClick={() => openDelete(m._id)}>Delete</button>}
      {tab === TABS.TRASH && <button className="btn btn-primary" onClick={() => openRestore(m._id)}>Restore</button>}
      {tab === TABS.TRASH && <button className="btn btn-danger" onClick={() => openPurge(m._id)}>Purge</button>}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
        <button className="btn btn-primary" onClick={() => { setReplyTo(null); setComposeOpen(true); }}>Compose</button>
      </div>

      <div className="flex items-center gap-2">
        <button className={`btn ${tab===TABS.INBOX?'btn-primary':'btn-secondary'}`} onClick={() => setTab(TABS.INBOX)}>Inbox</button>
        <button className={`btn ${tab===TABS.SENT?'btn-primary':'btn-secondary'}`} onClick={() => setTab(TABS.SENT)}>Sent</button>
        <button className={`btn ${tab===TABS.TRASH?'btn-primary':'btn-secondary'}`} onClick={() => setTab(TABS.TRASH)}>Trash</button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>From</th>
                    <th>To</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map(m => (
                    <tr key={m._id} className={`cursor-pointer ${selected?._id===m._id?'bg-primary-50 dark:bg-primary-900':''}`} onClick={() => setSelected(m)}>
                      <td>{m.senderName}{m.senderRole ? ` (${m.senderRole})` : ''}</td>
                      <td>{m.recipientName}{m.recipientRole ? ` (${m.recipientRole})` : ''}</td>
                      <td>
                        <span className={`inline-block px-2 py-0.5 mr-2 rounded text-xs ${m._direction==='sent'?'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200':'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                          {m._direction==='sent' ? 'Sent' : 'Inbox'}
                        </span>
                        {m.subject || '(No subject)'}
                      </td>
                      <td>{new Date(m.createdAt).toLocaleString()}</td>
                      <td>{m.status}</td>
                      <td><Actions m={m} /></td>
                    </tr>
                  ))}
                  {messages.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-gray-500 dark:text-gray-400">No messages</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card p-4">
            {selected ? (
              <MessageViewer
                message={selected}
                onClose={() => setSelected(null)}
                onReply={(m) => { setReplyTo(m); setComposeOpen(true); }}
                onMarkRead={markRead}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">Select a message to preview</div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title={confirm.type==='delete' ? 'Move to trash?' : confirm.type==='restore' ? 'Restore message?' : 'Permanently delete?'}
        message={confirm.type==='delete' ? 'This will move the message to your recycle bin.' : confirm.type==='restore' ? 'This will restore the message to your mailbox.' : 'This cannot be undone.'}
        confirmText={confirm.type==='delete' ? 'Yes, move' : confirm.type==='restore' ? 'Yes, restore' : 'Delete permanently'}
        cancelText="Cancel"
        onConfirm={doConfirm}
        onCancel={() => setConfirm({ open: false, id: null, type: 'delete' })}
        loading={working}
      />

      <ComposeModal
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSent={load}
        defaultRecipientId={replyTo?.sender || replyTo?.senderId}
        replyToMessage={replyTo}
      />
    </div>
  );
};

export default Messages;
