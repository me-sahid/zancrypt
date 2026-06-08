import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Shield, ChevronRight } from 'lucide-react';
import { pageContent } from './pageContent';

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState('intro');
  const [activePage, setActivePage] = useState('privacy-policy');
  const [expandedNav, setExpandedNav] = useState({
    'privacy': true
  });

  useEffect(() => {
    if (activePage !== 'privacy-policy') return;
    const handleScroll = () => {
      const sections = document.querySelectorAll('h2[id], h3[id]');
      let currentActive = 'intro';
      sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 120) {
          currentActive = section.id;
        }
      });
      setActiveSection(currentActive);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activePage]);

  const scrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const toggleNav = (id) => {
    setExpandedNav(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const navLinks = [
    { title: "Terms of Service", id: "termsOfService" },
    { 
      title: "Privacy Policies", 
      id: "privacy",
      items: [
        { title: "Privacy Policy", id: "privacy-policy" },
        { title: "Data Processors & Infrastructure", id: "subprocessors" },
        { title: "Cookie Policy", id: "cookies" }
      ]
    }
  ];

  const tableOfContents = [
    { title: "1. Introduction & Zero-Knowledge", id: "intro" },
    { title: "2. Information We Collect", id: "info-collect" },
    { title: "3. What We Do NOT Collect", id: "not-collect" },
    { title: "4. Cookies and Local Storage", id: "cookies-local" },
    { title: "5. Third-Party Service Providers", id: "third-party" },
    { title: "6. System Logs and Retention", id: "system-logs" },
    { title: "7. Global Privacy Compliance", id: "compliance" },
    { title: "8. Security Measures", id: "security" },
    { title: "9. Children's Privacy", id: "children" },
    { title: "10. Amendments", id: "amendments" },
    { title: "11. Contact & Grievance", id: "contact" }
  ];

  // Helper to find title of current active page
  let activePageTitle = "Privacy Policy";
  for (const link of navLinks) {
    if (link.id === activePage) activePageTitle = link.title;
    if (link.items) {
      const subItem = link.items.find(sub => sub.id === activePage);
      if (subItem) activePageTitle = subItem.title;
    }
  }

  // Get generic content if it exists in pageContent
  const genericContent = pageContent[activePage];

  return (
    <div className="min-h-screen bg-void text-text-primary selection:bg-accent/30 font-sans flex flex-col">
      {/* Top Header */}
      <header className="h-14 border-b border-border/50 flex items-center px-4 lg:px-6 sticky top-0 bg-void/90 backdrop-blur z-50">
        <div className="flex items-center gap-4 text-text-primary">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Shield className="w-6 h-6 text-accent" />
            <span className="font-semibold text-[15px]">Zancrypt Docs</span>
          </Link>
          <div className="h-4 w-px bg-border/50 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-1 text-sm text-text-secondary cursor-pointer hover:text-text-primary transition-colors">
            <span>Version: Core Vault</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 max-w-[1440px] mx-auto w-full">
        {/* Left Sidebar */}
        <aside className="hidden md:block w-[280px] shrink-0 border-r border-border/50 py-8 px-6 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto custom-scrollbar">
          <Link to="/" className="flex items-center gap-2 text-[15px] text-text-secondary hover:text-text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Application
          </Link>
          
          <div className="mb-4">
            <h2 className="font-semibold text-lg mb-2">Site Policy</h2>
          </div>

          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <div key={link.id} className="flex flex-col">
                <div 
                  onClick={() => {
                    if (link.items) {
                      toggleNav(link.id);
                    } else {
                      setActivePage(link.id);
                      window.scrollTo({ top: 0 });
                    }
                  }}
                  className={`flex items-center justify-between px-2 py-2 rounded-md text-[15px] select-none
                    cursor-pointer hover:bg-surface/50
                    ${activePage === link.id ? 'text-text-primary font-medium bg-surface/30' : (expandedNav[link.id] ? 'text-text-primary font-medium' : 'text-text-secondary hover:text-text-primary')}
                  `}
                >
                  <span>{link.title}</span>
                  {link.items && (
                    expandedNav[link.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4 opacity-70" />
                  )}
                </div>
                
                {/* Render sub-items if expanded */}
                {link.items && expandedNav[link.id] && (
                  <div className="flex flex-col mt-1 space-y-1">
                    {link.items.map(subItem => (
                      <div 
                        key={subItem.id} 
                        onClick={() => {
                          setActivePage(subItem.id);
                          window.scrollTo({ top: 0 });
                        }}
                        className={`flex items-center px-2 py-2 ml-4 rounded-md text-[15px] cursor-pointer
                          ${activePage === subItem.id
                            ? 'bg-surface-elevated text-text-primary font-medium' 
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface/30 transition-colors'}
                        `}
                      >
                        <span>{subItem.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 px-6 py-10 lg:px-12 xl:px-20 overflow-y-auto">
          <div className={`max-w-3xl ${activePage !== 'privacy-policy' ? 'mx-auto' : ''}`}>
            <div className="text-[15px] text-text-secondary mb-8 flex items-center gap-2">
              <span>Site Policy</span>
              <span>/</span>
              <span>{activePage === 'privacy-policy' ? 'Privacy Policies' : activePageTitle}</span>
              <span>/</span>
            </div>

            {activePage === 'privacy-policy' && (
              <>
                <div className="border-b border-border/50 pb-8 mb-8">
                  <h1 className="text-4xl font-bold tracking-tight mb-6">Privacy Policy</h1>
                  <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                    Zancrypt General Privacy Statement
                  </h2>
                  <p className="text-[15px] text-text-secondary">Effective date: June 9, 2026</p>
                  <p className="text-[15px] text-text-secondary mt-1">Last Updated: June 9, 2026</p>
                </div>

                <div className="prose prose-invert prose-p:text-text-secondary prose-headings:text-text-primary prose-a:text-accent prose-li:text-text-secondary prose-p:leading-[1.8] prose-p:mb-6 prose-li:mb-2 prose-ul:mb-6 max-w-none text-[16px]">
                  
                  <p><strong>Owned and Operated by:</strong> Sahid Al Hassan ("we", "us", "our", or "Zancrypt")<br />
                  <strong>Website:</strong> zancrypt.in<br />
                  <strong>Contact / Support:</strong> support@zancrypt.com | zancrypt.in/contact</p>

                  <h2 id="intro" className="scroll-mt-24 mt-12 text-2xl">1. Introduction & Our Zero-Knowledge Architecture</h2>
                  <p>Welcome to Zancrypt, a zero-knowledge distributed encrypted cloud file vault. We are committed to protecting your privacy through mathematical and architectural design.</p>
                  <p>Unlike traditional cloud storage providers, Zancrypt operates on a Zero-Knowledge model. This means all file encryption and key derivation happen client-side (directly inside your browser). We do not possess, nor can we ever access, your plaintext files, your account passwords, or your encryption keys. Even if compelled by legal authority or a security incident, it is mathematically impossible for us to decrypt your data.</p>
                  <p>By accessing or using Zancrypt, you agree to the collection and use of information in accordance with this Privacy Policy.</p>

                  <h2 id="info-collect" className="scroll-mt-24 mt-12 text-2xl">2. Information We Collect and Process</h2>
                  <p>To operate the application securely and efficiently, we process limited categories of data. This data is split into account registration information, operational metadata, and technical security logs.</p>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">A. Data Collected at Registration</h3>
                  <ul>
                    <li><strong>Full Name:</strong> Used for account personalization and user identification.</li>
                    <li><strong>Email Address:</strong> Used for account verification, system notifications, and critical account updates.</li>
                    <li><strong>WebAuthn Credential (Passkey):</strong> Stored strictly as a binary public key. Your private key never leaves your physical device/authenticator.</li>
                    <li><strong>Access Key:</strong> We store only a bcrypt hash of a SHA-256 hash of your access credential. We never store or transmit the plaintext credential.</li>
                    <li><strong>Master Key Salt:</strong> Random bytes stored to assist your browser in client-side key derivation via Argon2id.</li>
                    <li><strong>Encrypted Recovery Metadata (Optional):</strong> Completely encrypted client-side before submission; unreadable by our servers.</li>
                    <li><strong>Account Metadata:</strong> Account creation timestamp and your user role (user or admin).</li>
                  </ul>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">B. Data Collected During Use (Metadata & Vault Architecture)</h3>
                  <p>While we cannot see your files, we must maintain structural metadata to assemble your vault:</p>
                  <ul>
                    <li><strong>Uploaded File Metadata:</strong> Filename, file size, upload date, last modified timestamp, folder path location, soft-delete status, and encrypted thumbnails (if generated).</li>
                    <li><strong>Shard Registry:</strong> A mapping table indicating which distributed storage nodes hold which encrypted shards of your files, including shard sizes and provider names.</li>
                    <li><strong>Storage Usage:</strong> Total bytes utilized per account for billing and quota management.</li>
                    <li><strong>Folder Structure:</strong> Directory names, creation dates, and hierarchical layouts.</li>
                    <li><strong>Shared Links:</strong> Cryptographic tokens, expiration parameters, download permissions, and access counters.</li>
                    <li><strong>API Key Records (If Enabled):</strong> Key names, creation dates, and last-used timestamps.</li>
                  </ul>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">C. Authentication Data & Session States</h3>
                  <ul>
                    <li><strong>JWT Refresh Tokens:</strong> Stored securely to maintain active sessions (7-day Time-To-Live).</li>
                    <li><strong>WebAuthn Sign Count:</strong> An incrementing counter updated upon each successful passkey authentication to mitigate replay attacks.</li>
                    <li><strong>Session Records:</strong> User ID, session creation time, and session expiry data.</li>
                    <li><strong>Failed Login Attempts:</strong> Logged temporarily for security auditing, brute-force mitigation, and rate limiting.</li>
                  </ul>

                  <h2 id="not-collect" className="scroll-mt-24 mt-12 text-2xl">3. What We Do NOT Collect or Store</h2>
                  <p>To maintain complete transparency, the following items never touch our database or servers in a readable format:</p>
                  <ul>
                    <li><strong>Plaintext File Contents:</strong> Files are encrypted via AES-256-GCM in the browser before transmission. The server only processes unreadable ciphertext blocks.</li>
                    <li><strong>Encryption Keys:</strong> Master keys are derived client-side via Argon2id and are never transmitted to us.</li>
                    <li><strong>User Passwords:</strong> We utilize advanced cryptographic protocols (such as OPAQUE), ensuring that raw passwords never leave your browser environment.</li>
                    <li><strong>Private Cryptographic Keys:</strong> Only your public keys (WebAuthn) are retained.</li>
                  </ul>

                  <h2 id="cookies-local" className="scroll-mt-24 mt-12 text-2xl">4. Cookies and Local Storage</h2>
                  <p>We use minimal cookies strictly for essential technical functionality. We do not use tracking or advertising cookies.</p>
                  
                  <div className="overflow-x-auto my-8">
                    <table className="min-w-full border-collapse border border-border/40 text-[15px] text-left">
                      <thead className="bg-surface-elevated text-text-primary">
                        <tr>
                          <th className="border border-border/40 px-4 py-3 font-semibold">Cookie Type</th>
                          <th className="border border-border/40 px-4 py-3 font-semibold">Name</th>
                          <th className="border border-border/40 px-4 py-3 font-semibold">Purpose</th>
                          <th className="border border-border/40 px-4 py-3 font-semibold">Expiry</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-surface/30">
                          <td className="border border-border/40 px-4 py-4">HttpOnly, Secure, SameSite=None</td>
                          <td className="border border-border/40 px-4 py-4 font-mono text-[13px]">refresh_token</td>
                          <td className="border border-border/40 px-4 py-4 leading-relaxed">Maintains your authenticated login session securely.</td>
                          <td className="border border-border/40 px-4 py-4">7 Days</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <p className="p-5 bg-surface-raised border border-border/50 rounded-lg text-[15px] mt-6 leading-relaxed"><strong>Note on Access Tokens:</strong> Your JSON Web Tokens (JWT) access tokens are stored strictly within browser memory. They are never written to localStorage, sessionStorage, or cookies, safeguarding them against Cross-Site Scripting (XSS) extraction.</p>

                  <h2 id="third-party" className="scroll-mt-24 mt-12 text-2xl">5. Third-Party Service Providers (Data Processors)</h2>
                  <p>We rely on specialized infrastructure providers to host and secure our application. These third parties act as Data Processors under global privacy laws.</p>
                  
                  <h3 className="mt-8 mb-4 font-semibold text-xl">Hosting & Core Backend:</h3>
                  <ul>
                    <li><strong>Render.com:</strong> Hosts our FastAPI backend. Processes API requests and retains technical system logs.</li>
                    <li><strong>Cloudflare Pages:</strong> Hosts our React frontend, serving static files globally.</li>
                    <li><strong>Cloudflare:</strong> Provides CDN routing, Web Application Firewall (WAF), DDoS protection, and Zero Trust Tunnels. Cloudflare processes request metadata (IP addresses, headers, timestamps) but cannot view your encrypted files.</li>
                    <li><strong>Neon / Supabase:</strong> Managed PostgreSQL database hosting your account registry, metadata, and active session tables.</li>
                    <li><strong>Upstash:</strong> Serverless Redis database used to track WebAuthn challenge states, rate limits, and short-term authentication variables.</li>
                  </ul>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">Distributed Storage Nodes (Ciphertext Only):</h3>
                  <p>When you upload a file, your browser splits it into encrypted shards using Shamir's Secret Sharing and Reed-Solomon RS(4,1) erasure coding. These completely encrypted, unreadable binary blocks are distributed across the following environments:</p>
                  <ul>
                    <li>AWS S3 (Region: us-east-1)</li>
                    <li>Cloudflare R2 (Global Network)</li>
                    <li>MinIO (Self-hosted infrastructure)</li>
                    <li>Backblaze B2 (Region: us-west-004)</li>
                    <li>Storj / Local NAS (Distributed parity network)</li>
                  </ul>
                  <p>None of these storage providers can read, piece together, or interpret your data, as they only host separate encrypted binary fragments.</p>

                  <h2 id="system-logs" className="scroll-mt-24 mt-12 text-2xl">6. System Logs and Data Retention</h2>
                  
                  <h3 className="mt-8 mb-4 font-semibold text-xl">Technical Logs Collected:</h3>
                  <p>For security auditing, rate limiting (via SlowAPI), and debugging, our servers automatically capture:</p>
                  <ul>
                    <li>Structured JSON request logs (HTTP method, URI path, HTTP status, execution time).</li>
                    <li>Authentication audit logs (success/failure events, session creation/termination).</li>
                    <li>OpenTelemetry traces and Prometheus performance metrics (infrastructure monitoring).</li>
                    <li>IP Addresses: Captured explicitly for security operations and blocking malicious requests.</li>
                  </ul>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">Data Retention Periods:</h3>
                  <ul>
                    <li><strong>User Vault Files:</strong> Retained indefinitely until explicitly deleted by you, or until you initiate account termination.</li>
                    <li><strong>Soft-Deleted Files:</strong> Marked as is_deleted=true and preserved for a temporary window of 30 days to permit recovery before being permanently purged.</li>
                    <li><strong>Session Refresh Tokens:</strong> Expire and purge automatically after 7 days.</li>
                    <li><strong>WebAuthn Challenge Sessions:</strong> Expire and purge out of Redis after 5 minutes.</li>
                    <li><strong>Audit Logs:</strong> Retained for a maximum of 365 days (1 year) for security auditing and legal compliance, after which they are automatically purged unless required for an active investigation.</li>
                  </ul>

                  <h2 id="compliance" className="scroll-mt-24 mt-12 text-2xl">7. Global Privacy Compliance & User Rights</h2>
                  <p>Zancrypt operates globally and complies with major regional data protection frameworks, including the EU General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and the Indian Digital Personal Data Protection Act, 2023 (DPDP Act) along with the Information Technology Act, 2000.</p>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">A. Your Core Privacy Rights</h3>
                  <p>Regardless of your location, you can invoke the following controls directly inside the application interface or by contacting us:</p>
                  <ul>
                    <li><strong>Right to Access & View:</strong> You maintain full visibility of your profile information and metadata via the dashboard.</li>
                    <li><strong>Right to Rectification:</strong> You can update your full name at any time through your profile settings.</li>
                    <li><strong>Right to Erasure (Account Deletion):</strong> Initiating an account deletion permanently purges your user record, credentials, active sessions, metadata, and all distributed file shards from all storage nodes.</li>
                    <li><strong>Right to Data Portability:</strong> You may request a copy of your account data (name, email, metadata) in JSON or CSV format for transfer to another service.</li>
                    <li><strong>Right to Revoke Authentication:</strong> Users can manage and request the revocation of associated passkeys.</li>
                  </ul>
                  <p><strong>Withdrawal of Consent:</strong> Where we rely on your consent for processing (e.g., optional recovery metadata, notifications), you may withdraw consent at any time by emailing support@zancrypt.com. Withdrawal does not affect the lawfulness of processing before withdrawal.</p>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">B. European Union (GDPR) Notices</h3>
                  <ul>
                    <li><strong>Legal Basis for Processing:</strong> We process your personal data to perform our contractual obligations to you (providing the file vault service) and based on our legitimate interests (maintaining infrastructure security and rate limiting).</li>
                    <li><strong>Data Cross-Border Transfers:</strong> Your metadata and session records are stored on primary cloud databases (Neon, Supabase, Upstash) primarily located within the United States. We utilize Standard Contractual Clauses (SCCs) and partner only with vendors maintaining high security standards.</li>
                    <li><strong>No Automated Decision-Making:</strong> We do not use automated decision-making or profiling that produces legal effects concerning you.</li>
                  </ul>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">C. United States (CCPA/CPRA) Notices</h3>
                  <ul>
                    <li>We do not sell your personal data, nor do we "share" your personal data for cross-context behavioral advertising.</li>
                    <li>You have the right to request a disclosure of data collected and the right to non-discrimination for exercising your rights.</li>
                  </ul>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">D. India (DPDP Act, 2023 & IT Act) Compliance</h3>
                  <p>As an entity handling digital personal data in India, Zancrypt complies with the Digital Personal Data Protection Act, 2023:</p>
                  <ul>
                    <li><strong>Consent:</strong> By creating an account, you provide unambiguous, specific, and clear consent for processing your Name, Email, and necessary authentication parameters for operating the vault.</li>
                    <li><strong>Data Fiduciary:</strong> Zancrypt acts as the Data Fiduciary for account profile data.</li>
                    <li><strong>Grievance Redressal Mechanism:</strong> If you have any complaints or compliance questions regarding the management of your personal data, you may reach out directly to our designated Grievance Officer (see Section 11).</li>
                  </ul>

                  <h2 id="security" className="scroll-mt-24 mt-12 text-2xl">8. Security Measures</h2>
                  <p>We enforce rigorous technical safeguards across our distributed stack:</p>
                  <ul>
                    <li>Client-Side AES-256-GCM Encryption on all user files.</li>
                    <li>Argon2id Key Derivation adhering strictly to OWASP sensitive parameters.</li>
                    <li>Shamir's Secret Sharing & Erasure Coding: Master keys are split across 5 independent storage points, requiring a threshold of any 3 nodes to reconstruct.</li>
                    <li>Hardware-Bound FIDO2/WebAuthn Passkeys to mitigate phishing risks.</li>
                    <li>Robust Server Security: Strict Content Security Policies (CSP), Frame Options protection, HSTS forced routing, mTLS between internal microservices, and automated rate limiting via SlowAPI.</li>
                  </ul>

                  <h2 id="children" className="scroll-mt-24 mt-12 text-2xl">9. Children's Privacy</h2>
                  <p>Zancrypt does not implement explicit age verification mechanisms at registration. However, our services are strictly not directed to, or intended for, children under the age of 13 (or the equivalent minimum age in relevant jurisdictions, such as 18 in India without parental consent). If we discover that we have inadvertently collected personal data from a child without verifiable authorization, we will purge that data immediately.</p>

                  <h2 id="amendments" className="scroll-mt-24 mt-12 text-2xl">10. Amendments to This Policy</h2>
                  <p>We reserve the right to revise this Privacy Policy at any time. If material changes are implemented, we will notify you via the email address linked to your account or through a prominent notice on the application dashboard prior to the modifications becoming effective.</p>

                  <h2 id="contact" className="scroll-mt-24 mt-12 text-2xl">11. Contact & Grievance Redressal</h2>
                  <p>For general privacy inquiries, data rights execution, or specific legal questions, please reach out to our team:</p>
                  <p>
                    <strong>Support Email:</strong> support@zancrypt.com<br />
                    <strong>Contact Form:</strong> <a href="https://zancrypt.in/contact" className="hover:text-accent/80 transition-colors">https://zancrypt.in/contact</a>
                  </p>
                  
                  <p><strong>For India (DPDP Act Grievance Officer):</strong><br />
                  Pursuant to the Digital Personal Data Protection Act, 2023, you may contact our Grievance Redressal Officer directly regarding data concerns:</p>
                  
                  <p className="mb-12">
                    <strong>Name:</strong> Sahid Al Hassan<br />
                    <strong>Email:</strong> support@zancrypt.com (subject line: “ATTN: Grievance Officer”)<br />
                    <strong>Physical Address:</strong> Murarai, Birbhum, West Bengal, 731219, India<br />
                    <strong>Response Time:</strong> We acknowledge complaints within 5 working days and resolve them within 30 days, as required by the DPDP Act.
                  </p>
                </div>
              </>
            )}

            {activePage === 'cookies' && (
              <div className="border-border/50 pb-8 mb-8 animate-in fade-in duration-300">
                <h1 className="text-4xl font-bold tracking-tight mb-6">Cookie Policy</h1>
                <div className="prose prose-invert prose-p:text-text-secondary prose-headings:text-text-primary prose-a:text-accent prose-li:text-text-secondary prose-p:leading-[1.8] prose-p:mb-6 max-w-none text-[16px]">
                  <p>We use minimal cookies strictly for essential technical functionality. We do not use tracking or advertising cookies.</p>
                  
                  <div className="overflow-x-auto my-8">
                    <table className="min-w-full border-collapse border border-border/40 text-[15px] text-left">
                      <thead className="bg-surface-elevated text-text-primary">
                        <tr>
                          <th className="border border-border/40 px-4 py-3 font-semibold">Cookie Type</th>
                          <th className="border border-border/40 px-4 py-3 font-semibold">Name</th>
                          <th className="border border-border/40 px-4 py-3 font-semibold">Purpose</th>
                          <th className="border border-border/40 px-4 py-3 font-semibold">Expiry</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-surface/30">
                          <td className="border border-border/40 px-4 py-4">HttpOnly, Secure, SameSite=None</td>
                          <td className="border border-border/40 px-4 py-4 font-mono text-[13px]">refresh_token</td>
                          <td className="border border-border/40 px-4 py-4 leading-relaxed">Maintains your authenticated login session securely.</td>
                          <td className="border border-border/40 px-4 py-4">7 Days</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  <p className="p-5 bg-surface-raised border border-border/50 rounded-lg text-[15px] mt-6 leading-relaxed"><strong>Note on Access Tokens:</strong> Your JSON Web Tokens (JWT) access tokens are stored strictly within browser memory. They are never written to localStorage, sessionStorage, or cookies, safeguarding them against Cross-Site Scripting (XSS) extraction.</p>
                </div>
              </div>
            )}

            {activePage === 'subprocessors' && (
              <div className="border-border/50 pb-8 mb-8 animate-in fade-in duration-300">
                <h1 className="text-4xl font-bold tracking-tight mb-6">Data Processors & Infrastructure</h1>
                <div className="prose prose-invert prose-p:text-text-secondary prose-headings:text-text-primary prose-a:text-accent prose-li:text-text-secondary prose-p:leading-[1.8] prose-p:mb-6 max-w-none text-[16px]">
                  <p>We rely on specialized infrastructure providers to host and secure our application. These third parties act as Data Processors under global privacy laws.</p>
                  
                  <h3 className="mt-8 mb-4 font-semibold text-xl">Hosting & Core Backend:</h3>
                  <ul className="mb-8">
                    <li><strong>Render.com:</strong> Hosts our FastAPI backend. Processes API requests and retains technical system logs.</li>
                    <li><strong>Cloudflare Pages:</strong> Hosts our React frontend, serving static files globally.</li>
                    <li><strong>Cloudflare:</strong> Provides CDN routing, Web Application Firewall (WAF), DDoS protection, and Zero Trust Tunnels. Cloudflare processes request metadata (IP addresses, headers, timestamps) but cannot view your encrypted files.</li>
                    <li><strong>Neon / Supabase:</strong> Managed PostgreSQL database hosting your account registry, metadata, and active session tables.</li>
                    <li><strong>Upstash:</strong> Serverless Redis database used to track WebAuthn challenge states, rate limits, and short-term authentication variables.</li>
                  </ul>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">Distributed Storage Nodes (Ciphertext Only):</h3>
                  <p>When you upload a file, your browser splits it into encrypted shards using Shamir's Secret Sharing and Reed-Solomon RS(4,1) erasure coding. These completely encrypted, unreadable binary blocks are distributed across the following environments:</p>
                  <ul>
                    <li>AWS S3 (Region: us-east-1)</li>
                    <li>Cloudflare R2 (Global Network)</li>
                    <li>MinIO (Self-hosted infrastructure)</li>
                    <li>Backblaze B2 (Region: us-west-004)</li>
                    <li>Storj / Local NAS (Distributed parity network)</li>
                  </ul>
                  <p>None of these storage providers can read, piece together, or interpret your data, as they only host separate encrypted binary fragments.</p>
                </div>
              </div>
            )}

            {activePage !== 'privacy-policy' && activePage !== 'cookies' && activePage !== 'subprocessors' && (
              <div className="border-border/50 pb-8 mb-8 animate-in fade-in duration-300">
                <h1 className="text-4xl font-bold tracking-tight mb-6">{genericContent ? genericContent.title : activePageTitle}</h1>
                {genericContent?.subtitle && (
                  <p className="text-xl text-text-secondary mb-10">{genericContent.subtitle}</p>
                )}
                
                <div className="prose prose-invert prose-p:text-text-secondary prose-headings:text-text-primary prose-a:text-accent prose-li:text-text-secondary prose-p:leading-[1.8] prose-p:mb-6 max-w-none text-[16px]">
                  {genericContent ? (
                    genericContent.content.map((paragraph, idx) => (
                      <p key={idx}>{paragraph}</p>
                    ))
                  ) : (
                    <p>The detailed policies for <strong>{activePageTitle}</strong> are currently being updated and will be published shortly. If you have immediate questions regarding our policies, please contact our support team.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - In this article (ONLY shown on privacy policy page) */}
        {activePage === 'privacy-policy' && (
          <aside className="hidden lg:block w-[280px] xl:w-[320px] shrink-0 py-10 pr-6 pl-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="mb-4 text-xs font-semibold uppercase tracking-wider text-text-primary">
              In this article
            </div>
            <nav className="flex flex-col border-l border-border/50 relative">
              <div 
                className="absolute left-[-1px] w-[2px] bg-accent transition-all duration-300"
                style={{
                  top: `${Math.max(0, tableOfContents.findIndex(item => item.id === activeSection) * 32)}px`,
                  height: '32px',
                  opacity: activeSection ? 1 : 0
                }}
              />
              {tableOfContents.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => scrollToSection(e, item.id)}
                  className={`px-4 py-1.5 text-[15px] h-8 flex items-center transition-colors ${
                    activeSection === item.id 
                      ? 'text-text-primary font-medium' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <span className="truncate">{item.title}</span>
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>
    </div>
  );
};

export default PrivacyPolicy;
