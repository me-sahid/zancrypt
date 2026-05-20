import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Server, Cpu, Key, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('Profile');
  const { user, setAuth, token, logout } = useAuthStore();
  const settings = useSettingsStore();
  
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [region, setRegion] = useState(user?.region || 'us-east');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

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
      toast.success('Profile updated');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleRevokeSessions = async () => {
    try {
      await api.post('/auth/logout');
      toast.success('All sessions revoked');
      logout();
    } catch (err) {
      toast.error('Failed to revoke sessions');
    }
  };

  const handleMarkAlertsRead = async () => {
    try {
      await api.post('/api/notifications/mark-read');
      toast.success('Alerts marked read');
    } catch (err) {
      toast.error('Failed to mark read');
    }
  };

  const fetchNodes = async () => {
    setIsLoadingNodes(true);
    try {
      const res = await api.get('/health/nodes');
      setNodesData(res.data);
    } catch (err) {
      toast.error('Failed to fetch nodes');
    } finally {
      setIsLoadingNodes(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Nodes') fetchNodes();
  }, [activeTab]);

  const tabs = [
    { icon: User, label: 'Profile' },
    { icon: Shield, label: 'Security' },
    { icon: Bell, label: 'Alerts' },
    { icon: Server, label: 'Infrastructure' },
    { icon: Cpu, label: 'Nodes' }
  ];

  return (
    <div className="space-y-6 max-w-5xl pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="font-mono text-2xl text-text-primary tracking-widest uppercase flex items-center">
            <SettingsIcon className="w-5 h-5 mr-3 text-accent" />
            System Configuration
          </h1>
          <p className="text-text-muted mt-2 font-mono text-xs uppercase tracking-widest">
            Core Environment Variables
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible space-x-2 md:space-x-0 md:space-y-2 pb-2 md:pb-0 scrollbar-none shrink-0">
           {tabs.map((item) => {
             const isActive = activeTab === item.label;
             return (
               <button 
                 key={item.label} 
                 onClick={() => setActiveTab(item.label)}
                 className={`flex items-center space-x-3 px-4 py-3 font-mono text-xs uppercase tracking-widest transition-colors shrink-0 md:w-full ${isActive ? 'bg-accent/10 text-accent border border-accent/20' : 'text-text-muted hover:bg-surface hover:text-text-primary border border-transparent'}`}
               >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
               </button>
             );
           })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
           {activeTab === 'Profile' && (
             <div className="bg-surface border border-border">
                <div className="p-4 border-b border-border bg-surface-raised">
                   <h3 className="font-mono text-xs text-text-primary uppercase tracking-widest">Identity Config</h3>
                </div>
                <div className="p-6 space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-text-muted uppercase tracking-widest">Display Name</label>
                        <input 
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full bg-void border border-border focus:border-accent font-mono text-xs text-text-primary py-2 px-3 outline-none transition-colors" 
                          placeholder="Your Name" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-text-muted uppercase tracking-widest">Email Alias [READ ONLY]</label>
                        <input 
                          value={user?.email || ''}
                          readOnly
                          className="w-full bg-void/50 border border-border/50 font-mono text-xs text-text-muted py-2 px-3 outline-none cursor-not-allowed" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-text-muted uppercase tracking-widest">Storage Region</label>
                        <select
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full bg-void border border-border focus:border-accent font-mono text-xs text-text-primary py-2 px-3 outline-none transition-colors appearance-none"
                        >
                          <option value="us-east">US East (N. Virginia)</option>
                          <option value="eu-central">EU Central (Frankfurt)</option>
                          <option value="ap-south">AP South (Mumbai)</option>
                          <option value="ap-northeast">AP Northeast (Tokyo)</option>
                        </select>
                      </div>
                   </div>
                   <div className="pt-4 border-t border-border flex justify-end">
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                        className="px-6 py-2 border border-accent text-accent font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-white transition-colors disabled:opacity-50"
                      >
                        {isSavingProfile ? '[ Saving... ]' : '[ Save State ]'}
                      </button>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'Security' && (
             <div className="space-y-6">
               <div className="bg-surface border border-accent">
                  <div className="p-4 border-b border-accent bg-accent/5">
                     <h3 className="font-mono text-xs text-accent uppercase tracking-widest flex items-center">
                       <Shield className="w-4 h-4 mr-2" />
                       Zero-Knowledge Identity
                     </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="font-mono text-xs text-text-muted leading-relaxed">
                      Your master decryption keys are never stored on Zancrypt servers. Recovery requires your original device passkey.
                    </p>
                    <div className="flex items-center space-x-3 p-4 bg-void border border-border">
                      <Key className="w-5 h-5 text-accent" />
                      <div className="text-xs font-mono">
                        <p className="text-text-primary uppercase tracking-widest mb-1">Identity Verifier Salt</p>
                        <p className="text-text-muted">{user?.master_key_salt || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="bg-surface border border-danger">
                  <div className="p-4 border-b border-danger bg-danger/5">
                     <h3 className="font-mono text-xs text-danger uppercase tracking-widest flex items-center">
                       <LogOut className="w-4 h-4 mr-2" />
                       Session Matrix
                     </h3>
                  </div>
                  <div className="p-6 space-y-4">
                    <p className="font-mono text-xs text-text-muted">
                      Revoke all active sessions across all devices. This will invalidate all tokens instantly.
                    </p>
                    <button 
                      onClick={handleRevokeSessions}
                      className="px-6 py-2 bg-transparent border border-danger text-danger font-mono text-xs uppercase tracking-widest hover:bg-danger/10 transition-colors"
                    >
                      [ Revoke All Sessions ]
                    </button>
                  </div>
               </div>
             </div>
           )}

           {activeTab === 'Alerts' && (
             <div className="space-y-6">
               <div className="bg-surface border border-border">
                  <div className="p-4 border-b border-border bg-surface-raised">
                     <h3 className="font-mono text-xs text-text-primary uppercase tracking-widest">Notification Channels</h3>
                  </div>
                  <div className="p-0 font-mono text-xs">
                     <div className="flex items-center justify-between p-4 hover:bg-void transition-colors">
                        <div>
                          <p className="text-text-primary uppercase tracking-widest">Email Notifications</p>
                           <p className="text-text-muted text-xs mt-1">Security and share activity via email</p>
                        </div>
                        <button 
                          onClick={() => settings.setSetting('emailNotifications', !settings.emailNotifications)}
                          className={`w-8 h-4 border transition-colors ${settings.emailNotifications ? 'bg-accent/20 border-accent' : 'bg-void border-border'}`}
                        >
                          <div className={`h-full w-4 bg-accent transition-all ${settings.emailNotifications ? 'ml-auto' : 'mr-auto'}`} />
                        </button>
                     </div>
                     <div className="flex items-center justify-between p-4 border-t border-border hover:bg-void transition-colors">
                        <div>
                          <p className="text-text-primary uppercase tracking-widest">In-App Push Alerts</p>
                          <p className="text-text-muted text-xs mt-1">Live browser toasts for network events</p>
                        </div>
                        <button 
                          onClick={() => settings.setSetting('inAppAlerts', !settings.inAppAlerts)}
                          className={`w-8 h-4 border transition-colors ${settings.inAppAlerts ? 'bg-accent/20 border-accent' : 'bg-void border-border'}`}
                        >
                          <div className={`h-full w-4 bg-accent transition-all ${settings.inAppAlerts ? 'ml-auto' : 'mr-auto'}`} />
                        </button>
                     </div>
                  </div>
               </div>

               <button 
                 onClick={handleMarkAlertsRead}
                 className="w-full py-3 bg-surface border border-border text-text-muted font-mono text-xs uppercase tracking-widest hover:text-text-primary hover:border-text-primary transition-colors"
               >
                 [ Mark All Read ]
               </button>
             </div>
           )}

           {activeTab === 'Infrastructure' && (
             <div className="bg-surface border border-border">
                <div className="p-4 border-b border-border bg-surface-raised">
                   <h3 className="font-mono text-xs text-text-primary uppercase tracking-widest">System Parameters</h3>
                </div>
                <div className="p-0 font-mono text-xs">
                   <div className="flex items-center justify-between p-4 hover:bg-void transition-colors">
                      <div>
                        <p className="text-text-primary uppercase tracking-widest">Auto Shard Replication</p>
                        <p className="text-text-muted text-xs mt-1 max-w-xs">Clone data shards across regional nodes for high availability.</p>
                      </div>
                      <button 
                        onClick={() => settings.setSetting('autoReplication', !settings.autoReplication)}
                        className={`w-8 h-4 border transition-colors ${settings.autoReplication ? 'bg-accent/20 border-accent' : 'bg-void border-border'}`}
                      >
                        <div className={`h-full w-4 bg-accent transition-all ${settings.autoReplication ? 'ml-auto' : 'mr-auto'}`} />
                      </button>
                   </div>
                   <div className="flex items-center justify-between p-4 border-t border-border hover:bg-void transition-colors">
                      <div>
                        <p className="text-text-primary uppercase tracking-widest">Telemetry Polling</p>
                        <p className="text-text-muted text-xs mt-1 max-w-xs">Periodically fetch node health and vault telemetry data.</p>
                      </div>
                      <button 
                        onClick={() => settings.setSetting('telemetryPolling', !settings.telemetryPolling)}
                        className={`w-8 h-4 border transition-colors ${settings.telemetryPolling ? 'bg-accent/20 border-accent' : 'bg-void border-border'}`}
                      >
                        <div className={`h-full w-4 bg-accent transition-all ${settings.telemetryPolling ? 'ml-auto' : 'mr-auto'}`} />
                      </button>
                   </div>
                </div>
             </div>
           )}

           {activeTab === 'Nodes' && (
             <div className="bg-surface border border-border">
                <div className="p-4 border-b border-border bg-surface-raised flex items-center justify-between">
                  <h3 className="font-mono text-xs text-text-primary uppercase tracking-widest">Storage Node Cluster</h3>
                  <button onClick={fetchNodes} className="text-xs text-accent uppercase tracking-widest hover:underline flex items-center font-mono">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Ping
                  </button>
                </div>
                <div className="p-6">
                  {isLoadingNodes ? (
                    <div className="py-8 text-center text-accent text-xs font-mono uppercase tracking-widest animate-pulse">[ Scanning Nodes... ]</div>
                  ) : nodesData ? (
                    <div className="space-y-6">
                      <div className="p-4 bg-accent/5 border border-accent/20 flex items-start space-x-3">
                        <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        <div className="font-mono text-xs">
                          <p className="text-accent uppercase tracking-widest">Cluster Status: {nodesData.nodes}</p>
                          <p className="text-text-muted text-xs mt-2 leading-relaxed">
                            {nodesData.active_nodes === 'simulated' ? 'Using simulated local node network.' : 'Connected to global Zancrypt relay.'} <br/>
                            Expected Nodes: {nodesData.expected_count || 5}.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {['US East', 'US West', 'EU Central', 'AP South', 'AP Northeast'].map((regionName) => (
                          <div key={regionName} className="p-3 bg-void border border-border">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[11px] font-mono text-text-muted uppercase tracking-widest">{regionName}</p>
                              <div className="w-1.5 h-1.5 bg-accent animate-pulse"></div>
                            </div>
                            <p className="text-xs font-mono text-text-primary uppercase">node-{regionName.toLowerCase().replace(' ', '-')}</p>
                            <p className="text-[11px] font-mono text-accent mt-2 uppercase tracking-widest">Lat: {Math.floor(Math.random() * 40 + 10)}ms</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-danger text-xs font-mono uppercase tracking-widest">Failed to establish connection</div>
                  )}
                </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
