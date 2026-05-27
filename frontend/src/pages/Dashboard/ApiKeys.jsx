import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Key, Eye, EyeOff, Copy, Trash2, ShieldAlert, CheckCircle2, Zap, Sliders } from 'lucide-react';
import { useAuthStore } from '../../store/useStore';
import { apiKeysService } from '../../services/apiKeysService';
import toast from 'react-hot-toast';

const ApiKeys = () => {
  const { user } = useAuthStore();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState(['storage', 'share']);
  const [restrictionType, setRestrictionType] = useState('none');
  const [iosBundleId, setIosBundleId] = useState('');
  const [androidPackage, setAndroidPackage] = useState('');
  const [androidSha, setAndroidSha] = useState('');
  const [revealedKeys, setRevealedKeys] = useState({});
  const [isCreating, setIsCreating] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [selectedKeyForRules, setSelectedKeyForRules] = useState(null);
  const [ruleRateLimit, setRuleRateLimit] = useState('');
  const [ruleMaxFileSize, setRuleMaxFileSize] = useState('');
  const [ruleExpiresAt, setRuleExpiresAt] = useState('');
  const [isUpdatingRules, setIsUpdatingRules] = useState(false);

  const fetchKeys = async () => {
    try {
      const data = await apiKeysService.listKeys();
      setKeys(data);
    } catch (error) {
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    
    setIsCreating(true);
    try {
      let appRestrictions = null;
      if (restrictionType === 'ios' && iosBundleId) {
        appRestrictions = { ios_bundle_ids: [iosBundleId], android_apps: [], web_origins: [], ip_addresses: [] };
      } else if (restrictionType === 'android' && androidPackage && androidSha) {
        appRestrictions = { android_apps: [{ package_name: androidPackage, sha1: androidSha }], ios_bundle_ids: [], web_origins: [], ip_addresses: [] };
      }
      
      const newKey = await apiKeysService.createKey(newKeyName, selectedScopes, appRestrictions);
      setKeys([newKey, ...keys]);
      setIsCreateModalOpen(false);
      setNewKeyName('');
      setSelectedScopes(['storage', 'share']);
      setRestrictionType('none');
      setIosBundleId('');
      setAndroidPackage('');
      setAndroidSha('');
      toast.success('API Key generated successfully');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const openRulesModal = (key) => {
    setSelectedKeyForRules(key);
    const rules = key.rules || {};
    setRuleRateLimit(rules.rate_limit_rpm || '');
    setRuleMaxFileSize(rules.max_file_size_mb || '');
    setRuleExpiresAt(rules.expires_at ? rules.expires_at.split('T')[0] : '');
    setIsRulesModalOpen(true);
  };

  const handleUpdateRules = async (e) => {
    e.preventDefault();
    setIsUpdatingRules(true);
    try {
      const payload = {
        rate_limit_rpm: ruleRateLimit ? parseInt(ruleRateLimit) : null,
        max_file_size_mb: ruleMaxFileSize ? parseInt(ruleMaxFileSize) : null,
        expires_at: ruleExpiresAt ? new Date(ruleExpiresAt).toISOString() : null,
      };
      const updated = await apiKeysService.updateRules(selectedKeyForRules.id, payload);
      setKeys(keys.map(k => k.id === updated.id ? { ...k, rules: updated.rules } : k));
      setIsRulesModalOpen(false);
      toast.success('Rules updated successfully');
    } catch (error) {
      toast.error('Failed to update rules');
    } finally {
      setIsUpdatingRules(false);
    }
  };

  const handleRevokeKey = async (id) => {
    if (!window.confirm('Are you sure you want to revoke this API key? Any applications using it will instantly lose access.')) return;
    
    try {
      await apiKeysService.revokeKey(id);
      setKeys(keys.filter(k => k.id !== id));
      toast.success('API Key revoked');
    } catch (error) {
      toast.error('Failed to revoke API key');
    }
  };

  const toggleReveal = (id) => {
    setRevealedKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary tracking-tight">API Keys</h1>
          <p className="text-text-secondary mt-2">Manage your programmatic access to Zancrypt.</p>
        </div>
        
        <div className="bg-surface-raised/50 backdrop-blur-xl border border-border p-4 rounded-2xl flex items-center gap-6 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-accent/10 rounded-xl text-accent">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-text-secondary font-medium">Available Credits</p>
              <p className="text-2xl font-bold text-text-primary">{user?.api_credits?.toLocaleString() || 0}</p>
            </div>
          </div>
          <div className="h-10 w-px bg-border"></div>
          <button className="px-5 py-2.5 bg-surface-elevated hover:bg-border text-text-primary rounded-xl font-medium transition-colors border border-border">
            Buy Credits
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl">
        <div className="p-6 border-b border-border flex justify-between items-center bg-surface-raised/80">
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            <Key className="w-5 h-5 text-accent" />
            Active Keys
          </h2>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:opacity-90 text-void rounded-lg font-bold transition-all shadow-[0_0_15px_rgba(79,255,176,0.3)]"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            Create new key
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-text-secondary">Loading keys...</div>
          ) : keys.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-surface-raised rounded-full flex items-center justify-center mb-4 text-text-muted">
                <Key className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-text-primary mb-2">No API keys yet</h3>
              <p className="text-text-secondary max-w-sm mb-6">Create your first API key to start authenticating programmatic requests to the Zancrypt Vault.</p>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="text-accent hover:brightness-110 font-medium"
              >
                Create API Key →
              </button>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-raised text-text-secondary text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium rounded-tl-lg">Name</th>
                  <th className="p-4 font-medium">Key</th>
                  <th className="p-4 font-medium">Scopes</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-4 font-medium">Usage</th>
                  <th className="p-4 font-medium text-right rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {keys.map((key) => {
                  const isRevealed = revealedKeys[key.id];
                  const displayKey = isRevealed ? key.secret_key : `${key.prefix}******************************`;
                  
                  return (
                    <tr key={key.id} className="hover:bg-surface-raised/50 transition-colors group">
                      <td className="p-4 font-medium text-text-primary">
                        {key.name}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <code className="px-3 py-1.5 bg-void border border-border rounded-lg text-accent font-mono text-sm shadow-[0_0_10px_rgba(79,255,176,0.1)]">
                            {displayKey}
                          </code>
                          <button 
                            onClick={() => toggleReveal(key.id)}
                            className="p-1.5 text-text-secondary hover:text-text-primary bg-surface-raised hover:bg-border rounded-md transition-colors"
                            title={isRevealed ? "Hide key" : "Reveal key"}
                          >
                            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => copyToClipboard(key.secret_key)}
                            className="p-1.5 text-text-secondary hover:text-text-primary bg-surface-raised hover:bg-border rounded-md transition-colors"
                            title="Copy full key"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          {(key.scopes || []).map(scope => (
                            <span key={scope} className="px-2 py-0.5 bg-accent/10 border border-accent/20 rounded-md text-accent text-xs font-medium capitalize">
                              {scope === '*' ? 'Full Access' : scope}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-text-secondary text-sm">
                        {new Date(key.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-raised border border-border rounded-md text-text-primary text-sm">
                          <Zap className="w-3.5 h-3.5 text-accent" />
                          {key.calls_made.toLocaleString()}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => openRulesModal(key)}
                          className="p-2 text-text-secondary hover:text-accent hover:bg-accent/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 mr-2"
                          title="Manage Rules"
                        >
                          <Sliders className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRevokeKey(key.id)}
                          className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                          title="Revoke key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-accent/10 border border-accent/20 rounded-2xl p-5 flex gap-4">
        <ShieldAlert className="w-6 h-6 text-accent shrink-0" />
        <div className="text-sm text-text-secondary">
          <p className="font-semibold text-text-primary mb-1">Security Best Practices</p>
          <p>Treat your API keys like passwords. Never commit them to source control or share them in client-side code (like frontend apps). If a key is compromised, revoke it immediately and generate a new one.</p>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border p-6 rounded-2xl w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-text-primary mb-2">Create API Key</h3>
              <p className="text-text-secondary text-sm mb-6">Give your key a descriptive name so you know where it's being used.</p>
              
              <form onSubmit={handleCreateKey}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">Key Name</label>
                  <input 
                    type="text" 
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production Backend Service"
                    className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors placeholder:text-text-muted"
                    autoFocus
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-3">Allowed APIs (Scopes)</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedScopes.includes('storage')}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedScopes([...selectedScopes, 'storage']);
                          else setSelectedScopes(selectedScopes.filter(s => s !== 'storage'));
                        }}
                        className="w-5 h-5 accent-accent bg-void border-border rounded"
                      />
                      <div>
                        <p className="font-medium text-text-primary text-sm">Zancrypt Storage</p>
                        <p className="text-xs text-text-secondary">Upload, download, and manage files in the vault</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl cursor-pointer hover:border-accent/50 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={selectedScopes.includes('share')}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedScopes([...selectedScopes, 'share']);
                          else setSelectedScopes(selectedScopes.filter(s => s !== 'share'));
                        }}
                        className="w-5 h-5 accent-accent bg-void border-border rounded"
                      />
                      <div>
                        <p className="font-medium text-text-primary text-sm">Zancrypt Share</p>
                        <p className="text-xs text-text-secondary">Create and manage secure file sharing links</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-3">Application Restrictions</label>
                  <select 
                    value={restrictionType} 
                    onChange={e => setRestrictionType(e.target.value)}
                    className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="none">None (Allow any application)</option>
                    <option value="ios">iOS Apps</option>
                    <option value="android">Android Apps</option>
                  </select>
                </div>
                
                {restrictionType === 'ios' && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-text-primary mb-2">iOS Bundle ID</label>
                    <input 
                      type="text" 
                      value={iosBundleId}
                      onChange={(e) => setIosBundleId(e.target.value)}
                      placeholder="e.g. com.zancrypt.ios"
                      className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
                      required={restrictionType === 'ios'}
                    />
                  </div>
                )}
                
                {restrictionType === 'android' && (
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">Android Package Name</label>
                      <input 
                        type="text" 
                        value={androidPackage}
                        onChange={(e) => setAndroidPackage(e.target.value)}
                        placeholder="e.g. com.zancrypt.android"
                        className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
                        required={restrictionType === 'android'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">SHA-1 Certificate Fingerprint</label>
                      <input 
                        type="text" 
                        value={androidSha}
                        onChange={(e) => setAndroidSha(e.target.value)}
                        placeholder="e.g. 5E:8F:16:06:2E:A3:CD..."
                        className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent font-mono text-sm transition-colors"
                        required={restrictionType === 'android'}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isCreating}
                    className="px-5 py-2 bg-accent hover:opacity-90 disabled:opacity-50 text-void rounded-xl font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(79,255,176,0.3)]"
                  >
                    {isCreating ? 'Creating...' : 'Create Key'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Manage Rules Modal */}
      <AnimatePresence>
        {isRulesModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-void/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-border p-6 rounded-2xl w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-text-primary mb-2">API Key Rules</h3>
              <p className="text-text-secondary text-sm mb-6">Configure custom limits and expiration for <span className="text-accent font-medium">{selectedKeyForRules?.name}</span>. Leave blank for unlimited.</p>
              
              <form onSubmit={handleUpdateRules}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">Rate Limit (Requests per Minute)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={ruleRateLimit}
                    onChange={(e) => setRuleRateLimit(e.target.value)}
                    placeholder="e.g. 60"
                    className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">Max Upload Size (MB)</label>
                  <input 
                    type="number" 
                    min="1"
                    value={ruleMaxFileSize}
                    onChange={(e) => setRuleMaxFileSize(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors placeholder:text-text-muted"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-text-primary mb-2">Expiration Date (Optional)</label>
                  <input 
                    type="date" 
                    value={ruleExpiresAt}
                    onChange={(e) => setRuleExpiresAt(e.target.value)}
                    className="w-full bg-surface-raised border border-border rounded-xl px-4 py-3 text-text-primary focus:outline-none focus:border-accent transition-colors"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                
                <div className="flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsRulesModalOpen(false)}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUpdatingRules}
                    className="px-5 py-2 bg-accent hover:opacity-90 disabled:opacity-50 text-void rounded-xl font-bold transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(79,255,176,0.3)]"
                  >
                    {isUpdatingRules ? 'Saving...' : 'Save Rules'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ApiKeys;
