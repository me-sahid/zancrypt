import React, { useState, useEffect } from 'react';
import { 
  User, 
  Shield, 
  CheckCircle2,
  Mail,
  Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

import { useAuthStore } from '../../store/useStore';

const Profile = () => {
  const { user, token, setAuth } = useAuthStore();
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
    }
  }, [user]);
  
  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    toast.loading("Updating secure profile...", { id: 'profile-update' });
    try {
      const res = await api.put('/auth/profile', { full_name: fullName });
      setAuth(res.data, token);
      toast.success("Profile updated successfully", { id: 'profile-update' });
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.detail || "Failed to update profile", { id: 'profile-update' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Identity Profile</h1>
        <p className="text-text-secondary mt-1">Manage your vault identity and access credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <Card className="md:col-span-1 flex flex-col items-center p-8">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-accent to-security flex items-center justify-center text-3xl font-bold text-white shadow-2xl mb-6">
               {getInitials(user?.full_name || user?.username)}
            </div>
            <h3 className="text-lg font-bold text-text-primary">{user?.full_name || user?.username || 'Anonymous'}</h3>
            <p className="text-xs text-text-secondary uppercase tracking-widest mt-1">Verified Identity</p>
            <Badge variant="success" className="mt-4">Secured with Biometrics</Badge>
         </Card>

         <Card className="md:col-span-2">
            <CardHeader>
               <CardTitle>Vault Credentials</CardTitle>
               <CardDescription>Your unique identity details on the YuuVault network.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                     label="Vault Alias (Full Name)" 
                     value={fullName} 
                     onChange={(e) => setFullName(e.target.value)}
                     leftIcon={<User className="w-4 h-4" />} 
                  />
                  <Input label="Vault Handle" value={user?.username || ''} readOnly disabled leftIcon={<User className="w-4 h-4" />} />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Email Address" value={user?.email || ''} readOnly disabled leftIcon={<Mail className="w-4 h-4" />} />
                  <Input label="Assigned Region" value={user?.region || 'Global Cluster'} readOnly disabled leftIcon={<Globe className="w-4 h-4" />} />
               </div>
               
               <div className="flex justify-end pt-2">
                 <Button
                   variant="primary"
                   isLoading={isSaving}
                   disabled={fullName === (user?.full_name || '')}
                   onClick={handleSaveProfile}
                   className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-bold px-6 py-2.5 rounded-xl text-xs active:scale-95 transition-all cursor-pointer text-white"
                 >
                   Save Profile Alias
                 </Button>
               </div>

               <div className="pt-4 p-4 bg-primary-accent/5 rounded-xl border border-primary-accent/10">
                  <p className="text-xs font-bold text-primary-accent uppercase tracking-widest mb-2 flex items-center">
                    <Shield className="w-3 h-3 mr-2" /> Security Status
                  </p>
                  <p className="text-sm text-text-primary">Your identity is protected by end-to-end encryption and hardware-backed biometric verification.</p>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
};

export default Profile;
