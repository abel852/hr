import React from 'react';

const isImage = (att) => (att?.type === 'image') || (att?.mimetype?.startsWith?.('image/'));
const isPdf = (att) => (att?.name?.toLowerCase?.().endsWith('.pdf')) || (att?.mimetype === 'application/pdf');

const normalizePath = (p) => (p || '').replace(/^\/+/, '');
const toAbsolute = (p) => {
  if (!p) return '';
  if (p.startsWith('http://') || p.startsWith('https://')) return p;
  const normalized = normalizePath(p);
  return `${window.location.origin}/${normalized}`;
};

const AttachmentItem = ({ att }) => {
  const href = toAbsolute(att.filePath);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-md p-3">
      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{att.name}</div>
      {isImage(att) ? (
        <div className="mt-2">
          <img src={href} alt={att.name} className="max-h-64 rounded-md" />
        </div>
      ) : isPdf(att) ? (
        <div className="mt-2">
          <object data={`${href}#toolbar=1&navpanes=1&scrollbar=1`} type="application/pdf" className="w-full h-64 rounded-md">
            <iframe title={att.name} src={`${href}#toolbar=1`} className="w-full h-64 rounded-md" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">PDF preview not available. <a className="text-primary-600 dark:text-primary-300 underline" href={href} target="_blank" rel="noreferrer">Open PDF</a></p>
          </object>
        </div>
      ) : (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Unsupported preview. Use download.</p>
      )}
      <div className="mt-3">
        <a href={href} download className="btn btn-secondary">Download</a>
      </div>
    </div>
  );
};

const MessageViewer = ({ message, onClose, onReply, onMarkRead }) => {
  if (!message) return null;
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-gray-600 dark:text-gray-400">From: <span className="font-medium text-gray-900 dark:text-gray-100">{message.senderName || message.sender}{message.senderRole ? ` (${message.senderRole})` : ''}</span></div>
            <div className="text-sm text-gray-600 dark:text-gray-400">To: <span className="font-medium text-gray-900 dark:text-gray-100">{message.recipientName || message.recipient}{message.recipientRole ? ` (${message.recipientRole})` : ''}</span></div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Date: <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(message.createdAt).toLocaleString()}</span></div>
          </div>
          {onClose && (
            <button aria-label="Close" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100" onClick={onClose}>✕</button>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{message.subject || '(No subject)'}</div>
          <div className="flex items-center gap-2">
            {onMarkRead && message.status !== 'read' && (
              <button className="btn btn-secondary" onClick={() => onMarkRead(message._id)}>Mark as read</button>
            )}
            {onReply && (
              <button className="btn btn-primary" onClick={() => onReply(message)}>Reply</button>
            )}
          </div>
        </div>

        <div className="mt-2 whitespace-pre-wrap text-gray-800 dark:text-gray-200">{message.body}</div>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100">Attachments</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachments.map((att, i) => (
              <AttachmentItem key={i} att={att} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageViewer;
