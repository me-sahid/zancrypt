import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, ScanFace, Check } from 'lucide-react';

import Button from '../../components/ui/Button';
import SecureInput from '../../components/ui/SecureInput';
import { useAuthStore } from '../../store/useStore';
import api from '../../services/api';
import { authenticatePasskey } from '../../utils/webauthn';
import { useWorkspace } from '../../hooks/useWorkspace';

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

const Login = () => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated, isInitializing, setAuth } = useAuthStore();
  const workspace = useWorkspace();

  // If already authenticated (e.g. user navigated back to /auth/login), redirect to drive.
  // Use replace so the login page is NOT added to the history stack.
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      navigate(workspace.drive, { replace: true });
    }
  }, [isAuthenticated, isInitializing, navigate, workspace.drive]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status !== 'idle') return;

    try {
      setStatus('loading');
      setError('');

      const res = await api.post('/auth/login/start', { email });
      const { options, session_id } = res.data;

      // pass options directly — backend already returns { publicKey: {...} }
      const assertion = await authenticatePasskey(options);

      const verifyResponse = await api.post('/auth/login/verify', {
        session_id,
        response: assertion,
      });

      const { access_token, user } = verifyResponse.data;
      
      const keyMatRes = await api.get('/auth/key-material', {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      useAuthStore.getState().setKeyMaterial(keyMatRes.data.master_key_salt);

      setStatus('success');
      setTimeout(() => {
        setAuth(user, access_token);
      }, 800);

    } catch (err) {
      setStatus('idle');
      console.error('Auth error:', err.name, err.message);
      let msg = '';
      const detail = err?.response?.data?.detail;
      if (typeof detail === 'string') {
        msg = detail;
      } else if (Array.isArray(detail)) {
        msg = detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
      } else if (err?.name === 'NotAllowedError') {
        msg = 'Passkey authentication was cancelled or timed out.';
      } else {
        msg = 'Passkey verification failed. Please try again.';
      }
      setError(msg);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-void overflow-y-auto p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-lg bg-surface border border-border shadow-2xl rounded-xl p-6 sm:p-8 md:p-10 flex flex-col justify-center relative z-10 my-auto">
        <Link to="/" className="flex items-center justify-center gap-2.5 group mb-8">
          <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-md border border-border flex items-center justify-center p-[2px] shrink-0">
            <img
              src="/favi/zancr.png"
              alt="Zancrypt Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="font-display font-bold text-[15px] sm:text-[16px] tracking-[0.15em] uppercase text-text-primary group-hover:text-accent transition-colors">
            ZANCRYPT
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
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError('');
              }}
              placeholder="operator@system.io"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-2 text-xs text-danger bg-danger/10 p-3 rounded-md border border-danger/20 font-mono tracking-wide"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-danger" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="flex flex-col items-center justify-center p-6 sm:p-8 border border-border border-dashed rounded-md bg-surface-raised mb-6">
              <ScanFace className="w-10 h-10 sm:w-12 sm:h-12 text-accent mb-3 sm:mb-4" strokeWidth={1} />
              <p className="font-mono text-xs sm:text-sm text-text-primary uppercase tracking-widest mb-1 text-center">Passkey Ready</p>
              <p className="font-sans text-xs sm:text-sm text-text-secondary text-center leading-relaxed">
                Use Touch ID, Face ID, or YubiKey for zero-knowledge authentication.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 overflow-hidden"
              disabled={status !== 'idle'}
            >
              <div className="flex items-center justify-center gap-2">
                <motion.span
                  animate={{ x: status === 'success' ? 8 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  [
                </motion.span>

                <AnimatePresence mode="popLayout" initial={false}>
                  {status === 'idle' && (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap"
                    >
                      Authenticate
                    </motion.span>
                  )}
                  {status === 'loading' && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2 whitespace-nowrap"
                    >
                      <svg className="h-4 w-4 animate-spin text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Authenticating
                    </motion.div>
                  )}
                  {status === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                      className="flex items-center justify-center"
                    >
                      <Check className="w-5 h-5 text-current" strokeWidth={3} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.span
                  animate={{ x: status === 'success' ? -8 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  ]
                </motion.span>
              </div>
            </Button>
          </form>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <Link to="/recover" className="text-text-muted hover:text-accent font-mono text-xs uppercase tracking-wider transition-colors">
              [ Lost access? ]
            </Link>
            <p className="font-sans text-xs text-text-secondary">
              No vault assigned?{' '}
              <Link to="/auth/register" className="text-accent hover:underline font-mono uppercase tracking-widest text-xs">
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