import React, { useState } from 'react';
import { 
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
  AlertCircle
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';

const mockFiles = [
  { id: 1, name: 'q2_financials.xlsx.enc', size: '12.4 MB', type: 'XLSX', status: 'Healthy', replication: 3, lastModified: '2h ago', security: 'Maximum' },
  { id: 2, name: 'production_manifest.json', size: '45 KB', type: 'JSON', status: 'Healthy', replication: 5, lastModified: '5h ago', security: 'Maximum' },
  { id: 3, name: 'node_private_key_backup.vault', size: '2 KB', type: 'VAULT', status: 'Degraded', replication: 2, lastModified: '1d ago', security: 'Maximum' },
  { id: 4, name: 'infrastructure_diagram_v4.pdf.enc', size: '4.2 MB', type: 'PDF', status: 'Healthy', replication: 3, lastModified: '2d ago', security: 'Standard' },
];

const Files = () => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Secure Vault</h1>
          <p className="text-text-secondary mt-1">Manage and monitor your zero-knowledge encrypted assets.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>Filter</Button>
          <Button variant="primary" size="sm" leftIcon={<Lock className="w-4 h-4" />}>New Secret</Button>
        </div>
      </div>

      {/* Filters & Search */}
      <Card className="p-2">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <Input 
              placeholder="Search by filename, hash, or metadata..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              className="bg-transparent border-none focus:ring-0"
            />
          </div>
          <div className="h-6 w-[1px] bg-border hidden md:block" />
          <div className="flex items-center space-x-2 px-2">
            <span className="text-xs text-text-secondary uppercase font-bold tracking-widest">Sort:</span>
            <select className="bg-transparent text-sm text-text-primary font-medium focus:outline-none cursor-pointer">
              <option>Newest First</option>
              <option>Size</option>
              <option>Security Tier</option>
            </select>
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
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Security</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Replication</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest">Modified</th>
                <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockFiles.map((file) => (
                <tr key={file.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-surface-elevated text-primary-accent border border-border group-hover:border-primary-accent/30 transition-colors">
                        <File className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">{file.name}</p>
                        <p className="text-[10px] text-text-secondary uppercase">{file.size} · {file.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1.5">
                      <Shield className="w-3.5 h-3.5 text-security" />
                      <span className="text-xs font-medium text-text-primary">{file.security}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={file.status === 'Healthy' ? 'success' : 'warning'}>
                      {file.status === 'Healthy' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <AlertCircle className="w-3 h-3 mr-1" />}
                      {file.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-3 rounded-sm ${i < file.replication ? 'bg-primary-accent' : 'bg-surface-elevated'}`} 
                          title={`Node ${i+1}: ${i < file.replication ? 'Active' : 'Offline'}`}
                        />
                      ))}
                      <span className="text-[10px] text-text-secondary ml-2 font-bold">{file.replication}/5 Nodes</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-text-secondary">{file.lastModified}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-text-secondary hover:text-primary-accent transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-text-secondary hover:text-status-danger transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-text-secondary hover:text-text-primary transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Shard Mapping Visualization (Experimental) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-widest mb-4 flex items-center">
              <Globe className="w-4 h-4 mr-2 text-primary-accent" />
              Live Shard Distribution
            </h3>
            <div className="flex items-center justify-between h-40 relative">
               {/* Visual representation of a file being split */}
               <div className="w-12 h-16 bg-surface-elevated border border-border rounded flex items-center justify-center relative z-10">
                  <File className="w-6 h-6 text-text-secondary" />
               </div>
               
               <div className="flex-1 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="w-32 h-32 border-2 border-dashed border-border rounded-full flex items-center justify-center"
                  >
                    <div className="w-4 h-4 bg-primary-accent rounded-full animate-ping" />
                  </motion.div>
               </div>

               <div className="flex flex-col space-y-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center space-x-2">
                       <div className="w-6 h-6 bg-surface-secondary border border-security rounded flex items-center justify-center text-[10px] text-security font-bold">
                        N{i}
                       </div>
                       <div className="w-16 h-1.5 bg-surface-elevated rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "70%" }}
                            transition={{ duration: 1, delay: i * 0.2 }}
                            className="h-full bg-security" 
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            <p className="text-[10px] text-text-secondary mt-4 text-center uppercase tracking-tighter">
              Real-time monitoring of shard replication across Tokyo, Mumbai, and Frankfurt clusters.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-primary-accent/5 border-primary-accent/20">
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-primary-accent/10 border border-primary-accent/20">
                <Shield className="w-6 h-6 text-primary-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text-primary">Zero-Knowledge Guard</h3>
                <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                  Every file in this vault is automatically fragmented into 12 distinct shards. 
                  Each shard is encrypted using a unique sub-key derived from your master engineering key.
                </p>
                <Button variant="outline" size="sm" className="mt-4 border-primary-accent/30 text-primary-accent">
                  Audit Encryption Logs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Files;
