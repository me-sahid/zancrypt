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
  Globe
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

import { useDashboardStore } from '../../store/useDashboardStore';
import { fileService } from '../../services/vaultServices';
import { toast } from 'react-hot-toast';

const Files = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { files, setFiles } = useDashboardStore();
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    const fetchFiles = async () => {
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
    };
    fetchFiles();
  }, [setFiles]);

  const filteredFiles = files.filter(f => 
    (f.filename || f.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              placeholder="Search your vault..." 
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
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Size</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredFiles.length > 0 ? filteredFiles.map((file) => (
                <tr key={file.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-surface-elevated text-primary-accent border border-border">
                        <File className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{file.filename || file.name}</p>
                        <p className="text-[10px] text-text-secondary uppercase">Encrypted Asset</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="success">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Protected
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-text-secondary">{file.size}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => toast.success('Download initiated')}
                        className="p-2 text-text-secondary hover:text-primary-accent transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-text-secondary hover:text-status-danger transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center text-text-secondary opacity-50">
                    <Database className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-bold">Your vault is empty</p>
                    <p className="text-xs">Uploaded files will appear here.</p>
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
