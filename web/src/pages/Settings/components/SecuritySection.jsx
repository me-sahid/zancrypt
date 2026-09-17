import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Shield, Key, LogOut, Smartphone, Trash2, Plus, Copy, Check,
  AlertTriangle, Info, RefreshCw
} from 'lucide-react';
import { useAuthStore } from '../../../store/useStore';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { registerPasskey } from '../../../utils/webauthn';
import { generateRecoveryKey } from '../../../utils/recoveryKey';

export default function SecuritySection({ keyMaterial, onRevokeSessions }) {
  const [searchParams] = useSearchParams();
  const { user, setAuth, token } = useAuthStore();

  // ── Passkeys State ──────────────────────────────────────────────────
  const [credentials, setCredentials] = useState([]);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [showAddPasskeyModal, setShowAddPasskeyModal] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [isAddingPasskey, setIsAddingPasskey] = useState(false);
  const [deletingCredentialId, setDeletingCredentialId] = useState(null);

  // ── Recovery Key State ──────────────────────────────────────────────
  const [hasRecoveryKey, setHasRecoveryKey] = useState(user?.has_recovery_key ?? false);
  const [generatedRecoveryKey, setGeneratedRecoveryKey] = useState('');
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  const [hasCopiedKey, setHasCopiedKey] = useState(false);
  const [isSavingRecoveryKey, setIsSavingRecoveryKey] = useState(false);

  const fetchCredentials = async () => {
    setIsLoadingCredentials(true);
    try {
      const res = await api.get('/auth/credentials');
      setCredentials(res.data);
    } catch (err) {
      toast.error('Failed to load registered passkeys');
    } finally {
      setIsLoadingCredentials(false);
    }
  };

  const fetchUserMe = async () => {
    try {
      const res = await api.get('/auth/me');
      setHasRecoveryKey(res.data.has_recovery_key);
      if (user) {
        setAuth({ ...user, ...res.data }, token);
      }
    } catch (err) {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchCredentials();
    fetchUserMe();
    if (searchParams.get('setup-recovery') === 'true') {
      handleGenerateKey();
    }
  }, []);

  const handleStartAddPasskey = () => {
    setNewDeviceName('');
    setShowAddPasskeyModal(true);
  };

  const handleConfirmAddPasskey = async () => {
    setIsAddingPasskey(true);
    try {
      const startRes = await api.post('/auth/credentials/add/start');
      const { options, session_id } = startRes.data;

      const passkeyOptions = options.publicKey ? options : { publicKey: options };
      const credential = await registerPasskey(passkeyOptions);

      await api.post('/auth/credentials/add/verify', {
        session_id,
        response: credential,
        device_name: newDeviceName.trim() || undefined,
      });

      toast.success('Passkey registered successfully');
      setShowAddPasskeyModal(false);
      setNewDeviceName('');
      fetchCredentials();
      fetchUserMe();
    } catch (err) {
      const msg = err?.response?.data?.detail 
        || (err.name === 'NotAllowedError' 
            ? 'Passkey ceremony cancelled or timed out.' 
            : 'Failed to add passkey.');
      toast.error(msg);
    } finally {
      setIsAddingPasskey(false);
    }
  };

  const handleRemovePasskey = async (credentialId) => {
    if (!window.confirm('Are you sure you want to remove this passkey? This action is permanent.')) {
      return;
    }
    setDeletingCredentialId(credentialId);
    try {
      await api.delete(`/auth/credentials/${credentialId}`);
      toast.success('Passkey removed');
      fetchCredentials();
      fetchUserMe();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to remove passkey';
      toast.error(msg);
    } finally {
      setDeletingCredentialId(null);
    }
  };

  const handleGenerateKey = () => {
    const key = generateRecoveryKey();
    setGeneratedRecoveryKey(key);
    setIsAcknowledged(false);
    setHasCopiedKey(false);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(generatedRecoveryKey);
    setHasCopiedKey(true);
    toast.success('Recovery key copied to clipboard');
  };

  const handleSaveRecoveryKey = async () => {
    if (!isAcknowledged || !generatedRecoveryKey) return;
    setIsSavingRecoveryKey(true);
    try {
      await api.post('/auth/recovery-key/rotate', {
        recovery_key: generatedRecoveryKey
      });
      toast.success('Recovery key saved securely');
      setHasRecoveryKey(true);
      setGeneratedRecoveryKey('');
      setIsAcknowledged(false);
      setHasCopiedKey(false);
      fetchUserMe();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to save recovery key';
      toast.error(msg);
    } finally {
      setIsSavingRecoveryKey(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Section 1 — Registered Passkeys */}
      <div className="bg-surface border border-border">
        <div className="p-4 border-b border-border bg-surface-raised flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-accent" />
            <h3 className="font-mono text-xs text-text-primary uppercase tracking-widest">Registered Passkeys</h3>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded">
              {credentials.length} ACTIVE
            </span>
          </div>
          <button
            onClick={handleStartAddPasskey}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-accent/10 border border-accent/30 text-accent font-mono text-xs uppercase tracking-wider hover:bg-accent hover:text-white transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Passkey</span>
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {isLoadingCredentials ? (
            <div className="flex items-center justify-center p-8 text-text-muted font-mono text-xs">
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              Loading passkey matrix...
            </div>
          ) : credentials.length === 0 ? (
            <div className="p-6 text-center text-text-muted font-mono text-xs border border-border border-dashed">
              No passkeys found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-border text-text-muted text-[11px] uppercase tracking-wider">
                    <th className="pb-3 font-medium">Device Name</th>
                    <th className="pb-3 font-medium">Source</th>
                    <th className="pb-3 font-medium">Last Used</th>
                    <th className="pb-3 font-medium">Added</th>
                    <th className="pb-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {credentials.map((cred) => (
                    <tr key={cred.id} className="hover:bg-void/40 transition-colors">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center space-x-2">
                          <Smartphone className="w-4 h-4 text-accent shrink-0" />
                          <span className="text-text-primary font-medium">
                            {cred.device_name || 'Physical Authenticator'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-3 text-text-muted">
                        <span className="px-2 py-0.5 bg-surface-raised border border-border text-[10px] uppercase">
                          {cred.added_via || 'registration'}
                        </span>
                      </td>
                      <td className="py-3.5 pr-3 text-text-muted text-[11px]">
                        {cred.last_used_at ? new Date(cred.last_used_at).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3.5 pr-3 text-text-muted text-[11px]">
                        {cred.created_at ? new Date(cred.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => handleRemovePasskey(cred.id)}
                          disabled={deletingCredentialId === cred.id || credentials.length <= 1}
                          title={credentials.length <= 1 ? "Cannot remove your only passkey" : "Remove passkey"}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-text-muted"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {credentials.length === 1 && (
            <p className="text-[11px] font-mono text-text-muted italic flex items-center gap-1.5 pt-2">
              <Info className="w-3.5 h-3.5 text-accent shrink-0" />
              Minimum 1 active passkey required. To remove this device, first add a second passkey.
            </p>
          )}
        </div>
      </div>

      {/* Section 2 — Recovery Key */}
      <div className="bg-surface border border-border">
        <div className="p-4 border-b border-border bg-surface-raised flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-accent" />
            <h3 className="font-mono text-xs text-text-primary uppercase tracking-widest">Recovery Key</h3>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 border rounded uppercase ${
            hasRecoveryKey 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            {hasRecoveryKey ? '● Set & Active' : '○ Not Set'}
          </span>
        </div>

        <div className="p-6 space-y-5 font-mono text-xs">
          <p className="text-text-muted leading-relaxed">
            A recovery key enables emergency access if you lose all registered devices. It is single-use and immediately invalidated upon account recovery.
          </p>

          {!generatedRecoveryKey ? (
            <div className="pt-1">
              <button
                onClick={handleGenerateKey}
                className="px-5 py-2.5 bg-accent/10 border border-accent text-accent uppercase tracking-wider hover:bg-accent hover:text-white transition-colors"
              >
                [ {hasRecoveryKey ? 'Rotate Recovery Key' : 'Generate Recovery Key'} ]
              </button>
            </div>
          ) : (
            <div className="p-5 bg-void border border-accent/40 rounded space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-[11px] uppercase tracking-wider">New Recovery Key:</span>
                <span className="text-[10px] text-accent uppercase">Single-Use Offline Secret</span>
              </div>

              <div className="flex items-center justify-between p-3.5 bg-surface border border-border rounded">
                <span className="text-base sm:text-lg tracking-widest text-text-primary font-bold selection:bg-accent selection:text-white">
                  {generatedRecoveryKey}
                </span>
                <button
                  onClick={handleCopyKey}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-raised border border-border hover:border-accent text-text-primary text-xs uppercase transition-colors shrink-0"
                >
                  {hasCopiedKey ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] leading-relaxed flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Store this key in a secure password vault or write it down. It is never stored in plaintext on Zancrypt servers.
                </span>
              </div>

              <label className="flex items-center space-x-3 cursor-pointer select-none pt-2">
                <input
                  type="checkbox"
                  checked={isAcknowledged}
                  onChange={(e) => setIsAcknowledged(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded cursor-pointer"
                />
                <span className="text-text-primary text-xs">
                  I have saved this recovery key somewhere safe.
                </span>
              </label>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={handleSaveRecoveryKey}
                  disabled={!isAcknowledged || isSavingRecoveryKey}
                  className="px-6 py-2 bg-accent text-white uppercase tracking-wider hover:bg-accent/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSavingRecoveryKey ? '[ Activating... ]' : '[ Save & Activate Key ]'}
                </button>
                <button
                  onClick={() => setGeneratedRecoveryKey('')}
                  className="px-4 py-2 text-text-muted hover:text-text-primary transition-colors uppercase"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 3 — Account Recovery Info */}
      <div className="bg-surface border border-border">
        <div className="p-4 border-b border-border bg-surface-raised flex items-center space-x-2">
          <Info className="w-4 h-4 text-accent" />
          <h3 className="font-mono text-xs text-text-primary uppercase tracking-widest">Account Recovery Architecture</h3>
        </div>
        <div className="p-6 space-y-4 font-mono text-xs text-text-muted leading-relaxed">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-void border border-border">
              <p className="text-text-primary uppercase tracking-wider mb-1 font-semibold">1. Ecosystem Sync</p>
              <p className="text-[11px]">
                Passkeys synchronize automatically within your platform provider (Apple iCloud Keychain, Google Password Manager, Windows Hello).
              </p>
            </div>
            <div className="p-4 bg-void border border-border">
              <p className="text-text-primary uppercase tracking-wider mb-1 font-semibold">2. Cross-Ecosystem</p>
              <p className="text-[11px]">
                A recovery key is required when switching ecosystems (e.g. iPhone to Android) or recovering if you lose all registered devices without cloud backup.
              </p>
            </div>
            <div className="p-4 bg-void border border-border">
              <p className="text-text-primary uppercase tracking-wider mb-1 font-semibold">3. Zero-Knowledge Lockout</p>
              <p className="text-[11px]">
                Zancrypt maintains zero knowledge. Losing both all registered passkeys and your recovery key results in permanent account lockout by design.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Identity Verifier Salt Info */}
      {keyMaterial && (
        <div className="bg-surface border border-border">
          <div className="p-4 border-b border-border bg-surface-raised">
            <h3 className="font-mono text-xs text-text-primary uppercase tracking-widest flex items-center">
              <Key className="w-4 h-4 mr-2 text-accent" />
              Identity Verifier Salt
            </h3>
          </div>
          <div className="p-4 font-mono text-xs text-text-muted">
            <p className="break-all">{keyMaterial}</p>
          </div>
        </div>
      )}

      {/* Session Matrix */}
      <div className="bg-surface border border-danger">
        <div className="p-4 border-b border-danger bg-danger/5">
          <h3 className="font-mono text-xs text-danger uppercase tracking-widest flex items-center">
            <LogOut className="w-4 h-4 mr-2" />
            Session Matrix
          </h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="font-mono text-xs text-text-muted">
            Revoke all active sessions across all devices. This will invalidate all tokens instantly.
          </p>
          <button 
            onClick={onRevokeSessions}
            className="px-6 py-2 bg-transparent border border-danger text-danger font-mono text-xs uppercase tracking-widest hover:bg-danger/10 transition-colors"
          >
            [ Revoke All Sessions ]
          </button>
        </div>
      </div>

      {/* Add Passkey Modal */}
      {showAddPasskeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-surface border border-border max-w-md w-full p-6 space-y-5 rounded shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-mono text-xs text-text-primary uppercase tracking-widest flex items-center">
                <Plus className="w-4 h-4 mr-2 text-accent" />
                Add New Passkey
              </h3>
              <button
                onClick={() => setShowAddPasskeyModal(false)}
                className="text-text-muted hover:text-text-primary font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <p className="font-mono text-xs text-text-muted leading-relaxed">
              Enter a descriptive label for this hardware device or browser passkey (e.g. "Work MacBook", "YubiKey 5C", "Pixel 9").
            </p>

            <div className="space-y-2 font-mono text-xs">
              <label className="text-text-muted uppercase tracking-wider text-[11px]">Device Name</label>
              <input
                type="text"
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                placeholder="e.g. Work MacBook"
                maxLength={100}
                className="w-full bg-void border border-border focus:border-accent text-text-primary p-2.5 outline-none font-mono text-xs"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowAddPasskeyModal(false)}
                disabled={isAddingPasskey}
                className="px-4 py-2 text-text-muted hover:text-text-primary font-mono text-xs uppercase"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAddPasskey}
                disabled={isAddingPasskey}
                className="px-5 py-2 bg-accent text-white font-mono text-xs uppercase tracking-wider hover:bg-accent/80 transition-colors disabled:opacity-50"
              >
                {isAddingPasskey ? '[ Verifying... ]' : '[ Register Passkey ]'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
