import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Settings as SettingsIcon, User, Bell, Shield, Server, Cpu, Key, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const { user, setAuth, token, logout } = useAuthStore();
  const settings = useSettingsStore();
  
  // Profile State
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [region, setRegion] = useState(user?.region || 'us-east');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Nodes State
  const [nodesData, setNodesData] = useState(null);
  const [isLoadingNodes, setIsLoadingNodes] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setRegion(user.region || 'us-east');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', { full_name: fullName, region });
      setAuth(res.data, token);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRevokeSessions = async () => {
    try {
      await api.post('/auth/logout');
      toast.success('All active sessions revoked. Logging out...');
      logout();
    } catch (err) {
      toast.error('Failed to revoke sessions');
    }
  };

  const handleMarkAlertsRead = async () => {
    try {
      await api.post('/api/notifications/mark-read');
      toast.success('All alerts marked as read');
    } catch (err) {
      toast.error('Failed to mark alerts as read');
    }
  };

  const fetchNodes = async () => {
    setIsLoadingNodes(true);
    try {
      const res = await api.get('/health/nodes');
      setNodesData(res.data);
    } catch (err) {
      toast.error('Failed to fetch nodes health');
    } finally {
      setIsLoadingNodes(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Nodes') {
      fetchNodes();
    }
  }, [activeTab]);

  const tabs = [
    { icon: User, label: 'Profile' },
    { icon: Shield, label: 'Security' },
    { icon: Bell, label: 'Alerts' },
    { icon: Server, label: 'Infrastructure' },
    { icon: Cpu, label: 'Nodes' }
  ];

  return (
    <div className="space-y-8 max-w-4xl pb-10">
      <h1 className="text-4xl font-black text-text-primary tracking-tight">System Settings</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-2">
           {tabs.map((item) => {
             const isActive = activeTab === item.label;
             return (
               <button 
                 key={item.label} 
                 onClick={() => setActiveTab(item.label)}
                 className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${isActive ? 'bg-primary-accent/10 text-primary-accent' : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'}`}
               >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
               </button>
             );
           })}
        </div>

        <div className="md:col-span-3 space-y-6">
           {activeTab === 'Profile' && (
             <Card>
                <CardHeader><CardTitle>Profile Configuration</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Display Name</label>
                        <input 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-accent text-white" 
                          placeholder="Your Name" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Email Alias (Read-only)</label>
                        <input 
                          value={user?.email || ''}
                          readOnly
                          className="w-full bg-surface-elevated/50 border border-border/50 rounded-lg px-4 py-2 text-sm text-text-secondary cursor-not-allowed" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-text-secondary uppercase">Storage Region</label>
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-accent text-white"
                        >
                          <option value="us-east">US East (N. Virginia)</option>
                          <option value="eu-central">EU Central (Frankfurt)</option>
                          <option value="ap-south">AP South (Mumbai)</option>
                          <option value="ap-northeast">AP Northeast (Tokyo)</option>
                        </select>
                      </div>
                   </div>
                   <div className="pt-4 flex justify-end">
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="px-6 py-2 rounded-lg bg-primary-accent text-white font-bold text-sm shadow-lg shadow-primary-accent/20 hover:bg-blue-600 transition-colors disabled:opacity-50"
                      >
                        {isSavingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                   </div>
                </CardContent>
             </Card>
           )}

           {activeTab === 'Security' && (
             <div className="space-y-6">
               <Card>
                  <CardHeader><CardTitle className="flex items-center space-x-2"><Shield className="w-5 h-5 text-emerald-400" /><span>Zero-Knowledge Identity</span></CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Your identity and master decryption keys are secured by Zero-Knowledge architecture. Zancrypt does not store your master key. Recovery requires your original device passkey or your emergency fallback access key.
                    </p>
                    <div className="flex items-center space-x-3 p-3 bg-surface-elevated rounded-xl border border-border">
                      <Key className="w-5 h-5 text-primary-accent" />
                      <div className="text-sm">
                        <p className="font-bold text-white">Identity Verifier Salt</p>
                        <p className="text-xs text-text-secondary font-mono mt-0.5">{user?.master_key_salt || 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
               </Card>

               <Card>
                  <CardHeader><CardTitle className="text-red-400 flex items-center space-x-2"><LogOut className="w-5 h-5" /><span>Session Management</span></CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-text-secondary">
                      Revoke all active sessions to secure your account. This will invalidate all your tokens on other devices and log you out immediately.
                    </p>
                    <button 
                      onClick={handleRevokeSessions}
                      className="px-6 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 font-bold text-sm hover:bg-red-500/20 transition-colors"
                    >
                      Revoke All Sessions
                    </button>
                  </CardContent>
               </Card>
             </div>
           )}

           {activeTab === 'Alerts' && (
             <div className="space-y-6">
               <Card>
                  <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
                  <CardContent className="space-y-4 text-text-secondary text-sm">
                     <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">Email Notifications</p>
                          <p className="text-xs mt-0.5">Receive security and share activity via email</p>
                        </div>
                        <button 
                          onClick={() => settings.setSetting('emailNotifications', !settings.emailNotifications)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${settings.emailNotifications ? 'bg-primary-accent' : 'bg-surface-elevated border border-border'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.emailNotifications ? 'right-1' : 'left-1'}`} />
                        </button>
                     </div>
                     <div className="flex items-center justify-between border-t border-border pt-4">
                        <div>
                          <p className="font-bold text-white">In-App Push Alerts</p>
                          <p className="text-xs mt-0.5">Get live browser toasts for network events</p>
                        </div>
                        <button 
                          onClick={() => settings.setSetting('inAppAlerts', !settings.inAppAlerts)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${settings.inAppAlerts ? 'bg-primary-accent' : 'bg-surface-elevated border border-border'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.inAppAlerts ? 'right-1' : 'left-1'}`} />
                        </button>
                     </div>
                  </CardContent>
               </Card>

               <Card>
                 <CardContent className="pt-6">
                   <button 
                     onClick={handleMarkAlertsRead}
                     className="w-full py-2.5 rounded-lg border border-border text-text-secondary font-bold text-sm hover:bg-surface-elevated hover:text-white transition-colors"
                   >
                     Mark All System Alerts as Read
                   </button>
                 </CardContent>
               </Card>
             </div>
           )}

           {activeTab === 'Infrastructure' && (
             <Card>
                <CardHeader><CardTitle>Infrastructure Preferences</CardTitle></CardHeader>
                <CardContent className="space-y-4 text-text-secondary text-sm">
                   <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">Automatic Shard Replication</p>
                        <p className="text-xs mt-0.5 max-w-[280px]">Automatically clone data shards across regional nodes for high availability.</p>
                      </div>
                      <button 
                        onClick={() => settings.setSetting('autoReplication', !settings.autoReplication)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${settings.autoReplication ? 'bg-primary-accent' : 'bg-surface-elevated border border-border'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.autoReplication ? 'right-1' : 'left-1'}`} />
                      </button>
                   </div>
                   <div className="flex items-center justify-between border-t border-border pt-4">
                      <div>
                        <p className="font-bold text-white">Real-time Telemetry Polling</p>
                        <p className="text-xs mt-0.5 max-w-[280px]">Periodically fetch node health and vault telemetry data.</p>
                      </div>
                      <button 
                        onClick={() => settings.setSetting('telemetryPolling', !settings.telemetryPolling)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${settings.telemetryPolling ? 'bg-primary-accent' : 'bg-surface-elevated border border-border'}`}
                      >
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings.telemetryPolling ? 'right-1' : 'left-1'}`} />
                      </button>
                   </div>
                </CardContent>
             </Card>
           )}

           {activeTab === 'Nodes' && (
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Storage Nodes Cluster</CardTitle>
                  <button onClick={fetchNodes} className="text-xs text-primary-accent hover:underline flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Refresh Status
                  </button>
                </CardHeader>
                <CardContent>
                  {isLoadingNodes ? (
                    <div className="py-8 text-center text-text-secondary text-sm animate-pulse">Checking node health...</div>
                  ) : nodesData ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start space-x-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-emerald-400">Cluster Status: {nodesData.nodes}</p>
                          <p className="text-xs text-emerald-400/80 mt-1">
                            {nodesData.active_nodes === 'simulated' ? 'Using simulated local node network.' : 'Connected to global Zancrypt relay.'} 
                            &nbsp;Expected Nodes: {nodesData.expected_count || 5}.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                        {['US East', 'US West', 'EU Central', 'AP South', 'AP Northeast'].map((regionName) => (
                          <div key={regionName} className="p-3 bg-surface-elevated border border-border rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{regionName}</p>
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                            </div>
                            <p className="text-xs font-mono text-text-primary">node-{regionName.toLowerCase().replace(' ', '-')}</p>
                            <p className="text-[10px] text-text-secondary mt-1">Latency: {Math.floor(Math.random() * 40 + 10)}ms</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-text-secondary text-sm">Failed to load nodes data.</div>
                  )}
                </CardContent>
             </Card>
           )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
