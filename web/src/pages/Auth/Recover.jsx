import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Key, Fingerprint, AlertCircle, Check, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

import Button from '../../components/ui/Button';
import SecureInput from '../../components/ui/SecureInput';
import { useAuthStore } from '../../store/useStore';
import api from '../../services/api';
import { registerPasskey } from '../../utils/webauthn';
import { formatRecoveryKeyInput, isValidRecoveryKey } from '../../utils/recoveryKey';
import { useWorkspace } from '../../hooks/useWorkspace';
import toast from 'react-hot-toast';

const Recover = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Recovery Key, 3: Register Passkey
  const [email, setEmail] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [passkeyOptions, setPasskeyOptions] = useState(null);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [revokeExisting, setRevokeExisting] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const workspace = useWorkspace();

  // ── Step 1: Submit Email ─────────────────────────────────────────────
  const handleStartRecovery = async (e) => {
    e.preventDefault();
    if (!email || isLoading) return;

    setError('');
    setIsLoading(true);

    try {
      const res = await api.post('/auth/recover/start', { email: email.trim() });
      setSessionToken(res.data.session_token);
      setPasskeyOptions(res.data.options);
      setStep(2);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to initiate account recovery. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Validate Recovery Key Format ─────────────────────────────
  const handleProceedToPasskey = (e) => {
    e.preventDefault();
    setError('');

    if (!isValidRecoveryKey(recoveryKey)) {
      setError('Please enter a valid 20-character recovery key (formatted as XXXX-XXXX-XXXX-XXXX-XXXX).');
      return;
    }

    setStep(3);
  };

  // ── Step 3: Trigger WebAuthn and Submit Recovery ─────────────────────
  // IMPORTANT: Must trigger navigator.credentials.create directly on click
  // with no intervening state changes or awaits to prevent NotAllowedError.
  const handleRegisterAndRecover = async () => {
    setError('');

    try {
      // 1. Direct WebAuthn invocation on user gesture:
      const options = passkeyOptions?.publicKey ? passkeyOptions : { publicKey: passkeyOptions };
      const credential = await registerPasskey(options);

      // 2. Submit payload to backend:
      setIsLoading(true);
      const res = await api.post('/auth/recover', {
        session_token: sessionToken,
        recovery_key: recoveryKey,
        new_passkey_response: credential,
        revoke_existing_passkeys: revokeExisting,
      });

      const { access_token, user, recovery_key_rotated } = res.data;
      setAuth(user, access_token);
      toast.success('Account recovered successfully!');

      if (recovery_key_rotated) {
        navigate(`${workspace.settings}?tab=Security&setup-recovery=true`);
      } else {
        navigate(workspace.drive);
      }
    } catch (err) {
      setIsLoading(false);
      console.error('Recovery failure:', err);
      const msg = err?.response?.data?.detail 
        || (err.name === 'NotAllowedError' 
            ? 'Passkey registration was cancelled or timed out. Please try again.' 
            : 'Recovery failed. Invalid recovery key or session expired.');
      setError(msg);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-void overflow-y-auto p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-lg bg-surface border border-border shadow-2xl rounded-xl p-6 sm:p-8 md:p-10 flex flex-col justify-center relative z-10 my-auto">
        <Link to="/" className="flex items-center justify-center gap-2.5 group mb-6">
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

        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-display text-text-primary mb-2">Account Recovery</h1>
          <p className="font-mono text-xs sm:text-sm text-text-muted uppercase tracking-widest">
            Zero-Knowledge Vault Restoration
          </p>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 gap-2 mb-8 font-mono text-xs">
          <div className={`p-2 text-center border-b-2 transition-colors ${step >= 1 ? 'border-accent text-accent' : 'border-border text-text-muted'}`}>
            01. Email
          </div>
          <div className={`p-2 text-center border-b-2 transition-colors ${step >= 2 ? 'border-accent text-accent' : 'border-border text-text-muted'}`}>
            02. Recovery Key
          </div>
          <div className={`p-2 text-center border-b-2 transition-colors ${step >= 3 ? 'border-accent text-accent' : 'border-border text-text-muted'}`}>
            03. New Passkey
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start space-x-2 text-xs text-danger bg-danger/10 p-3 rounded-md border border-danger/20 font-mono tracking-wide mb-6"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-danger" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* ── STEP 1: Email ────────────────────────────────────────────── */}
        {step === 1 && (
          <form onSubmit={handleStartRecovery} className="space-y-6">
            <p className="font-mono text-xs text-text-muted leading-relaxed">
              Enter the email address registered with your Zancrypt file vault to begin the recovery ceremony.
            </p>

            <SecureInput
              label="Account Email"
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

            <Button
              type="submit"
              variant="primary"
              className="w-full h-12"
              disabled={isLoading || !email}
            >
              <span className="font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                {isLoading ? 'Verifying...' : 'Continue to Recovery Key'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </span>
            </Button>
          </form>
        )}

        {/* ── STEP 2: Recovery Key ─────────────────────────────────────── */}
        {step === 2 && (
          <form onSubmit={handleProceedToPasskey} className="space-y-6">
            <p className="font-mono text-xs text-text-muted leading-relaxed">
              Provide the emergency recovery key saved during your registration or previous rotation.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-mono text-text-muted uppercase tracking-widest">Recovery Key</label>
              <div className="relative">
                <input
                  type="text"
                  value={recoveryKey}
                  onChange={(e) => {
                    setRecoveryKey(formatRecoveryKeyInput(e.target.value));
                    if (error) setError('');
                  }}
                  placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
                  maxLength={24}
                  className="w-full bg-void border border-border focus:border-accent text-text-primary p-3 pl-10 font-mono text-sm tracking-wider uppercase outline-none rounded"
                  autoFocus
                  required
                />
                <Key className="w-4 h-4 text-text-muted absolute left-3 top-3.5" />
              </div>
              <p className="text-[11px] font-mono text-text-muted">
                20-character base32 alphanumeric code (excludes 0, 1, O, I).
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => { setStep(1); setError(''); }}
                className="px-4 py-3 text-text-muted hover:text-text-primary font-mono text-xs uppercase transition-colors"
              >
                Back
              </button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 h-12"
                disabled={!isValidRecoveryKey(recoveryKey)}
              >
                <span className="font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                  Verify Key Format & Proceed
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Button>
            </div>
          </form>
        )}

        {/* ── STEP 3: Register New Passkey ─────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex flex-col items-center justify-center p-6 border border-border border-dashed rounded-md bg-surface-raised text-center">
              <Fingerprint className="w-12 h-12 text-accent mb-3" strokeWidth={1} />
              <p className="font-mono text-xs text-text-primary uppercase tracking-widest mb-1">
                Authorize New Device Passkey
              </p>
              <p className="font-sans text-xs text-text-secondary leading-relaxed max-w-xs">
                To prevent lockouts, you must register a passkey for this new device as part of the recovery ceremony.
              </p>
            </div>

            <label className="flex items-start space-x-3 p-3.5 bg-void border border-border rounded cursor-pointer select-none">
              <input
                type="checkbox"
                checked={revokeExisting}
                onChange={(e) => setRevokeExisting(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-accent rounded cursor-pointer shrink-0"
              />
              <div className="font-mono text-xs">
                <span className="text-text-primary font-medium">Revoke old device passkeys</span>
                <p className="text-text-muted text-[11px] mt-0.5">
                  Deactivates all previously registered credentials to protect against compromised or stolen hardware.
                </p>
              </div>
            </label>

            <div className="space-y-3 pt-2">
              <Button
                type="button"
                variant="primary"
                onClick={handleRegisterAndRecover}
                className="w-full h-12"
                disabled={isLoading}
              >
                <span className="font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2">
                  {isLoading ? 'Finalizing Recovery...' : 'Register Passkey & Recover Vault'}
                  {!isLoading && <Fingerprint className="w-4 h-4" />}
                </span>
              </Button>

              <button
                type="button"
                onClick={() => { setStep(2); setError(''); }}
                disabled={isLoading}
                className="w-full py-2 text-text-muted hover:text-text-primary font-mono text-xs uppercase transition-colors"
              >
                Back to Recovery Key
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center border-t border-border/50 pt-6">
          <p className="font-sans text-xs text-text-secondary">
            Remembered your credentials?{' '}
            <Link to="/auth/login" className="text-accent hover:underline font-mono uppercase tracking-widest text-xs">
              Authenticate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Recover;
