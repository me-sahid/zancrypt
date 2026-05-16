import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ShieldCheck, Globe, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../store/useStore';
import api from '../../services/api';

import { authenticatePasskey } from '../../utils/webauthn';
import { deriveKey } from '../../utils/crypto';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [showFallback, setShowFallback] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Biometric Flow
    if (!showFallback) {
      toast.loading("Initiating zero-knowledge challenge...", { id: 'auth-toast' });

      try {
        const startResponse = await api.post('/auth/login/start', { email: email });
        const { options, session_id } = startResponse.data;

        toast.loading("Awaiting biometric confirmation...", { id: 'auth-toast' });
        const assertion = await authenticatePasskey(options);

        toast.loading("Verifying cryptographic signature...", { id: 'auth-toast' });
        const verifyResponse = await api.post('/auth/login/verify', {
          session_id: session_id,
          response: assertion
        });

        const { access_token, user } = verifyResponse.data;
        setAuth(user, access_token);
        toast.success('Access granted via Biometrics.', { id: 'auth-toast' });
        navigate('/dashboard');
      } catch (error) {
        console.error('Login failed:', error);
        const errorMsg = error.response?.data?.detail || error.message || 'Authentication failed';
        toast.error(`${errorMsg}. Switching to Access Key.`, { id: 'auth-toast' });
        setShowFallback(true);
      } finally {
        setIsLoading(false);
      }
    }
    // Fallback Access Key Flow
    else {
      toast.loading("Verifying identity via Access Key...", { id: 'auth-toast' });
      try {
        const response = await api.post('/auth/login/fallback', {
          email: email,
          access_key: accessKey
        });

        const { access_token, user } = response.data;
        setAuth(user, access_token);
        toast.success('Access granted via Security Key.', { id: 'auth-toast' });
        navigate('/dashboard');
      } catch (error) {
        const errorMsg = error.response?.data?.detail || 'Invalid Access Key. Access Denied.';
        toast.error(errorMsg, { id: 'auth-toast' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-primary-bg flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-accent/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-security/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-accent shadow-2xl shadow-primary-accent/20 mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">Authentication</h1>
          <p className="text-text-secondary mt-2">Enter your credentials to access the vault.</p>
        </div>

        <div className="glass-elevated rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <AnimatePresence>
              {showFallback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <Input
                    label="Access Key"
                    name="accessKey"
                    type="password"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="••••••••"
                    required
                    leftIcon={<Lock className="w-4 h-4" />}
                  />
                  <div className="flex items-center space-x-2 text-[10px] text-status-warning bg-status-warning/10 p-2 rounded-lg border border-status-warning/20">
                    <AlertCircle className="w-3 h-3" />
                    <span>Biometric verification failed. Use your security key.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showFallback && (
              <div className="flex items-center space-x-3 p-4 bg-surface-secondary/50 rounded-xl border border-border">
                <div className="p-2 rounded-lg bg-primary-accent/10">
                  <ShieldCheck className="w-5 h-5 text-primary-accent" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary leading-tight">Biometric Identity</p>
                  <p className="text-[10px] text-text-secondary">Passwordless access using WebAuthn protocol.</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full py-6 text-lg group"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            >
              {showFallback ? 'Verify Security Key' : 'Verify Identity'}
            </Button>

            {showFallback && (
              <button
                type="button"
                onClick={() => setShowFallback(false)}
                className="w-full text-[10px] text-text-secondary hover:text-primary-accent uppercase tracking-widest font-bold transition-colors"
              >
                Retry Biometrics
              </button>
            )}
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-sm text-text-secondary">
              New node administrator?{' '}
              <Link to="/register" className="text-primary-accent font-bold hover:underline">Register Instance</Link>
            </p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center space-x-6 text-[10px] text-text-secondary uppercase tracking-[0.2em] font-medium opacity-50">
          <div className="flex items-center">
            <Globe className="w-3 h-3 mr-2" />
            256-Bit SSL
          </div>
          <div className="flex items-center">
            <ShieldCheck className="w-3 h-3 mr-2" />
            AES-256 GCM
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
