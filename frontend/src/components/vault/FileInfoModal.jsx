import React from 'react';
import { motion } from 'framer-motion';
import { Info, Hash, Clock, HardDrive, FileType, Key, Shield, Activity } from 'lucide-react';
import Button from '../ui/Button';

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const FileInfoModal = ({ file, decryptedName, onClose }) => {
  if (!file) return null;

  const fileName = decryptedName || file.encrypted_filename || file.filename || file.name || 'Unknown File';
  let extension = fileName.includes('.') ? fileName.split('.').pop().toUpperCase() : 'FILE';
  let resolution = null;
  let originalCreationDate = null;
  let mimeType = null;

  if (file.encrypted_metadata) {
    try {
      const meta = JSON.parse(file.encrypted_metadata);
      if (meta.format) extension = meta.format.toUpperCase();
      if (meta.resolution) resolution = meta.resolution;
      if (meta.original_creation_date) originalCreationDate = new Date(meta.original_creation_date).toLocaleString();
      if (meta.type) mimeType = meta.type;
    } catch (e) {
      // Ignore parse error
    }
  }
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div onClick={onClose} className="absolute inset-0 bg-void/90 backdrop-blur-md cursor-pointer" />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-surface border border-border w-full max-w-lg flex flex-col shadow-2xl relative z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center space-x-3 p-5 border-b border-border bg-void">
          <Info className="w-5 h-5 text-accent" />
          <h3 className="font-mono text-sm text-text-primary uppercase tracking-widest">Asset Information</h3>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Header Info */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 shrink-0 bg-slate-900 border border-border flex items-center justify-center rounded text-xs font-bold text-accent font-mono">
              {extension}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-mono text-sm text-text-primary mb-1 break-all">{fileName}</h4>
              <p className="font-mono text-xs text-text-muted flex items-center">
                <Shield className="w-3 h-3 mr-1.5 text-success" /> End-to-End Encrypted
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Size */}
            <div className="bg-void border border-border p-3 space-y-1">
              <span className="flex items-center text-xs font-mono text-text-muted uppercase tracking-widest">
                <HardDrive className="w-3 h-3 mr-2 text-accent" /> Size
              </span>
              <p className="font-mono text-sm text-text-primary">{formatBytes(file.file_size)}</p>
            </div>

            {/* Type */}
            <div className="bg-void border border-border p-3 space-y-1">
              <span className="flex items-center text-xs font-mono text-text-muted uppercase tracking-widest">
                <FileType className="w-3 h-3 mr-2 text-accent" /> Format
              </span>
              <p className="font-mono text-sm text-text-primary">{extension} {mimeType && <span className="text-xs text-text-muted ml-2">({mimeType})</span>}</p>
            </div>

            {/* Resolution */}
            {resolution && (
              <div className="bg-void border border-border p-3 space-y-1 col-span-1 md:col-span-2">
                <span className="flex items-center text-xs font-mono text-text-muted uppercase tracking-widest">
                  <Activity className="w-3 h-3 mr-2 text-accent" /> Resolution
                </span>
                <p className="font-mono text-sm text-text-primary">{resolution}</p>
              </div>
            )}

            {/* Upload Time */}
            <div className="bg-void border border-border p-3 space-y-1 col-span-1 md:col-span-2">
              <span className="flex items-center text-xs font-mono text-text-muted uppercase tracking-widest">
                <Clock className="w-3 h-3 mr-2 text-accent" /> Uploaded Time
              </span>
              <p className="font-mono text-sm text-text-primary">
                {file.upload_time ? new Date(file.upload_time).toLocaleString() : 'Unknown'}
              </p>
            </div>

            {/* Original Creation Time */}
            {originalCreationDate && (
              <div className="bg-void border border-border p-3 space-y-1 col-span-1 md:col-span-2">
                <span className="flex items-center text-xs font-mono text-text-muted uppercase tracking-widest">
                  <Clock className="w-3 h-3 mr-2 text-success" /> Original File Date
                </span>
                <p className="font-mono text-sm text-text-primary">
                  {originalCreationDate}
                </p>
              </div>
            )}

            {/* Hash */}
            <div className="bg-void border border-border p-3 space-y-1 col-span-1 md:col-span-2">
              <span className="flex items-center text-xs font-mono text-text-muted uppercase tracking-widest">
                <Hash className="w-3 h-3 mr-2 text-accent" /> Integrity Hash (SHA-256)
              </span>
              <p className="font-mono text-xs text-text-secondary break-all bg-surface-raised p-2 rounded mt-1 select-all">
                {file.integrity_hash || 'N/A'}
              </p>
            </div>

            {/* Internal ID */}
            <div className="bg-void border border-border p-3 space-y-1 col-span-1 md:col-span-2">
              <span className="flex items-center text-xs font-mono text-text-muted uppercase tracking-widest">
                <Key className="w-3 h-3 mr-2 text-accent" /> System UUID
              </span>
              <p className="font-mono text-xs text-text-secondary">
                {file.id || file.file_id || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end bg-void/50">
          <Button variant="primary" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default FileInfoModal;
