import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, AlertCircle, ScanFace } from 'lucide-react';
import { toast } from 'react-hot-toast';
import gsap from 'gsap';
import Button from '../../components/ui/Button';
import SecureInput from '../../components/ui/SecureInput';
import { useAuthStore } from '../../store/useStore';
import api from '../../services/api';
import CipherText from '../../components/crypto/CipherText';
import { authenticatePasskey } from '../../utils/webauthn';

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [showFallback, setShowFallback] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, setAuth } = useAuthStore();
  const vizRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Visualizer Animation
  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1 });
      tl.to('.auth-line', {
        height: '100%',
        duration: 2,
        ease: 'power2.inOut',
        stagger: 0.2,
      }).to('.auth-line', {
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
      }, "+=1");
    }, vizRef);
    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!showFallback) {
      toast.loading("Initiating zero-knowledge challenge...", { id: 'auth-toast' });

      try {
        const startResponse = await api.post('/auth/login/start', { email });
        const { options, session_id } = startResponse.data;

        toast.loading("Awaiting biometric confirmation...", { id: 'auth-toast' });
        const assertion = await authenticatePasskey(options);

        toast.loading("Verifying cryptographic signature...", { id: 'auth-toast' });
        const verifyResponse = await api.post('/auth/login/verify', {
          session_id,
          response: assertion
        });

        const { access_token, user } = verifyResponse.data;
        setAuth(user, access_token);
        toast.success('Access granted via Biometrics.', { id: 'auth-toast' });
        navigate('/dashboard');
      } catch (error) {
        const errorMsg = error.response?.data?.detail || error.message || 'Authentication failed';
        toast.error(`${errorMsg}. Switching to Access Key.`, { id: 'auth-toast' });
        setShowFallback(true);
      } finally {
        setIsLoading(false);
      }
    } else {
      toast.loading("Verifying identity via Access Key...", { id: 'auth-toast' });
      try {
        const response = await api.post('/auth/login/fallback', {
          email,
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
    <div className="min-h-screen flex bg-void overflow-hidden">
      {/* LEFT COLUMN: Form (40%) */}
      <div className="w-full lg:w-[40%] bg-surface flex flex-col justify-center p-8 lg:p-16 relative z-10 border-r border-border shadow-2xl">
        <Link to="/" className="absolute top-8 left-8 flex items-center space-x-2 group">
          <div className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-void" />
          </div>
          <span className="font-display italic text-[18px] text-text-primary group-hover:text-accent transition-colors">
            Zancrypt
          </span>
        </Link>

        <div className="w-full max-w-sm mx-auto">
          <h1 className="text-3xl font-display text-text-primary mb-2">Authenticate</h1>
          <p className="font-mono text-[11px] text-text-muted uppercase tracking-widest mb-10">
            Establish Secure Session
          </p>

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
                  <div className="flex items-start space-x-2 text-[10px] text-warning bg-warning/10 p-3 rounded-md border border-warning/20 font-mono uppercase tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>Biometric challenge failed. Fallback to access key required.</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showFallback && (
              <div className="flex flex-col items-center justify-center p-8 border border-border border-dashed rounded-md bg-surface-raised mb-6">
                <ScanFace className="w-12 h-12 text-accent mb-4" strokeWidth={1} />
                <p className="font-mono text-xs text-text-primary uppercase tracking-widest mb-1">Passkey Ready</p>
                <p className="font-sans text-[11px] text-text-secondary text-center">
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
                className="w-full font-mono text-[10px] text-text-muted hover:text-accent uppercase tracking-widest transition-colors mt-4"
              >
                Retry Passkey
              </button>
            )}
          </form>

          <div className="mt-12 text-center">
            <p className="font-sans text-xs text-text-secondary">
              No vault assigned?{' '}
              <Link to="/register" className="text-accent hover:underline font-mono uppercase tracking-widest text-[10px]">
                Initialize
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Visualization (60%) */}
      <div className="hidden lg:flex w-[60%] relative items-center justify-center" ref={vizRef}>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none" />
        
        <div className="relative w-full max-w-2xl h-[600px] flex items-center justify-between px-16">
          {/* Client Node */}
          <div className="w-24 h-24 border border-border bg-surface flex flex-col items-center justify-center rounded-sm z-10 shadow-[0_0_20px_rgba(79,255,176,0.1)]">
            <ShieldCheck className="w-8 h-8 text-accent mb-2" />
            <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">Client</span>
          </div>

          {/* Connection Lines */}
          <div className="flex-1 h-32 relative mx-8 flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-border -translate-y-1/2" />
            
            {/* Animated Data streams */}
            {[0, 1, 2].map((i) => (
              <div key={i} className="absolute left-0 w-full h-16 flex items-center" style={{ top: `${i * 25 + 15}%` }}>
                <div className="auth-line w-full h-0 bg-accent/20 origin-left" />
                <span className="absolute left-1/2 -translate-x-1/2 font-mono text-[8px] text-accent opacity-50 bg-void px-2">
                  <CipherText text={i === 0 ? 'W3C_WEBAUTHN' : i === 1 ? 'AES_256_GCM' : 'HKDF_SHA256'} duration={2000} delay={i * 500} />
                </span>
              </div>
            ))}
          </div>

          {/* Server Node */}
          <div className="w-24 h-24 border border-border bg-surface flex flex-col items-center justify-center rounded-sm z-10">
            <Lock className="w-8 h-8 text-text-secondary mb-2" />
            <span className="font-mono text-[9px] text-text-muted uppercase tracking-widest">Zancrypt</span>
          </div>
        </div>

        {/* Terminal Output Overlay */}
        <div className="absolute bottom-12 right-12 w-80 bg-surface/80 backdrop-blur-md border border-border p-4 rounded-sm font-mono text-[10px] text-text-muted leading-relaxed">
          <div>&gt; INIT_SESSION</div>
          <div>&gt; AWAITING_CHALLENGE</div>
          <div className="text-accent">&gt; PUB_KEY_CRYPTOGRAPHY_ENABLED</div>
          <div>&gt; ZERO_KNOWLEDGE_PROOF: READY</div>
        </div>
      </div>
    </div>
  );
};

export default Login;
