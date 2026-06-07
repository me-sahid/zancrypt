import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, ScanFace } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import SecureInput from '../../components/ui/SecureInput';
import { useAuthStore } from '../../store/useStore';
import api from '../../services/api';
import { authenticatePasskey } from '../../utils/webauthn';

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [showFallback, setShowFallback] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!showFallback) {
      try {
        setIsLoading(true);
        toast.loading("Preparing Authentication...", { id: 'auth-toast' });

        const res = await api.post('/auth/login/start', { email });
        const { options, session_id } = res.data;

        toast.loading("Waiting for biometric...", { id: 'auth-toast' });

        // ✅ pass options directly — backend already returns { publicKey: {...} }
        const assertion = await authenticatePasskey(options);

        toast.loading("Verifying...", { id: 'auth-toast' });

        const verifyResponse = await api.post('/auth/login/verify', {
          session_id,
          response: assertion,
        });

        const { access_token, user } = verifyResponse.data;
        setAuth(user, access_token);
        toast.success('Access granted.', { id: 'auth-toast' });
        navigate('/dashboard');

      } catch (error) {
        console.error('Auth error:', error.name, error.message);
        if (error.name === 'NotAllowedError') {
          setShowFallback(true);
          toast.error('Biometric cancelled. Use Access Key.', { id: 'auth-toast' });
        } else {
          toast.error(error.response?.data?.detail || error.message || 'Authentication failed.', { id: 'auth-toast' });
          setShowFallback(true);
        }
      } finally {
        setIsLoading(false);
      }

    } else {
      // Access Key fallback
      try {
        setIsLoading(true);
        toast.loading("Authenticating...", { id: 'auth-toast' });
        const response = await api.post('/auth/login/fallback', {
          email,
          access_key: accessKey,
        });
        const { access_token, user } = response.data;
        setAuth(user, access_token);
        toast.success('Access granted.', { id: 'auth-toast' });
        navigate('/dashboard');
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Invalid Access Key.', { id: 'auth-toast' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-void overflow-y-auto p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-lg bg-surface border border-border shadow-2xl rounded-xl p-6 sm:p-8 md:p-10 flex flex-col justify-center relative z-10 my-auto">
        <Link to="/" className="flex items-center space-x-2 group mb-8 justify-center">
          <div className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-void" />
          </div>
          <span className="font-display italic text-[18px] text-text-primary group-hover:text-accent transition-colors">
            Zancrypt
          </span>
        </Link>

        <div className="w-full">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-display text-text-primary mb-2">Authenticate</h1>
            <p className="font-mono text-xs sm:text-sm text-text-muted uppercase tracking-widest mb-8 sm:mb-10">
              Establish Secure Session
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <SecureInput
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@system.io"
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
                  <SecureInput
                    label="Access Key"
                    name="accessKey"
                    type="password"
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="••••••••"
                    required
                    leftIcon={<Lock className="w-4 h-4" />}
                  />
                  <div className="flex items-start space-x-2 text-xs text-warning bg-warning/10 p-3 rounded-md border border-warning/20 font-mono uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Biometric challenge failed. Fallback to access key required.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showFallback && (
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 border border-border border-dashed rounded-md bg-surface-raised mb-6">
                <ScanFace className="w-10 h-10 sm:w-12 sm:h-12 text-accent mb-3 sm:mb-4" strokeWidth={1} />
                <p className="font-mono text-xs sm:text-sm text-text-primary uppercase tracking-widest mb-1 text-center">Passkey Ready</p>
                <p className="font-sans text-xs sm:text-sm text-text-secondary text-center leading-relaxed">
                  Use Touch ID, Face ID, or YubiKey for zero-knowledge authentication.
                </p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12"
              isLoading={isLoading}
            >
              {showFallback ? '[ Authenticate ]' : '[ Request Challenge ]'}
            </Button>

            {showFallback && (
              <button
                type="button"
                onClick={() => setShowFallback(false)}
                className="w-full font-mono text-xs text-text-muted hover:text-accent uppercase tracking-widest transition-colors mt-4"
              >
                Retry Passkey
              </button>
            )}
          </form>

          <div className="mt-12 text-center">
            <p className="font-sans text-xs text-text-secondary">
              No vault assigned?{' '}
              <Link to="/register" className="text-accent hover:underline font-mono uppercase tracking-widest text-xs">
                Initialize
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;