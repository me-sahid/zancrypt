import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, User, Fingerprint } from 'lucide-react';
import { toast } from 'react-hot-toast';
import gsap from 'gsap';
import Button from '../../components/ui/Button';
import SecureInput from '../../components/ui/SecureInput';
import { useAuthStore } from '../../store/useStore';
import api from '../../services/api';
import CipherText from '../../components/crypto/CipherText';
import { isWebAuthnSupported, registerPasskey } from '../../utils/webauthn';
import { generateSalt } from '../../utils/crypto';



const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
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
        full_name: formData.fullName
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
      let errorMsg = error.response?.data?.detail || error.message || 'Identity protocol failed';
      if (errorMsg.includes("navigator.credentials") || errorMsg.includes("undefined is not an object (evaluating 'navigator.credentials.create')")) {
        errorMsg = "Passkeys require HTTPS/Localhost. Local IP detected.";
      }
      toast.error(`${errorMsg}`, { id: 'auth-toast' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-void overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8">
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
            <h1 className="text-2xl sm:text-3xl font-display text-text-primary mb-2">Initialize Vault</h1>
            <p className="font-mono text-xs sm:text-sm text-text-muted uppercase tracking-widest mb-6 sm:mb-8">
              Create Your Secure Identity
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <div className="flex flex-col items-center justify-center p-5 sm:p-6 border border-border border-dashed rounded-md bg-surface-raised mb-4 mt-2">
              <Fingerprint className="w-8 h-8 sm:w-10 sm:h-10 text-accent mb-2 sm:mb-3" strokeWidth={1} />
              <p className="font-mono text-xs sm:text-sm text-text-primary uppercase tracking-widest mb-1 text-center">Biometric Protocol</p>
              <p className="font-sans text-xs sm:text-sm text-text-secondary text-center leading-relaxed">
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
    </div>
  );
};

export default Register;
