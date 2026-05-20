import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, User, Fingerprint, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';
import gsap from 'gsap';
import Button from '../../components/ui/Button';
import SecureInput from '../../components/ui/SecureInput';
import Select from '../../components/ui/Select';
import { useAuthStore } from '../../store/useStore';
import api from '../../services/api';
import CipherText from '../../components/crypto/CipherText';
import { isWebAuthnSupported, registerPasskey } from '../../utils/webauthn';
import { generateSalt } from '../../utils/crypto';

const regions = [
  { label: 'AWS - us-east-1', value: 'us-east-1' },
  { label: 'AWS - eu-central-1', value: 'eu-central-1' },
  { label: 'AWS - ap-northeast-1', value: 'ap-northeast-1' },
];

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    region: 'us-east-1',
    accessKey: '',
    confirmAccessKey: '',
  });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isWebAuthnSupported()) {
      toast.error('WebAuthn not supported. Please use a modern browser.', { duration: 6000 });
      return;
    }

    if (formData.accessKey !== formData.confirmAccessKey) {
      toast.error("Access keys do not match");
      return;
    }

    setIsLoading(true);
    
    try {
      const masterSalt = generateSalt();
      
      toast.loading("Initializing secure identity...", { id: 'auth-toast' });
      const startResponse = await api.post('/auth/register/start', {
        email: formData.email,
        full_name: formData.fullName,
        region: formData.region
      });
      
      const { options, session_id } = startResponse.data;
      
      toast.loading("Awaiting biometric confirmation...", { id: 'auth-toast' });
      const credential = await registerPasskey(options);
      
      toast.loading("Finalizing cryptographic setup...", { id: 'auth-toast' });
      const verifyResponse = await api.post('/auth/register/verify', {
        session_id,
        response: credential,
        master_key_salt: masterSalt,
        access_key: formData.accessKey
      });
      
      const { access_token, user } = verifyResponse.data;
      setAuth(user, access_token);
      
      toast.success('Identity established.', { id: 'auth-toast' });
      navigate('/dashboard');
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Identity protocol failed';
      toast.error(`${errorMsg}`, { id: 'auth-toast' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-void overflow-hidden">
      {/* LEFT COLUMN: Form (40%) */}
      <div className="w-full lg:w-[40%] bg-surface flex flex-col justify-center p-8 lg:p-12 relative z-10 border-r border-border shadow-2xl h-screen overflow-y-auto custom-scrollbar">
        <Link to="/" className="absolute top-8 left-8 flex items-center space-x-2 group">
          <div className="w-7 h-7 bg-accent rounded-sm flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-void" />
          </div>
          <span className="font-display italic text-[18px] text-text-primary group-hover:text-accent transition-colors">
            Zancrypt
          </span>
        </Link>

        <div className="w-full max-w-sm mx-auto mt-16 mb-8">
          <h1 className="text-3xl font-display text-text-primary mb-2">Initialize Vault</h1>
          <p className="font-mono text-[11px] text-text-muted uppercase tracking-widest mb-8">
            Create zero-knowledge identity
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <SecureInput
              label="Operator Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Dr. Robert Ford"
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <SecureInput
              label="Engineering Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="robert@delos.com"
              required
              leftIcon={<Mail className="w-4 h-4" />}
            />
            
            <div className="w-full">
              <label className="block font-mono text-[11px] text-text-muted mb-1.5 uppercase tracking-[0.1em]">
                Primary Region
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-accent transition-colors">
                  <Globe className="w-4 h-4" />
                </div>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  className="flex h-12 w-full rounded-md border border-border bg-void pl-10 pr-4 py-2 font-sans text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:shadow-[0_0_0_2px_var(--color-accent-dim)] transition-all appearance-none"
                  required
                >
                  {regions.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SecureInput
                label="Fallback Key"
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

            <div className="flex flex-col items-center justify-center p-6 border border-border border-dashed rounded-md bg-surface-raised mb-4 mt-2">
              <Fingerprint className="w-10 h-10 text-accent mb-3" strokeWidth={1} />
              <p className="font-mono text-xs text-text-primary uppercase tracking-widest mb-1">Biometric Protocol</p>
              <p className="font-sans text-xs text-text-secondary text-center leading-relaxed">
                Registration requires WebAuthn confirmation.
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12"
              isLoading={isLoading}
            >
              [ Register Identity ]
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="font-sans text-xs text-text-secondary">
              Identity exists?{' '}
              <Link to="/login" className="text-accent hover:underline font-mono uppercase tracking-widest text-xs">
                Authenticate
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
            <Fingerprint className="w-8 h-8 text-accent mb-2" />
            <span className="font-mono text-[11px] text-text-muted uppercase tracking-widest">New Device</span>
          </div>

          {/* Connection Lines */}
          <div className="flex-1 h-32 relative mx-8 flex items-center justify-between">
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-border -translate-y-1/2" />
            
            {/* Animated Data streams */}
            {[0, 1, 2].map((i) => (
              <div key={i} className="absolute left-0 w-full h-16 flex items-center" style={{ top: `${i * 25 + 15}%` }}>
                <div className="auth-line w-full h-0 bg-accent/20 origin-left" />
                <span className="absolute left-1/2 -translate-x-1/2 font-mono text-[11px] text-accent opacity-50 bg-void px-2">
                  <CipherText text={i === 0 ? 'GEN_KEYPAIR' : i === 1 ? 'STORE_PRIV_KEY' : 'SEND_PUB_KEY'} duration={2000} delay={i * 500} />
                </span>
              </div>
            ))}
          </div>

          {/* Server Node */}
          <div className="w-24 h-24 border border-border bg-surface flex flex-col items-center justify-center rounded-sm z-10">
            <Lock className="w-8 h-8 text-text-secondary mb-2" />
            <span className="font-mono text-[11px] text-text-muted uppercase tracking-widest">Zancrypt</span>
          </div>
        </div>

        {/* Terminal Output Overlay */}
        <div className="absolute bottom-12 right-12 w-80 bg-surface/80 backdrop-blur-md border border-border p-4 rounded-sm font-mono text-xs text-text-muted leading-relaxed">
          <div>&gt; INIT_REGISTRATION</div>
          <div>&gt; GENERATING_ENTROPY_POOL</div>
          <div className="text-accent">&gt; ASYMMETRIC_KEYPAIR_MINTED</div>
          <div>&gt; VAULT_READY</div>
        </div>
      </div>
    </div>
  );
};

export default Register;
