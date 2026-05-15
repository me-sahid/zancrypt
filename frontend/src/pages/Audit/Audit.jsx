import React from 'react';
import { 
  History, 
  Search, 
  Download, 
  Filter, 
  Shield, 
  User, 
  Server, 
  File,
  Lock,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const auditEvents = [
  { id: 'EVT-001', event: 'File Shard Upload', user: 'jane@yuuvault.io', node: 'Tokyo-Alpha', time: '2026-05-14 10:45:22', status: 'Success', icon: File },
  { id: 'EVT-002', event: 'MFA Authentication', user: 'jane@yuuvault.io', node: 'Edge Gateway', time: '2026-05-14 10:42:01', status: 'Success', icon: Shield },
  { id: 'EVT-003', event: 'Node Synchronized', user: 'System', node: 'Mumbai-01', time: '2026-05-14 10:30:15', status: 'Success', icon: Server },
  { id: 'EVT-004', event: 'Encryption Key Rotation', user: 'Admin-Root', node: 'Global-Vault', time: '2026-05-14 09:12:44', status: 'Success', icon: Lock },
  { id: 'EVT-005', event: 'Failed Access Attempt', user: 'unknown-ip-45.2', node: 'Edge Gateway', time: '2026-05-14 08:55:12', status: 'Blocked', icon: Shield },
  { id: 'EVT-006', event: 'File Permanent Deletion', user: 'jane@yuuvault.io', node: 'Tokyo-Alpha', time: '2026-05-14 08:30:00', status: 'Success', icon: File },
];

const Audit = () => {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Audit Trail</h1>
          <p className="text-text-secondary mt-1">Immutable record of all administrative and cryptographic operations.</p>
        </div>
        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
          Export CSV
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex-1 max-w-md">
                <Input 
                  placeholder="Filter by event ID, user, or node..." 
                  leftIcon={<Search className="w-4 h-4" />}
                />
             </div>
             <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" leftIcon={<Filter className="w-4 h-4" />}>All Categories</Button>
                <Button variant="ghost" size="sm">Last 24 Hours</Button>
             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-elevated/30 border-b border-border">
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Event ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Activity</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Origin / User</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Node Instance</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-text-secondary uppercase tracking-widest"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {auditEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-mono text-primary-accent bg-primary-accent/10 px-2 py-0.5 rounded">
                        {event.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <event.icon className="w-4 h-4 text-text-secondary" />
                        <span className="text-sm font-semibold text-text-primary">{event.event}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 rounded-full bg-surface-elevated flex items-center justify-center">
                          <User className="w-3 h-3 text-text-secondary" />
                        </div>
                        <span className="text-xs text-text-secondary">{event.user}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-text-secondary">{event.node}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-text-secondary">{event.time}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={event.status === 'Success' ? 'success' : 'danger'}>
                        {event.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 text-text-secondary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-all">
                          <ExternalLink className="w-4 h-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <div className="p-6 border-t border-border flex justify-between items-center">
           <p className="text-xs text-text-secondary">Showing 6 of 12,431 global events.</p>
           <div className="flex space-x-2">
              <Button variant="secondary" size="sm">Previous</Button>
              <Button variant="secondary" size="sm">Next</Button>
           </div>
        </div>
      </Card>
    </div>
  );
};

export default Audit;
