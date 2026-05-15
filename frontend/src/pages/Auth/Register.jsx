import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Globe, Cpu, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { twMerge } from 'tailwind-merge';
import api from '../../services/api';
import { isWebAuthnSupported, registerPasskey } from '../../utils/webauthn';
import { deriveKey, generateSalt } from '../../utils/crypto';

const regions = [
  { label: 'AWS - us-east-1 (N. Virginia)', value: 'us-east-1' },
  { label: 'AWS - us-west-2 (Oregon)', value: 'us-west-2' },
  { label: 'AWS - eu-central-1 (Frankfurt)', value: 'eu-central-1' },
  { label: 'AWS - ap-northeast-1 (Tokyo)', value: 'ap-northeast-1' },
  { label: 'AWS - ap-south-1 (Mumbai)', value: 'ap-south-1' },
  { label: 'GCP - us-central1 (Iowa)', value: 'gcp-us-central1' },
  { label: 'Azure - East US', value: 'azure-east-us' },
];

import { useAuthStore } from '../../store/useStore';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    region: '',
    accessKey: '',
    confirmAccessKey: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isWebAuthnSupported()) {
      toast.error('Your browser does not support Biometric Identity (WebAuthn). Please use a modern browser like Chrome, Edge, or Safari.', { duration: 6000 });
      return;
    }

    setIsLoading(true);
    
    toast.loading("Initializing secure identity protocol...", { id: 'auth-toast' });
    
    try {
      // 1. Generate local master salt for ZK key derivation
      const masterSalt = generateSalt();
      
      // 2. Step 1: Registration Start
      const startResponse = await api.post('/auth/register/start', {
        email: formData.email,
        full_name: formData.fullName,
        region: formData.region
      });
      
      const { options, session_id } = startResponse.data;
      
      // 3. Perform WebAuthn Registration Ceremony
      toast.loading("Awaiting biometric confirmation...", { id: 'auth-toast' });
      const credential = await registerPasskey(options);
      
      // 4. Step 2: Registration Verify
      if (formData.accessKey !== formData.confirmAccessKey) {
        toast.error("Access keys do not match");
        setIsLoading(false);
        return;
      }

      toast.loading("Finalizing cryptographic setup...", { id: 'auth-toast' });
      const verifyResponse = await api.post('/auth/register/verify', {
        session_id: session_id,
        response: credential,
        master_key_salt: masterSalt,
        access_key: formData.accessKey
      });
      
      const { access_token, user } = verifyResponse.data;
      setAuth(user, access_token);
      
      toast.success('Identity established. Vault is ready.', { id: 'auth-toast' });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Identity protocol failed';
      toast.error(`${errorMsg}. Please try again.`, { id: 'auth-toast' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-accent/5 blur-[120px] rounded-full pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-xl relative z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Deploy Node Identity</h1>
          <p className="text-text-secondary mt-2">Initialize your administrative instance on the vault network.</p>
        </div>

        <div className="glass-elevated rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Dr. Robert Ford"
              required
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Engineering Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="robert@delos.com"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />
            
            <div className="md:col-span-2">
              <Select
                label="Primary Cluster Region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                options={regions}
                required
                leftIcon={<Globe className="w-4 h-4" />}
              />
            </div>

            <div className="md:col-span-1">
              <Input
                label="Access Key"
                name="accessKey"
                type="password"
                value={formData.accessKey}
                onChange={handleChange}
                placeholder="••••••••"
                required
                leftIcon={<Shield className="w-4 h-4" />}
              />
            </div>

            <div className="md:col-span-1">
              <Input
                label="Confirm Access Key"
                name="confirmAccessKey"
                type="password"
                value={formData.confirmAccessKey}
                onChange={handleChange}
                placeholder="••••••••"
                required
                error={formData.accessKey !== formData.confirmAccessKey && formData.confirmAccessKey ? "Keys do not match" : ""}
                leftIcon={<Shield className="w-4 h-4" />}
              />
            </div>

            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-3 p-4 bg-surface-secondary/50 rounded-xl border border-border">
                <div className="p-2 rounded-lg bg-primary-accent/10">
                  <Shield className="w-5 h-5 text-primary-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary leading-tight">Zero-Knowledge Hardware Identity</p>
                  <p className="text-[10px] text-text-secondary">System uses FIDO2 WebAuthn for secure, passwordless biometric verification.</p>
                </div>
              </div>

              <Button
            type="submit"
            variant="primary"
            className="w-full py-6 text-lg group"
            isLoading={isLoading}
            rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          >
            Register Instance
          </Button>

          <p className="mt-4 text-[10px] text-text-secondary text-center leading-relaxed">
            <Shield className="w-3 h-3 inline-block mr-1 text-primary-accent" />
            After clicking Register, your browser will prompt you to initialize a **Biometric Passkey** (TouchID, FaceID, or Windows Hello) to secure your administrator identity.
          </p>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-text-secondary">
              Already have an identity?{' '}
              <Link to="/login" className="text-primary-accent font-bold hover:underline">Access Vault</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
