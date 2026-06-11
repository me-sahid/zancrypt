import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Shield, User, Fingerprint, Check } from 'lucide-react';

import Button from '../../components/ui/Button';
import SecureInput from '../../components/ui/SecureInput';
import { useAuthStore } from '../../store/useStore';
import api from '../../services/api';
import { isWebAuthnSupported, registerPasskey } from '../../utils/webauthn';
import { generateSalt } from '../../utils/crypto';

const Register = () => {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success'
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    accessKey: '',
    confirmAccessKey: '',
  });
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && status === 'idle') {
      navigate('/vault', { replace: true });
    }
  }, [isAuthenticated, navigate, status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isWebAuthnSupported()) {
      return;
    }

    if (formData.accessKey !== formData.confirmAccessKey) {
      return;
    }

    setStatus('loading');

    try {
      const masterSalt = generateSalt();

      const startResponse = await api.post('/auth/register/start', {
        email: formData.email,
        full_name: formData.fullName
      });

      const { options, session_id } = startResponse.data;
      
      // Fix — wrap options in publicKey if not already wrapped
      const passkeyOptions = options.publicKey ? options : { publicKey: options };
      const credential = await registerPasskey(passkeyOptions);

      const verifyResponse = await api.post('/auth/register/verify', {
        session_id,
        response: credential,
        master_key_salt: masterSalt,
        access_key: formData.accessKey,
        encrypted_recovery_metadata: null
      });

      const { access_token, user } = verifyResponse.data;
      setAuth(user, access_token);

      setStatus('success');
      setTimeout(() => {
        navigate('/vault');
      }, 1500);
    } catch (error) {
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-void overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl bg-surface border border-border shadow-2xl rounded-xl p-5 sm:p-7 md:p-8 flex flex-col justify-center relative z-10 my-auto">
        <Link to="/" className="flex items-center justify-center gap-2.5 group mb-5">
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
            <h1 className="text-2xl sm:text-3xl font-display text-text-primary mb-1.5">Initialize Vault</h1>
            <p className="font-mono text-xs sm:text-sm text-text-muted uppercase tracking-widest mb-4 sm:mb-5">
              Create Your Secure Identity
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <SecureInput
              label="Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Name"
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <SecureInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@email.com"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SecureInput
                label="Access Key"
                name="accessKey"
                type="password"
                value={formData.accessKey}
                onChange={handleChange}
                placeholder="••••••••"
                required
                leftIcon={<Shield className="w-4 h-4" />}
              />
              <SecureInput
                label="Confirm Key"
                name="confirmAccessKey"
                type="password"
                value={formData.confirmAccessKey}
                onChange={handleChange}
                placeholder="••••••••"
                required
                leftIcon={<Shield className="w-4 h-4" />}
                error={formData.accessKey !== formData.confirmAccessKey && formData.confirmAccessKey ? "Mismatch" : ""}
              />
            </div>

            <div className="flex flex-col items-center justify-center p-3 sm:p-4 border border-border border-dashed rounded-md bg-surface-raised mb-2 mt-1 text-center">
              <Fingerprint className="w-7 h-7 sm:w-8 sm:h-8 text-accent mb-1.5" strokeWidth={1} />
              <p className="font-mono text-xs text-text-primary uppercase tracking-widest mb-0.5">Biometric Protocol</p>
              <p className="font-sans text-xs text-text-secondary leading-relaxed">
                Registration requires WebAuthn confirmation.
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
                  animate={{ x: status === 'success' ? 14 : 0 }}
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
                      Register Identity
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
                  animate={{ x: status === 'success' ? -14 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  ]
                </motion.span>
              </div>
            </Button>
          </form>

          <div className="mt-5 text-center">
            <p className="font-sans text-xs text-text-secondary">
              Identity exists?{' '}
              <Link to="/login" className="text-accent hover:underline font-mono uppercase tracking-widest text-xs">
                Authenticate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;