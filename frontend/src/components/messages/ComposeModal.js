import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

const authConfig = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

const ComposeModal = ({ open, onClose, onSent, defaultRecipientId, replyToMessage }) => {
  const [recipients, setRecipients] = useState([]);
  const [recipientsLoading, setRecipientsLoading] = useState(false);
  const [recipientsError, setRecipientsError] = useState('');

  const [search, setSearch] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);

  const [selectedRecipients, setSelectedRecipients] = useState([]);

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const isReply = !!replyToMessage;

  useEffect(() => {
    if (isReply) {
      // Build subject line: first reply => "Re: ", reply to a reply => "RE-RE :"
      const origSubj = (replyToMessage?.subject || '').trim();
      const hasRe = /^\s*re\s*[:\-]/i.test(origSubj);
      const base = origSubj || (replyToMessage?.senderName || replyToMessage?.sender || '');
      const replySubject = hasRe ? `RE-RE : ${base.replace(/^\s*re\s*[:\-]\s*/i, '')}` : `Re: ${base}`;
      setSubject(replySubject);

      // Quote original in body
      const quoted = `\n\n----- Original Message -----\nFrom: ${replyToMessage.senderName || replyToMessage.sender}\nSent: ${new Date(replyToMessage.createdAt).toLocaleString()}\nSubject: ${origSubj || '(No subject)'}\n\n${replyToMessage.body || ''}`;
      setBody(quoted);
    } else {
      setSubject('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReply, replyToMessage]);

  useEffect(() => {
    if (!open) return;
    const loadRecipients = async () => {
      setRecipientsLoading(true);
      setRecipientsError('');
      try {
        const res = await axios.get(`/api/messages/recipients${search ? `?search=${encodeURIComponent(search)}` : ''}`, authConfig());
        const list = Array.isArray(res.data) ? res.data : [];
        setRecipients(list);
        if ((isReply || defaultRecipientId) && list.length > 0) {
          const found = list.find(r => r._id === (defaultRecipientId || replyToMessage?.sender || replyToMessage?.senderId));
          if (found) setSelectedRecipients([found]);
        }
      } catch (e) {
        setRecipients([]);
        setRecipientsError(e.response?.data?.message || 'Failed to load recipients. Make sure you are logged in.');
      } finally {
        setRecipientsLoading(false);
      }
    };
    loadRecipients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, search]);

  useEffect(() => {
    if (defaultRecipientId && recipients.length > 0) {
      const found = recipients.find(r => r._id === defaultRecipientId);
      if (found) setSelectedRecipients([found]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultRecipientId, recipients]);

  const filteredRecipients = useMemo(() => recipients, [recipients]);

  if (!open) return null;

  const onFileChange = (e) => {
    setError('');
    const list = Array.from(e.target.files || []);
    const invalid = list.find(f => f.size > MAX_FILE_SIZE || !ALLOWED_TYPES.includes(f.type));
    if (invalid) {
      setError('Invalid file selected. Only images/PDF/Excel up to 20MB each.');
      return;
    }
    setFiles(list);
  };

  const toggleRecipient = (r) => {
    if (isReply || defaultRecipientId) return; // lock in reply mode
    setSelectedRecipients(prev => {
      const exists = prev.find(p => p._id === r._id);
      if (exists) return prev.filter(p => p._id !== r._id);
      return [...prev, r];
    });
  };

  const removeRecipient = (id) => {
    if (isReply || defaultRecipientId) return;
    setSelectedRecipients(prev => prev.filter(p => p._id !== id));
  };

  const handleSend = async () => {
    if (selectedRecipients.length === 0) { setError('Please select at least one recipient'); return; }
    if (!body && files.length === 0) { setError('Enter message or attach a file'); return; }
    setSending(true);
    setError('');
    try {
      const ids = selectedRecipients.map(r => r._id);
      if (files.length > 0) {
        const form = new FormData();
        if (ids.length === 1) {
          form.append('recipient', ids[0]);
        } else {
          ids.forEach(id => form.append('recipients', id));
        }
        form.append('subject', subject);
        form.append('body', body);
        if (replyToMessage?._id) form.append('replyTo', replyToMessage._id);
        files.forEach(f => form.append('attachments', f));
        await axios.post('/api/messages/attachments', form, {
          ...authConfig(),
          headers: { ...(authConfig().headers || {}), 'Content-Type': 'multipart/form-data' }
        });
      } else {
        if (ids.length === 1) {
          await axios.post('/api/messages', {
            recipient: ids[0],
            subject,
            body,
            replyTo: replyToMessage?._id || undefined
          }, authConfig());
        } else {
          await axios.post('/api/messages', {
            recipients: ids,
            subject,
            body,
            replyTo: replyToMessage?._id || undefined
          }, authConfig());
        }
      }
      onSent?.();
      onClose();
      setSubject('');
      setBody('');
      setFiles([]);
      if (!isReply && !defaultRecipientId) setSelectedRecipients([]);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={sending ? undefined : onClose} />
      <div className="relative w-full max-w-2xl mx-4 card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{isReply ? 'Reply' : 'Compose Message'}</h3>
          <button className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100" onClick={onClose}>✕</button>
        </div>

        <div>
          <label className="label">To</label>
          <div className="min-h-[44px] w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2 flex flex-wrap gap-2 bg-white dark:bg-gray-700">
            {selectedRecipients.map(r => (
              <span key={r._id} className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200">
                {r.name} ({r.role})
                {(!isReply && !defaultRecipientId) && (
                  <button className="ml-2 text-xs text-primary-700 dark:text-primary-300" onClick={() => removeRecipient(r._id)}>✕</button>
                )}
              </span>
            ))}
            {(!isReply && !defaultRecipientId) && (
              <button type="button" className="ml-auto btn btn-secondary" onClick={() => setPickerOpen(p => !p)}>
                {pickerOpen ? 'Close' : 'Add more users'}
              </button>
            )}
          </div>

          {pickerOpen && !isReply && !defaultRecipientId && (
            <div className="mt-2 border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-3">
              <input
                className="input"
                placeholder="Search name, email, or employee code"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <div className="max-h-60 overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
                {recipientsLoading ? (
                  <div className="py-3 text-sm text-gray-500 dark:text-gray-400">Loading recipients...</div>
                ) : filteredRecipients.length === 0 ? (
                  <div className="py-3 text-sm text-gray-500 dark:text-gray-400">No recipients available</div>
                ) : (
                  filteredRecipients.map(r => {
                    const checked = !!selectedRecipients.find(s => s._id === r._id);
                    return (
                      <label key={r._id} className="flex items-center gap-3 py-2 cursor-pointer">
                        <input type="checkbox" className="h-4 w-4" checked={checked} onChange={() => toggleRecipient(r)} />
                        <div className="flex-1">
                          <div className="text-sm text-gray-900 dark:text-gray-100">{r.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{r.email} • {r.employeeCode} • {r.role} • {r.department}</div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
              {recipientsError && (
                <p className="text-xs text-red-600 dark:text-red-400">{recipientsError}</p>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="label">Subject</label>
          <input className="input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" />
        </div>

        <div>
          <label className="label">Message</label>
          <textarea className="input" rows={6} value={body} onChange={e => setBody(e.target.value)} placeholder="Write your message..." />
        </div>

        <div>
          <label className="label">Attachments</label>
          <input type="file" multiple accept="image/*,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={onFileChange} />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Allowed: images, PDF, Excel • Max 20MB per file</p>
          {files.length > 0 && (
            <ul className="mt-2 text-sm list-disc list-inside text-gray-700 dark:text-gray-300">
              {files.map((f, idx) => <li key={idx}>{f.name} ({Math.round(f.size/1024/1024*10)/10} MB)</li>)}
            </ul>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900 p-3 text-sm text-red-700 dark:text-red-300">{error}</div>
        )}

        <div className="flex justify-end space-x-3">
          <button className="btn btn-secondary" onClick={onClose} disabled={sending}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSend} disabled={sending}>{sending ? 'Sending...' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
};

export default ComposeModal;
