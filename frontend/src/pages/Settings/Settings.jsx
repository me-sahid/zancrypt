import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Settings as SettingsIcon, User, Bell, Shield, Server, Cpu } from 'lucide-react';

const Settings = () => (
  <div className="space-y-8 max-w-4xl">
    <h1 className="text-4xl font-black text-text-primary tracking-tight">System Settings</h1>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
      <div className="space-y-2">
         {[
           { icon: User, label: 'Profile' },
           { icon: Shield, label: 'Security' },
           { icon: Bell, label: 'Alerts' },
           { icon: Server, label: 'Infrastructure' },
           { icon: Cpu, label: 'Nodes' }
         ].map((item, i) => (
           <button key={i} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${i === 0 ? 'bg-primary-accent/10 text-primary-accent' : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'}`}>
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
           </button>
         ))}
      </div>

      <div className="md:col-span-3 space-y-6">
         <Card>
            <CardHeader><CardTitle>Profile Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Display Name</label>
                    <input className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-accent" defaultValue="Senior Architect" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Email Alias</label>
                    <input className="w-full bg-surface-elevated border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary-accent" defaultValue="architect@zancrypt.internal" />
                  </div>
               </div>
               <div className="pt-4 flex justify-end">
                  <button className="px-6 py-2 rounded-lg bg-primary-accent text-white font-bold text-sm shadow-lg shadow-primary-accent/20">Save Changes</button>
               </div>
            </CardContent>
         </Card>

         <Card>
            <CardHeader><CardTitle>Infrastructure Preferences</CardTitle></CardHeader>
            <CardContent className="space-y-4 text-text-secondary text-sm">
               <div className="flex items-center justify-between">
                  <p>Automatic Shard Replication</p>
                  <div className="w-10 h-5 bg-primary-accent rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
               </div>
               <div className="flex items-center justify-between border-t border-border pt-4">
                  <p>Real-time Telemetry Polling</p>
                  <div className="w-10 h-5 bg-primary-accent rounded-full relative"><div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" /></div>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  </div>
);

export default Settings;
