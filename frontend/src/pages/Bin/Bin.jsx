import React, { useState, useEffect } from 'react';
import { 
  Trash2, 
  RotateCcw, 
  AlertOctagon, 
  Database,
  Search, 
  Clock, 
  ShieldAlert
} from 'lucide-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { fileService } from '../../services/vaultServices';
import { toast } from 'react-hot-toast';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

const CountdownTimer = ({ deletedAt }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const deleteTime = new Date(deletedAt);
      const expireTime = new Date(deleteTime.getTime() + 30 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const diffMs = expireTime - now;

      if (diffMs <= 0) {
        setTimeLeft('Expired (Pending Purge)');
        return;
      }

      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeLeft(`${minutes}m remaining`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [deletedAt]);

  return (
    <span className="flex items-center text-xs font-mono font-bold text-status-warning tracking-wide">
      <Clock className="w-3.5 h-3.5 mr-1.5 animate-pulse" />
      {timeLeft}
    </span>
  );
};

const Bin = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { binFiles, setBinFiles } = useDashboardStore();
  const [isLoading, setIsLoading] = useState(false);

  const fetchBinFiles = async () => {
    setIsLoading(true);
    try {
      const res = await fileService.listBinFiles();
      if (res?.data) setBinFiles(res.data);
    } catch (error) {
      console.error('Failed to fetch bin files:', error);
      toast.error('Could not refresh Recycle Bin data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBinFiles();
  }, []);

  const handleRecover = async (id) => {
    try {
      await fileService.recoverFile(id);
      toast.success('File recovered successfully!');
      fetchBinFiles();
    } catch (error) {
      console.error('Recovery failed:', error);
      toast.error('Failed to recover file');
    }
  };

  const handlePermanentDelete = async (id) => {
    if (!window.confirm('WARNING: Are you absolutely sure you want to permanently shred this file? This action is completely irreversible and all copies will be deleted across the distributed nodes.')) {
      return;
    }
    
    toast.loading('Shredding shards permanently...', { id: 'shred-toast' });
    try {
      await fileService.deleteFilePermanently(id);
      toast.success('File permanently shredded from all systems.', { id: 'shred-toast' });
      fetchBinFiles();
    } catch (error) {
      console.error('Permanent delete failed:', error);
      toast.error('Failed to shred file permanently', { id: 'shred-toast' });
    }
  };

  const filteredFiles = binFiles.filter(f => 
    (f.encrypted_filename || f.filename || f.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Recycle Bin</h1>
          <p className="text-text-secondary mt-1">Deleted items will stay here for 30 days before permanent deletion.</p>
        </div>
      </div>

      {/* Warning Notice Banner */}
      <div className="flex items-center space-x-3 p-4 bg-status-warning/10 border border-status-warning/20 rounded-2xl">
        <div className="p-2 bg-status-warning/20 rounded-xl text-status-warning text-center flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-black text-status-warning uppercase tracking-widest leading-none">Security Notice</h4>
          <p className="text-[11px] text-text-secondary mt-1">Shards remain securely partitioned and offline in a sandbox storage bin. Permanent deletion completely overwrites all shard registries across active distributed storage nodes.</p>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-2">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <Input 
              placeholder="Search deleted files..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="bg-transparent border-none focus:ring-0"
            />
          </div>
        </div>
      </Card>

      {/* Recycle Bin Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-elevated/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Storage Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Size</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Time Remaining</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFiles.length > 0 ? filteredFiles.map((file) => (
                <tr key={file.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-surface-elevated text-text-secondary border border-border">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{file.encrypted_filename || file.filename || file.name}</p>
                        <p className="text-xs text-text-secondary uppercase">Sandbox Isolation</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="warning">
                      <AlertOctagon className="w-3 h-3 mr-1" />
                      Soft-Deleted
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-text-secondary">{formatSize(file.file_size || file.size)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <CountdownTimer deletedAt={file.deleted_at} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleRecover(file.id)}
                        className="p-2 text-text-secondary hover:text-status-success transition-colors animate-pulse"
                        title="Recover file"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handlePermanentDelete(file.id)}
                        className="p-2 text-text-secondary hover:text-status-danger transition-colors"
                        title="Permanently shred file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-text-secondary opacity-50">
                    <Database className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-bold">Recycle Bin is empty</p>
                    <p className="text-xs">Soft-deleted items will appear here.</p>
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

export default Bin;
