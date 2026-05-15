import React from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Database, 
  Key, 
  Trash2,
  Save,
  Cpu,
  Monitor
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export const Settings = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">System Settings</h1>
        <p className="text-text-secondary mt-1">Configure your administrative instance and network preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Network Config */}
        <Card>
          <CardHeader>
            <CardTitle>Distributed Cluster Config</CardTitle>
            <CardDescription>Manage how shards are replicated across the global network.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Default Replication Factor</label>
                <select className="w-full h-10 bg-surface-secondary border border-border rounded-lg px-3 text-sm text-text-primary focus:ring-1 focus:ring-primary-accent focus:outline-none">
                   <option>3 Nodes (Standard)</option>
                   <option>5 Nodes (Enterprise)</option>
                   <option>7 Nodes (Maximum Redundancy)</option>
                </select>
              </div>
              <Input label="Master Engineering Key (Hash)" value="0x7f2a...9b4c" readOnly leftIcon={<Key className="w-4 h-4" />} />
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-primary-accent/5 border border-primary-accent/20 rounded-xl">
               <div className="p-2 rounded-lg bg-primary-accent/10">
                  <Globe className="w-5 h-5 text-primary-accent" />
               </div>
               <div className="flex-1">
                  <p className="text-sm font-bold text-text-primary uppercase tracking-tight">Auto-Heal Infrastructure</p>
                  <p className="text-xs text-text-secondary">Automatically provision new shards if a node falls below 99% health.</p>
               </div>
               <div className="w-12 h-6 bg-primary-accent rounded-full relative flex items-center px-1">
                  <div className="w-4 h-4 bg-white rounded-full translate-x-6" />
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Security / API */}
        <Card>
          <CardHeader>
            <CardTitle>API & Security</CardTitle>
            <CardDescription>Manage keys and access policies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <Input label="Admin API Key" value="yuu_live_sk_8273xXyZ9283" readOnly type="password" rightIcon={<Button variant="ghost" size="sm">Copy</Button>} />
             <div className="pt-4 flex justify-between items-center border-t border-border">
                <div>
                   <p className="text-sm font-bold text-text-primary">Destroy Vault Instance</p>
                   <p className="text-xs text-text-secondary">Permanently erase all shards and keys. This action is irreversible.</p>
                </div>
                <Button variant="danger" size="sm" leftIcon={<Trash2 className="w-4 h-4" />}>Erase All Shards</Button>
             </div>
          </CardContent>
          <div className="p-4 border-t border-border flex justify-end">
             <Button variant="primary" leftIcon={<Save className="w-4 h-4" />}>Save Configuration</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const Profile = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Administrator Profile</h1>
        <p className="text-text-secondary mt-1">Manage your identity and access credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="md:col-span-1 flex flex-col items-center p-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-accent to-security flex items-center justify-center text-3xl font-bold text-white shadow-2xl mb-6">
               JD
            </div>
            <h3 className="text-lg font-bold text-text-primary">Jane Doe</h3>
            <p className="text-xs text-text-secondary uppercase tracking-widest mt-1">Node Admin</p>
            <Badge variant="success" className="mt-4">Identity Verified</Badge>
         </Card>

         <Card className="md:col-span-2">
            <CardHeader>
               <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Engineering Handle" value="jane_edge_01" />
                  <Input label="Email Address" value="jane@yuuvault.io" />
               </div>
               <Input label="Primary Region" value="Tokyo (ap-northeast-1)" readOnly />
               <div className="pt-6">
                  <Button variant="primary">Update Profile</Button>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
};
