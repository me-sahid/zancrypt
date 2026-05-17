import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Database,
  File, 
  Search, 
  Filter, 
  MoreVertical, 
  Shield, 
  Download, 
  Trash2, 
  ExternalLink,
  Lock,
  CheckCircle2,
  AlertCircle,
  Globe,
  Pencil,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

import { useDashboardStore } from '../../store/useDashboardStore';
import { fileService } from '../../services/vaultServices';
import { toast } from 'react-hot-toast';
import FileThumbnail from '../../components/vault/FileThumbnail';

const Files = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { files, setFiles } = useDashboardStore();
  const [isLoading, setIsLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [newName, setNewName] = useState('');

  const fetchFiles = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fileService.listFiles();
      if (res?.data) setFiles(res.data);
    } catch (error) {
      console.error('Failed to fetch files:', error);
      toast.error('Could not refresh vault data');
    } finally {
      setIsLoading(false);
    }
  }, [setFiles]);

  React.useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDownload = async (file) => {
    setProcessingId(file.id);
    const toastId = toast.loading(`Preparing ${file.encrypted_filename}...`);
    try {
      const res = await fileService.downloadFile(file.id);
      if (res?.data && Array.isArray(res.data)) {
        // Reassemble hex shards
        const hexData = res.data.map(s => s.data).join('');
        const bytes = new Uint8Array(hexData.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const blob = new Blob([bytes], { type: 'application/octet-stream' });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.encrypted_filename || 'downloaded_file';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast.success('Download complete', { id: toastId });
      } else {
        throw new Error('Invalid file data received');
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download file', { id: toastId });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file? This action is permanent.')) return;
    
    const toastId = toast.loading('Deleting file...');
    try {
      await fileService.deleteFile(fileId);
      setFiles(files.filter(f => f.id !== fileId));
      toast.success('File deleted successfully', { id: toastId });
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete file', { id: toastId });
    }
  };

  const startRename = (file) => {
    setEditingFile(file);
    setNewName(file.encrypted_filename);
  };

  const handleRename = async () => {
    if (!newName || newName === editingFile.encrypted_filename) {
      setEditingFile(null);
      return;
    }

    const toastId = toast.loading('Renaming file...');
    try {
      await fileService.updateFile(editingFile.id, newName);
      setFiles(files.map(f => f.id === editingFile.id ? { ...f, encrypted_filename: newName } : f));
      toast.success('File renamed', { id: toastId });
      setEditingFile(null);
    } catch (error) {
      console.error('Rename failed:', error);
      toast.error('Failed to rename file', { id: toastId });
    }
  };

  const filteredFiles = files.filter(f => 
    (f.encrypted_filename || f.filename || f.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (file) => {
    const filename = file.encrypted_filename || file.filename || file.name;
    const ext = filename?.split('.').pop()?.toLowerCase();
    
    return (
      <div className="w-10 h-10 flex items-center justify-center bg-surface-elevated rounded-lg border border-border overflow-hidden">
        <FileThumbnail file={file} className="w-6 h-6" />
      </div>
    );
  };

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">My Secure Vault</h1>
          <p className="text-text-secondary mt-1">Access and manage your encrypted data.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/uploads">
            <Button variant="primary" size="sm" leftIcon={<Lock className="w-4 h-4" />}>Add New File</Button>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-2">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <Input 
              placeholder="Search by file name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="bg-transparent border-none focus:ring-0"
            />
          </div>
        </div>
      </Card>

      {/* File List Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-elevated/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">File Asset</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Upload Date</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Size</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFiles.length > 0 ? filteredFiles.map((file) => (
                <tr key={file.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(file)}
                      <div className="flex-1 min-w-0">
                        {editingFile?.id === file.id ? (
                          <div className="flex items-center space-x-2">
                            <input 
                              type="text" 
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                              className="bg-surface-elevated border border-primary-accent rounded px-2 py-1 text-sm text-text-primary w-full max-w-[200px] focus:outline-none"
                              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                              autoFocus
                            />
                            <button onClick={handleRename} className="text-status-success p-1"><CheckCircle2 className="w-4 h-4" /></button>
                            <button onClick={() => setEditingFile(null)} className="text-text-secondary p-1"><AlertCircle className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm font-semibold text-text-primary truncate max-w-[300px]" title={file.encrypted_filename}>
                              {file.encrypted_filename || file.filename || file.name}
                            </p>
                            <p className="text-[10px] text-text-secondary uppercase tracking-tighter">SHA256 Verified</p>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="success">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Encrypted
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-text-primary font-medium">{formatDate(file.upload_time)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-text-secondary">{formatSize(file.file_size)}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleDownload(file)}
                        disabled={processingId === file.id}
                        className="p-2 text-text-secondary hover:text-primary-accent transition-colors bg-surface-elevated/50 rounded-md disabled:opacity-50"
                        title="Download"
                      >
                        {processingId === file.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      </button>
                      <button 
                        onClick={() => startRename(file)}
                        className="p-2 text-text-secondary hover:text-security transition-colors bg-surface-elevated/50 rounded-md"
                        title="Rename"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(file.id)}
                        className="p-2 text-text-secondary hover:text-status-danger transition-colors bg-surface-elevated/50 rounded-md"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-text-secondary opacity-50">
                    <Database className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary-accent/20" />
                    <p className="font-bold text-lg">Your vault is empty</p>
                    <p className="text-sm">Secure your files by uploading them today.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>


  );
};

export default Files;
