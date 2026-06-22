import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Shield, ChevronRight } from 'lucide-react';
import { pageContent } from './pageContent';

const PrivacyPolicy = () => {
  const location = useLocation();
  const initialPage = location.pathname.includes('terms-of-service') ? 'termsOfService' : 'privacy-policy';
  const [activeSection, setActiveSection] = useState('intro');
  const [activePage, setActivePage] = useState(initialPage);
  const [expandedNav, setExpandedNav] = useState({
    'privacy': true
  });

  useEffect(() => {
    if (activePage !== 'privacy-policy' && activePage !== 'termsOfService') return;
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

  const tableOfContents = activePage === 'termsOfService' ? [
    { title: "1. Intro & Acceptance", id: "tos-intro" },
    { title: "2. Description of Service", id: "tos-desc" },
    { title: "3. Eligibility & Age", id: "tos-age" },
    { title: "4. Account Registration", id: "tos-acct" },
    { title: "5. User Obligations", id: "tos-obligations" },
    { title: "6. Content Ownership", id: "tos-ownership" },
    { title: "7. Intellectual Property", id: "tos-ip" },
    { title: "8. Data Processing", id: "tos-data" },
    { title: "9. API Access", id: "tos-api" },
    { title: "10. Fees", id: "tos-fees" },
    { title: "11. Termination", id: "tos-termination" },
    { title: "12. Disclaimers", id: "tos-disclaimers" },
    { title: "13. Limitations", id: "tos-limitations" },
    { title: "14. Indemnification", id: "tos-indemnity" },
    { title: "15. Dispute Resolution", id: "tos-disputes" },
    { title: "22. Contact", id: "tos-contact" }
  ] : [
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

            {activePage === 'termsOfService' && (
              <div className="border-border/50 pb-8 mb-8 animate-in fade-in duration-300">
                <div className="border-b border-border/50 pb-8 mb-8">
                  <h1 className="text-4xl font-bold tracking-tight mb-6">Terms of Service</h1>
                  <h2 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                    Zancrypt User Agreement
                  </h2>
                  <p className="text-[15px] text-text-secondary">Effective Date: June 9, 2026</p>
                  <p className="text-[15px] text-text-secondary mt-1">Last Updated: June 23, 2026</p>
                </div>

                <div className="prose prose-invert prose-p:text-text-secondary prose-headings:text-text-primary prose-a:text-accent prose-li:text-text-secondary prose-p:leading-[1.8] prose-p:mb-6 prose-li:mb-2 prose-ul:mb-6 max-w-none text-[16px]">
                  <p><strong>Owned and Operated by:</strong> Sahid Al Hassan ("we", "us", "our", or "Zancrypt")<br />
                  <strong>Website:</strong> zancrypt.in<br />
                  <strong>Contact / Support:</strong> support@zancrypt.in | zancrypt.in/contact</p>

                  <h2 id="tos-intro" className="scroll-mt-24 mt-12 text-2xl">1. INTRODUCTION AND ACCEPTANCE</h2>
                  <p>Welcome to Zancrypt, a zero-knowledge distributed encrypted cloud file vault. By accessing or using our website (zancrypt.in) and the Zancrypt web application (collectively, the "Service"), you agree to be bound by these Terms of Service (the "Terms").</p>
                  <p>These Terms constitute a legally binding agreement between you ("User", "you", or "your") and Zancrypt. If you do not agree to these Terms, you may not access or use the Service.</p>
                  <p>We reserve the right to modify these Terms at any time. Any material changes will be communicated to you via email or through a prominent notice within the Service. Your continued use of the Service after such modifications constitutes your acceptance of the updated Terms.</p>

                  <h2 id="tos-desc" className="scroll-mt-24 mt-12 text-2xl">2. DESCRIPTION OF THE SERVICE</h2>
                  <p>Zancrypt is a secure, distributed file storage vault built on a zero-knowledge architecture.</p>
                  <p>Key characteristics of the Service:</p>
                  <ul>
                    <li>All file encryption and decryption occur client-side (within your browser) using <strong>AES-256-GCM</strong> encryption.</li>
                    <li>Your encryption keys are derived locally using Argon2id and never transmitted to our servers.</li>
                    <li>Files are split into encrypted shards and distributed across multiple independent storage nodes (Backblaze B2, Supabase Storage, and Storj) for redundancy and availability.</li>
                    <li>We never have access to your plaintext files, your encryption keys, or your passwords.</li>
                    <li>Authentication is performed using FIDO2/WebAuthn passkeys, which rely on your device's hardware authenticator.</li>
                  </ul>
                  <p>The Service is provided "as is" and "as available" and is intended for lawful personal and business file storage. You are solely responsible for maintaining the confidentiality of your access credentials and for all activities that occur under your account.</p>

                  <h2 id="tos-age" className="scroll-mt-24 mt-12 text-2xl">3. ELIGIBILITY AND AGE RESTRICTION</h2>
                  <p>By using Zancrypt, you represent and warrant that:</p>
                  <ul>
                    <li>You are at least 18 years of age (or the age of majority in your jurisdiction). Specifically, under India's Digital Personal Data Protection Act, 2023 (DPDP Act), you must be at least 18 years old to register without parental consent. If you are between 13 and 18 and reside outside India (e.g., in the EU or US), you must have obtained verifiable parental or legal guardian consent to use the Service.</li>
                    <li>You are not located in a country that is subject to a U.S. or Indian government embargo, or that has been designated as a "terrorist-supporting" country.</li>
                    <li>You are not listed on any government list of prohibited or restricted parties.</li>
                    <li>You have the legal capacity to enter into this binding agreement.</li>
                  </ul>
                  <p>The Service is not directed at children under the age of 13 globally. If we discover that we have inadvertently collected personal information from a child under 13 without parental consent, we will delete that information immediately.</p>

                  <h2 id="tos-acct" className="scroll-mt-24 mt-12 text-2xl">4. ACCOUNT REGISTRATION AND SECURITY</h2>
                  <p>To use Zancrypt, you must register an account. During registration, you will provide:</p>
                  <ul>
                    <li>Your full name</li>
                    <li>A valid email address</li>
                    <li>A WebAuthn passkey (public key) registered from your device</li>
                  </ul>
                  <p>Your account is protected by the passkey registered on your device. You are responsible for:</p>
                  <ul>
                    <li>Maintaining the security and confidentiality of your device and authenticator.</li>
                    <li>Notifying us immediately of any unauthorized use of your account or any other security breach.</li>
                    <li>Ensuring that you log out of your account at the end of each session (though the Service automatically expires sessions after 7 days of inactivity).</li>
                  </ul>
                  <p>We cannot and will not be liable for any loss or damage arising from your failure to comply with these security obligations.</p>
                  <p className="p-5 bg-surface-raised border border-border/50 rounded-lg text-[15px] mt-6 leading-relaxed"><strong>IMPORTANT NOTE:</strong> Because Zancrypt uses zero-knowledge encryption, we cannot reset your access or recover your data if you lose your passkey or device. There is no "password reset" mechanism. Your data is mathematically unrecoverable without your passkey. Please ensure you back up your passkey or recovery metadata if you enable that feature.</p>

                  <h2 id="tos-obligations" className="scroll-mt-24 mt-12 text-2xl">5. USER OBLIGATIONS AND ACCEPTABLE USE</h2>
                  <p>You agree to use Zancrypt only for lawful purposes and in a manner that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the Service.</p>
                  <p>Prohibited activities include, but are not limited to:</p>
                  <h3 className="mt-8 mb-4 font-semibold text-xl">a) Illegal Content: Uploading, storing, sharing, or transmitting any content that:</h3>
                  <ul>
                    <li>Violates any applicable local, state, national, or international law or regulation.</li>
                    <li>Promotes or incites violence, terrorism, hate speech, or discrimination.</li>
                    <li>Contains child sexual abuse material (CSAM) or any form of exploitation of minors.</li>
                    <li>Depicts or promotes non-consensual sexual acts, revenge porn, or extreme gore.</li>
                    <li>Constitutes defamation, harassment, or invasion of privacy.</li>
                  </ul>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">b) Malicious Activity:</h3>
                  <ul>
                    <li>Uploading files containing viruses, trojans, worms, logic bombs, or other malicious code.</li>
                    <li>Attempting to gain unauthorized access to the Service, its underlying infrastructure, or other users' accounts.</li>
                    <li>Engaging in denial-of-service (DoS) attacks or any activity that disrupts or degrades the Service.</li>
                    <li>Reverse engineering, decompiling, or disassembling any part of the Service.</li>
                  </ul>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">c) Unauthorized Commercial Use:</h3>
                  <ul>
                    <li>Using the Service to host or distribute content for commercial purposes without our prior written consent (except for individual or business internal use).</li>
                    <li>Reselling, sublicensing, or redistributing the Service to third parties.</li>
                  </ul>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">d) Misuse of Sharing Features:</h3>
                  <ul>
                    <li>Sharing malicious or deceptive links that impersonate other services.</li>
                    <li>Creating share links with the intent to circumvent content moderation or access controls.</li>
                  </ul>
                  <p>We reserve the right to suspend or terminate your account immediately, without prior notice, if we suspect (in our sole discretion) that you have violated any of these acceptable use provisions.</p>

                  <h2 id="tos-ownership" className="scroll-mt-24 mt-12 text-2xl">6. CONTENT OWNERSHIP AND LICENSE</h2>
                  <h3 className="mt-8 mb-4 font-semibold text-xl">A. Your Content</h3>
                  <p>You retain all ownership rights to the files, data, and metadata you upload, store, and share through Zancrypt ("Your Content"). We do not claim any ownership over Your Content.</p>
                  
                  <h3 className="mt-8 mb-4 font-semibold text-xl">B. License to Zancrypt</h3>
                  <p>To operate the Service, we require a limited, non-exclusive, royalty-free, worldwide license to process Your Content solely for the purpose of providing the Service. This license includes:</p>
                  <ul>
                    <li>The right to store, replicate, and distribute encrypted shards across our storage nodes (Backblaze B2, Supabase Storage, Storj).</li>
                    <li>The right to transmit Your Content across our network for the purpose of upload, download, and sharing.</li>
                    <li>The right to generate metadata (filename, size, timestamps) to organize and display your vault.</li>
                  </ul>
                  <p>This license is strictly limited to the operation of the Service and terminates immediately upon your deletion of the content or your account termination.</p>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">C. No Access or Use of Plaintext</h3>
                  <p>We explicitly acknowledge and agree that we do not have, and never shall have, access to the plaintext or unencrypted versions of Your Content. The license granted above applies only to encrypted ciphertext and technical metadata.</p>
                  
                  <h3 className="mt-8 mb-4 font-semibold text-xl">D. User Feedback</h3>
                  <p>If you provide us with suggestions, ideas, or feedback regarding the Service ("Feedback"), you grant us a perpetual, irrevocable, worldwide, royalty-free license to use, modify, and incorporate that Feedback into the Service without any obligation to you.</p>

                  <h2 id="tos-ip" className="scroll-mt-24 mt-12 text-2xl">7. INTELLECTUAL PROPERTY RIGHTS</h2>
                  <p>All intellectual property rights in the Zancrypt Service, including but not limited to the software, website design, user interface, graphics, logos, trademarks (including "Zancrypt"), and underlying source code, are owned by us or our licensors.</p>
                  <p>You are granted a limited, non-transferable, revocable license to use the Service for your personal or internal business purposes. You may not:</p>
                  <ul>
                    <li>Copy, modify, or create derivative works of the Service, except as permitted by applicable law.</li>
                    <li>Remove or alter any proprietary notices or marks on the Service.</li>
                    <li>Use our trademarks or logos without our prior written permission.</li>
                  </ul>

                  <h2 id="tos-data" className="scroll-mt-24 mt-12 text-2xl">8. DATA PROCESSING AND PRIVACY</h2>
                  <p>Your privacy is critically important to us. Our collection, use, and retention of your personal data (name, email, authentication data, metadata, and logs) are governed by our Privacy Policy, which is incorporated by reference into these Terms.</p>
                  <p>By using the Service, you consent to the data processing practices described in our Privacy Policy, including:</p>
                  <ul>
                    <li>The storage of your account data on PostgreSQL (Neon/Supabase).</li>
                    <li>The distribution of encrypted shards across third-party storage providers (Backblaze B2, Supabase Storage, Storj).</li>
                    <li>The capture of IP addresses, request logs, and authentication audit trails.</li>
                  </ul>
                  <p>Please review our Privacy Policy carefully. It explains your rights under GDPR, CCPA, and the Indian DPDP Act, including your rights to access, rectify, delete, and port your data.</p>
                  
                  <h3 className="mt-8 mb-4 font-semibold text-xl">8A. DATA BREACH NOTIFICATION</h3>
                  <p>We take data security seriously. In the event of a data breach that compromises your personal data:</p>
                  <ul>
                    <li>We will notify you and the relevant supervisory authority within 72 hours of becoming aware of the breach, as required under Article 33 of the GDPR.</li>
                    <li>For users in India, we will notify the Data Protection Board of India and affected users within the timeframe prescribed under the Digital Personal Data Protection Act, 2023.</li>
                    <li>The notification will describe, to the extent possible, the nature of the breach, the categories of data affected, and the measures taken to mitigate the risks.</li>
                  </ul>

                  <h2 id="tos-api" className="scroll-mt-24 mt-12 text-2xl">9. API ACCESS (IF ENABLED)</h2>
                  <p>Zancrypt may offer API (Application Programming Interface) access to users with valid API keys. By using the API, you agree to the following additional terms:</p>
                  <ul>
                    <li><strong>API Keys</strong>: You are responsible for maintaining the confidentiality of your API keys. Do not share them publicly or embed them in client-side code.</li>
                    <li><strong>Rate Limits</strong>: API requests are subject to rate limiting to ensure service stability. Excessive usage may result in temporary suspension of your API access.</li>
                    <li><strong>Permitted Use</strong>: The API may only be used to integrate with and extend the functionality of your Zancrypt account. It may not be used to scrape, crawl, or perform automated bulk operations that degrade the Service.</li>
                    <li><strong>Misuse</strong>: We reserve the right to revoke or rotate API keys at any time if we detect unauthorized, abusive, or malicious activity.</li>
                    <li><strong>Changes</strong>: We may deprecate or update API endpoints. We will provide reasonable notice before making breaking changes.</li>
                  </ul>

                  <h2 id="tos-fees" className="scroll-mt-24 mt-12 text-2xl">10. FEES AND SUBSCRIPTIONS</h2>
                  <p>Currently, Zancrypt is provided as a free service with no fees for account registration or storage usage.</p>
                  <p>We reserve the right to introduce paid tiers, subscription plans, usage-based fees, or storage quotas in the future. If we introduce fees or materially change the pricing model, we will provide you with at least 30 days' prior notice via email and/or a prominent notice within the Service. You will have the option to cancel your account before any charges apply. Continued use after the fee implementation constitutes your acceptance of the new pricing structure.</p>

                  <h2 id="tos-termination" className="scroll-mt-24 mt-12 text-2xl">11. TERMINATION AND SUSPENSION</h2>
                  <h3 className="mt-8 mb-4 font-semibold text-xl">A. Termination by You</h3>
                  <p>You may terminate your account at any time and for any reason by initiating account deletion through your dashboard or by contacting support@zancrypt.in. Upon termination:</p>
                  <ul>
                    <li>Your user record, metadata, and all associated encrypted shards will be permanently purged from our systems and storage nodes.</li>
                    <li>This action is irreversible. We cannot recover your data after termination.</li>
                  </ul>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">B. Termination by Us (Including Inactivity)</h3>
                  <p>We may suspend or terminate your access to the Service immediately, without prior notice or liability, for any reason, including but not limited to:</p>
                  <ul>
                    <li>Breach of these Terms (including Acceptable Use provisions).</li>
                    <li>Suspicion of illegal or fraudulent activity.</li>
                    <li>Non-payment of fees (if applicable in the future).</li>
                  </ul>
                  <p><strong>Inactivity Deletion</strong>: To comply with the DPDP Act's storage limitation principle, if your account has been <strong>completely inactive for 12 consecutive months</strong> (no logins, no uploads, no file access), we will consider it dormant. We will send a warning email to your registered address 30 days prior to deletion. If you do not log in during that 30-day window, we will permanently delete your account and all associated data. This ensures we do not retain personal data longer than necessary.</p>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">C. Effect of Termination</h3>
                  <p>Upon termination:</p>
                  <ul>
                    <li>Your right to use the Service ceases immediately.</li>
                    <li>We will delete your account and all associated data within a reasonable timeframe, subject to legal retention obligations.</li>
                    <li>Sections that by their nature should survive termination shall survive, including: Content Ownership, Intellectual Property, Disclaimers, Limitation of Liability, Governing Law, and Dispute Resolution.</li>
                  </ul>

                  <h2 id="tos-disclaimers" className="scroll-mt-24 mt-12 text-2xl">12. DISCLAIMER OF WARRANTIES</h2>
                  <p>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT ANY WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO:</p>
                  <ul>
                    <li>IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.</li>
                    <li>WARRANTIES REGARDING THE RELIABILITY, ACCURACY, AVAILABILITY, OR SECURITY OF THE SERVICE.</li>
                    <li>WARRANTIES THAT THE SERVICE WILL MEET YOUR REQUIREMENTS OR BE ERROR-FREE, UNINTERRUPTED, OR FREE OF VIRUSES.</li>
                  </ul>
                  <p><strong>ZERO-KNOWLEDGE DISCLAIMER</strong>: ZANCRYPT CANNOT AND WILL NOT BE ABLE TO DECRYPT YOUR FILES UNDER ANY CIRCUMSTANCES, INCLUDING LEGAL COMPULSION OR GOVERNMENT REQUESTS. IF YOU LOSE YOUR PASSKEY OR PHYSICAL DEVICE, YOUR DATA IS PERMANENTLY UNRECOVERABLE. THIS IS A MATHEMATICAL GUARANTEE, NOT A LIMITATION OF SERVICE. YOU ASSUME ALL RISK ASSOCIATED WITH THE USE OF THE SERVICE, INCLUDING THE SOLE RISK OF DATA LOSS DUE TO LOSS OF YOUR PASSKEY, HARDWARE FAILURE, OR OTHER EVENTS BEYOND OUR CONTROL.</p>

                  <h2 id="tos-limitations" className="scroll-mt-24 mt-12 text-2xl">13. LIMITATION OF LIABILITY</h2>
                  <p>TO THE FULLEST EXTENT PERMITTED BY LAW, ZANCRYPT, ITS OWNER, AND ITS AFFILIATES SHALL NOT BE LIABLE FOR:</p>
                  <h3 className="mt-8 mb-4 font-semibold text-xl">A. ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES</h3>
                  <p>INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, LOSS OF DATA, LOSS OF GOODWILL, OR COSTS OF PROCUREMENT OF SUBSTITUTE SERVICES, ARISING OUT OF OR RELATING TO THESE TERMS OR THE USE OF THE SERVICE, WHETHER BASED ON CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR OTHER LEGAL THEORY.</p>
                  
                  <h3 className="mt-8 mb-4 font-semibold text-xl">B. ANY LOSS OR DAMAGE RESULTING FROM:</h3>
                  <ul>
                    <li>UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA.</li>
                    <li>STATEMENTS OR CONDUCT OF ANY THIRD PARTY ON OR RELATING TO THE SERVICE.</li>
                    <li>ANY DOWNTIME, SERVICE INTERRUPTION, OR FAILURE OF THIRD-PARTY PROVIDERS.</li>
                    <li>YOUR FAILURE TO SAFEGUARD YOUR PASSKEY OR DEVICE.</li>
                    <li>ANY DECRYPTION OR DATA RECOVERY ATTEMPTS.</li>
                  </ul>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">C. OUR TOTAL, AGGREGATE LIABILITY</h3>
                  <p>TO YOU FOR ANY CLAIMS ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO US FOR THE SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED UNITED STATES DOLLARS ($100) IF NO PAYMENT HAS BEEN MADE.</p>
                  <p>SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF LIABILITY FOR CONSEQUENTIAL OR INCIDENTAL DAMAGES, SO THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU. IN SUCH JURISDICTIONS, OUR LIABILITY SHALL BE LIMITED TO THE MAXIMUM EXTENT PERMITTED BY LAW.</p>

                  <h2 id="tos-indemnity" className="scroll-mt-24 mt-12 text-2xl">14. INDEMNIFICATION</h2>
                  <p>You agree to defend, indemnify, and hold harmless Zancrypt, its owner, affiliates, and service providers from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising out of or relating to:</p>
                  <ul>
                    <li>Your use of the Service in violation of these Terms.</li>
                    <li>Your violation of any applicable law or regulation.</li>
                    <li>Your infringement of any third-party rights (including intellectual property or privacy rights).</li>
                    <li>Any content you upload, store, or share through the Service.</li>
                  </ul>
                  <p>We reserve the right to assume the exclusive defense and control of any matter subject to indemnification by you, in which case you agree to cooperate with us in asserting any available defenses.</p>

                  <h2 id="tos-disputes" className="scroll-mt-24 mt-12 text-2xl">15. GOVERNING LAW AND DISPUTE RESOLUTION</h2>
                  <h3 className="mt-8 mb-4 font-semibold text-xl">A. Governing Law (India)</h3>
                  <p>These Terms and any disputes arising out of or relating to them shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.</p>
                  
                  <h3 className="mt-8 mb-4 font-semibold text-xl">B. Jurisdiction</h3>
                  <p>The courts located in Birbhum, West Bengal, India shall have exclusive jurisdiction over any disputes arising out of or relating to these Terms or the Service, subject to the exceptions below.</p>
                  
                  <h3 className="mt-8 mb-4 font-semibold text-xl">C. Acknowledgment of Global User Rights</h3>
                  <p>Notwithstanding the above, if you reside in the European Union, the United Kingdom, California (USA), or any other jurisdiction with mandatory consumer protection laws (e.g., GDPR, CCPA), nothing in this governing law clause limits or waives your rights under those applicable local laws. We expressly acknowledge that we process your data in accordance with GDPR/CCPA requirements and that you retain the right to lodge complaints with your local supervisory authority.</p>

                  <h3 className="mt-8 mb-4 font-semibold text-xl">D. Informal Dispute Resolution</h3>
                  <p>Before filing any formal legal action, you agree to contact us at support@zancrypt.in to attempt to resolve the dispute informally. We will make reasonable efforts to resolve the matter amicably within 30 days of receiving your complaint.</p>
                  
                  <h3 className="mt-8 mb-4 font-semibold text-xl">E. Arbitration</h3>
                  <p>If the dispute cannot be resolved informally, it shall be finally settled by binding arbitration under the Arbitration and Conciliation Act, 1996 (India), conducted by a single arbitrator appointed by mutual consent. The seat of arbitration shall be Kolkata, West Bengal, and the language shall be English. Judgment upon the award rendered by the arbitrator may be entered in any court having jurisdiction thereof.</p>
                  
                  <h3 className="mt-8 mb-4 font-semibold text-xl">F. Exceptions</h3>
                  <p>Nothing in this dispute resolution clause shall prevent either party from seeking injunctive or equitable relief in any court of competent jurisdiction to protect its intellectual property rights or confidential information.</p>

                  <h2 className="scroll-mt-24 mt-12 text-2xl">16. FORCE MAJEURE</h2>
                  <p>We shall not be liable for any failure to perform our obligations under these Terms if such failure is caused by circumstances beyond our reasonable control, including but not limited to: acts of God, war, terrorism, riots, embargoes, governmental actions, natural disasters, pandemics, cyber-attacks, power outages, or failure of third-party infrastructure providers.</p>

                  <h2 className="scroll-mt-24 mt-12 text-2xl">17. SEVERABILITY</h2>
                  <p>If any provision of these Terms is found to be invalid, illegal, or unenforceable by a court of competent jurisdiction, the remaining provisions shall continue in full force and effect, and the invalid provision shall be deemed modified to the minimum extent necessary to make it enforceable.</p>

                  <h2 className="scroll-mt-24 mt-12 text-2xl">18. WAIVER</h2>
                  <p>No failure or delay by either party in exercising any right or remedy under these Terms shall operate as a waiver of that right or remedy. Any waiver must be in writing and signed by the waiving party.</p>

                  <h2 className="scroll-mt-24 mt-12 text-2xl">19. ENTIRE AGREEMENT</h2>
                  <p>These Terms, together with our Privacy Policy, constitute the entire agreement between you and Zancrypt regarding the Service and supersede all prior or contemporaneous agreements, representations, or understandings, whether written or oral.</p>

                  <h2 className="scroll-mt-24 mt-12 text-2xl">20. ASSIGNMENT</h2>
                  <p>You may not assign or transfer these Terms or any of your rights or obligations hereunder without our prior written consent. We may assign these Terms freely to any affiliate or successor in interest.</p>

                  <h2 className="scroll-mt-24 mt-12 text-2xl">21. NOTICES</h2>
                  <p>All legal notices required under these Terms shall be in writing and sent to:</p>
                  <ul>
                    <li>You: via email to the address you provided during registration.</li>
                    <li>Us: via email to support@zancrypt.in or via physical mail to the address provided below.</li>
                  </ul>
                  <p>Notices shall be deemed received on the day of transmission (for email) or within five (5) business days of mailing.</p>

                  <h2 id="tos-contact" className="scroll-mt-24 mt-12 text-2xl">22. CONTACT AND GRIEVANCE REDRESSAL</h2>
                  <p>For questions, complaints, or legal correspondence regarding these Terms:</p>
                  <p>Support Email: support@zancrypt.in<br />
                  Contact Form: https://zancrypt.in/contact</p>
                  <p>Grievance Officer (under India's DPDP Act and Consumer Protection Rules):<br />
                  Name: Sahid Al Hassan<br />
                  Email: support@zancrypt.in (subject line: "ATTN: Grievance Officer")<br />
                  Physical Address: Murarai, Birbhum, West Bengal, 731219, India<br />
                  Response Time: We acknowledge complaints within 5 working days and resolve them within 30 days.</p>

                </div>
              </div>
            )}

            {activePage !== 'privacy-policy' && activePage !== 'cookies' && activePage !== 'subprocessors' && activePage !== 'termsOfService' && (
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
