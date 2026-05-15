import React from 'react';
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

const Profile = () => {
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
               <CardDescription>Update your personal details and account settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="Engineering Handle" value="jane_edge_01" leftIcon={<User className="w-4 h-4" />} />
                  <Input label="Email Address" value="jane@yuuvault.io" leftIcon={<Mail className="w-4 h-4" />} />
               </div>
               <Input label="Primary Region" value="Tokyo (ap-northeast-1)" readOnly leftIcon={<Globe className="w-4 h-4" />} />
               <div className="pt-6">
                  <Button variant="primary">Update Profile</Button>
               </div>
            </CardContent>
         </Card>
      </div>
    </div>
  );
};

export default Profile;
