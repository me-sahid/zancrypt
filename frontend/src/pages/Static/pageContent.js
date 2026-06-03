export const pageContent = {
  features: {
    title: "Platform Features",
    subtitle: "Everything you need for zero-knowledge data sovereignty.",
    content: [
      "Zancrypt represents a paradigm shift in how we handle data at scale. Instead of placing trust in centralized authorities, we mathematically guarantee your privacy through client-side cryptography.",
      "Our platform slices your files into encrypted shards and distributes them across a global network of disparate cloud providers. This ensures that no single entity—not even us—holds a complete, decrypted copy of your data.",
      "Features include hardware-bound biometric authentication (WebAuthn/FIDO2), self-destructing secure sharing containers, seamless in-browser preview of complex formats like HEIC and MOV, and sub-millisecond telemetry to track node health across the globe."
    ]
  },
  securityArchitecture: {
    title: "Security Architecture",
    subtitle: "Trust math, not servers.",
    content: [
      "Our security model begins at the edge. Your master key is derived directly from your biometric hardware identity and never touches the network. Every encryption operation (AES-GCM 256) happens in your browser's Web Crypto API before the first byte is transmitted.",
      "Data routing utilizes Rendezvous Hashing to dynamically assign shards to nodes without relying on centralized mapping tables, preventing metadata correlation.",
      "Furthermore, all file names, extensions, and metadata are independently encrypted. The backend system routes opaque binary blobs and has zero awareness of the content it holds."
    ]
  },
  globalNetwork: {
    title: "Global Network",
    subtitle: "Resilient by design. Distributed by default.",
    content: [
      "Zancrypt operates a globally distributed fleet of storage nodes spanning multiple providers, including AWS, GCP, Backblaze, and Supabase. By avoiding vendor lock-in at the infrastructure layer, we ensure uninterrupted availability.",
      "Our multi-cloud strategy mitigates regional outages. If a primary data center fails, the Storage Router dynamically fails over to secondary replicas, streaming your data seamlessly.",
      "Nodes continuously report health, latency, and load metrics back to the core infrastructure, ensuring your data is automatically rebalanced and consistently highly available."
    ]
  },
  clientSdks: {
    title: "Client SDKs",
    subtitle: "Integrate Zancrypt into your application in minutes.",
    content: [
      "We provide robust, type-safe SDKs for TypeScript, Python, Go, and Rust. These SDKs abstract away the complexity of chunking, encrypting, and distributing files.",
      "Our client libraries handle all the heavy cryptographic lifting locally, allowing you to build zero-knowledge applications without becoming a cryptography expert.",
      "Detailed documentation and interactive playgrounds are coming soon to help you build the next generation of privacy-first software."
    ]
  },
  systemArchitecture: {
    title: "System Architecture",
    subtitle: "Built for massive scale and extreme concurrency.",
    content: [
      "Zancrypt is built on a high-performance ASGI Python backend powered by FastAPI and SQLAlchemy 2.0. We utilize asynchronous non-blocking I/O across the entire request lifecycle.",
      "Background tasks are delegated to Celery workers running on Redis, managing intensive operations like shard replication, emergency rollbacks, and storage telemetry calculations without blocking the main event loop.",
      "The frontend is a React 19 Single Page Application orchestrated with Zustand and React Query, optimized for rapid rendering and minimal layout shifts, even when handling complex cryptographic visualizations."
    ]
  },
  aboutUs: {
    title: "About Zancrypt",
    subtitle: "Building the infrastructure for digital sovereignty.",
    content: [
      "Zancrypt was founded on a simple principle: absolute privacy should be the default, not an enterprise add-on.",
      "We are a team of distributed systems engineers, cryptographers, and designers dedicated to solving the complex challenges of zero-knowledge infrastructure.",
      "Our mission is to build the tools that empower individuals and organizations to take full ownership of their digital lives, free from surveillance and unauthorized data monetization."
    ]
  },
  careers: {
    title: "Careers",
    subtitle: "Help us build a privacy-first future.",
    content: [
      "We are always looking for exceptional talent to join our mission. If you are passionate about cryptography, distributed systems, or creating beautiful user experiences, we want to hear from you.",
      "At Zancrypt, we value deep technical expertise, a bias for action, and an uncompromising commitment to security.",
      "We offer a fully remote culture, competitive compensation, and the opportunity to work on bleeding-edge privacy infrastructure."
    ],
    isCareers: true
  },
  privacyPolicy: {
    title: "Privacy Policy",
    subtitle: "Our comprehensive commitment to your data privacy.",
    content: [
      "1. Introduction: Zancrypt Infrastructure Inc. ('Zancrypt', 'we', 'us', or 'our') is committed to protecting the privacy and security of your personal and encrypted data. This Privacy Policy outlines how we collect, use, and protect your information when you use our website, application, and related services.",
      "2. Zero-Knowledge Architecture: Zancrypt operates on a strict zero-knowledge architecture. This means that any files, documents, or data you upload to our platform are encrypted locally on your device before transmission. We do not possess the cryptographic keys required to decrypt your data. Consequently, we cannot read, scan, index, or analyze your files under any circumstances.",
      "3. Information We Collect: While we cannot access your encrypted data, we do collect necessary operational data to provide our services. This includes account information (such as email addresses for communication), billing information (processed securely by our payment partners like Razorpay), and telemetry data (such as IP addresses, access times, and bandwidth usage) required for network balancing and abuse prevention.",
      "4. How We Use Your Information: The operational information we collect is strictly used to maintain, provide, and improve the Zancrypt service. We use billing information solely for processing transactions and managing subscriptions. Telemetry data is utilized in aggregate to ensure high availability, monitor node health, and prevent malicious activity.",
      "5. Data Sharing and Disclosure: We do not sell, rent, or trade your personal information to third parties. We may share necessary operational data with trusted third-party service providers (such as Razorpay for payments or cloud infrastructure providers for hosting nodes) strictly for the purpose of operating our service. These providers are contractually obligated to maintain the confidentiality and security of this data.",
      "6. Legal Compliance: While our zero-knowledge architecture prevents us from accessing user data, we cooperate fully with valid, legally binding requests from law enforcement agencies regarding the metadata and operational data we do possess. If compelled by law, we may disclose account and billing information, but we cannot hand over decrypted files.",
      "7. Data Retention: We retain your operational and encrypted data only as long as your account is active or as needed to provide you services. Upon account deletion, all encrypted shards and associated metadata are permanently purged from our global network within 30 days.",
      "8. User Rights: Depending on your jurisdiction (such as GDPR or CCPA), you may have the right to access, correct, or delete your personal information. You can manage your account details directly through the Zancrypt dashboard. Because we cannot decrypt your files, any requests to export or modify encrypted data must be performed by the user directly.",
      "9. Cookies and Tracking: We utilize essential cookies necessary for the authentication and basic functioning of our web application. We do not use intrusive third-party advertising trackers or invasive analytics.",
      "10. Changes to This Policy: We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify users of significant changes via email or platform announcements. Continued use of the service constitutes acceptance of the updated policy."
    ]
  },
  termsOfService: {
    title: "Terms of Service",
    subtitle: "Comprehensive rules and agreements for using Zancrypt.",
    content: [
      "1. Acceptance of Terms: By accessing or using the Zancrypt platform, website, or associated APIs (collectively, the 'Service'), you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the Service. These terms apply to all visitors, users, and others who access the Service.",
      "2. Description of Service: Zancrypt provides a decentralized, zero-knowledge encrypted cloud storage platform. The Service allows users to securely encrypt files locally and distribute the encrypted shards across a global network of storage nodes. We do not provide decryption services or key management backup beyond your local device hardware.",
      "3. User Responsibilities: You are solely responsible for maintaining the confidentiality of your authentication credentials, including your biometric hardware identity (WebAuthn/FIDO2) and any fallback master keys. Because Zancrypt is zero-knowledge, IF YOU LOSE YOUR KEYS, YOUR DATA IS MATHEMATICALLY UNRECOVERABLE. We are not liable for any data loss resulting from lost credentials.",
      "4. Acceptable Use: You agree not to use the Service for any unlawful purpose or in any way that violates these Terms. You may not use Zancrypt to store, distribute, or share illegal content, malware, copyrighted material without authorization, or material that promotes violence or abuse. While we cannot scan your data, we reserve the right to terminate accounts that are reported and verified to be violating these rules through metadata or public sharing links.",
      "5. Payments and Subscriptions: Access to premium features requires a paid subscription. Payments are processed securely via our third-party gateways (e.g., Razorpay). By subscribing, you agree to provide current, complete, and accurate billing information. You authorize us to charge your payment method for all charges incurred under your account on a recurring basis until canceled.",
      "6. Intellectual Property: The Zancrypt platform, its original content, features, functionality, and underlying cryptography implementations are owned by Zancrypt Infrastructure Inc. and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.",
      "7. Limitation of Liability: In no event shall Zancrypt, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; or (iii) unauthorized access, use, or alteration of your transmissions or content.",
      "8. Indemnification: You agree to defend, indemnify, and hold harmless Zancrypt and its licensee and licensors, and their employees, contractors, agents, officers, and directors, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses arising from your use of and access to the Service.",
      "9. Termination: We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease, and your data may be purged from the network.",
      "10. Governing Law: These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights."
    ]
  },
  whitepaper: {
    title: "Whitepaper",
    subtitle: "The mathematics of distributed trust.",
    content: [
      "Our technical whitepaper details the exact cryptographic primitives, routing algorithms, and threat models underlying Zancrypt.",
      "We openly publish our methodologies for Rendezvous Hashing, PBKDF2 key derivation, and AES-GCM chunking so that the community can audit our security claims.",
      "The full PDF whitepaper is currently undergoing independent security review and will be available for download here shortly."
    ]
  },
  changelog: {
    title: "Changelog",
    subtitle: "Recent updates and improvements.",
    content: [
      "v1.4.0: Shipped zero-knowledge passkey and fallback test harness stabilization. Resolved all event loop concurrency bugs.",
      "v1.3.5: Introduced cinematic outage UX and resolved sibling overlay modal architecture bugs for file previews.",
      "v1.3.0: Added native client-side decrypted previews for iPhone .MOV files and WASM HEIC translation."
    ]
  },
  blog: {
    title: "Blog",
    subtitle: "Thoughts on privacy, engineering, and the future.",
    content: [
      "Welcome to the Zancrypt Engineering Blog. Here we share deep dives into the challenges we face building zero-knowledge infrastructure at scale.",
      "Upcoming posts will cover our journey writing asynchronous database engines, implementing WebAuthn across platforms, and designing beautiful React interfaces for complex cryptographic states.",
      "Stay tuned for more updates."
    ]
  },
  supportCenter: {
    title: "Support Center",
    subtitle: "We're here to help.",
    content: [
      "Need assistance? Our support team can help you with account recovery, billing inquiries, and technical integration questions.",
      "Please note that because Zancrypt is zero-knowledge, our support agents cannot recover deleted files, reset master passwords, or decrypt your data.",
      "For urgent inquiries, please email support@zancrypt.com or reach out via our official community channels."
    ]
  },
  refundPolicy: {
    title: "Refund & Cancellation Policy",
    subtitle: "Comprehensive billing and refund guidelines.",
    content: [
      "1. Subscription Cancellation: Customers may cancel their Zancrypt subscription at any time through the billing dashboard. Upon cancellation, you will continue to have access to the premium features of your account until the end of your current paid billing cycle. We do not charge cancellation fees.",
      "2. 14-Day Money-Back Guarantee: We stand behind the quality of our zero-knowledge infrastructure. We offer a full, unconditional 14-day money-back guarantee for all new initial subscription purchases. If you are not completely satisfied with the platform, simply contact our support team within 14 days of your original transaction.",
      "3. Processing of Refunds: Eligible refunds will be processed back to the original method of payment (e.g., Credit Card, UPI, Net Banking) via our payment gateway partner, Razorpay. Please allow 5 to 7 business days for the refunded amount to reflect in your bank account or credit card statement, depending on your financial institution's processing times.",
      "4. Non-Refundable Scenarios: After the initial 14-day period has passed, subscription payments are non-refundable. We do not provide pro-rated refunds or credits for partially used billing periods, mid-cycle cancellations, or for accounts that have been terminated due to a violation of our Terms of Service.",
      "5. Data Purge on Cancellation: If your account reverts to a free tier or is permanently closed following a cancellation and refund, your storage limits will be adjusted accordingly. Any data exceeding the free tier limits may be subject to automated deletion after a 30-day grace period. It is your responsibility to download your decrypted files before your premium access expires."
    ]
  },
  disclaimer: {
    title: "Disclaimer",
    subtitle: "Legal limitations of liability and service guarantees.",
    content: [
      "1. 'As Is' Provision: The services, software, and materials provided by Zancrypt are offered on an 'as is' and 'as available' basis. Zancrypt makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.",
      "2. Zero-Knowledge Risk: Zancrypt is fundamentally designed as a zero-knowledge system. We do not possess your encryption keys. Therefore, Zancrypt explicitly disclaims any ability or obligation to recover, restore, or decrypt your data in the event that you lose your authentication hardware, passkeys, or recovery codes. The responsibility for key management rests entirely with the user.",
      "3. Data Loss and Uptime: While Zancrypt employs multi-cloud redundancy and advanced distributed systems architecture to ensure maximum uptime and data durability, we do not guarantee that the service will be entirely free from interruptions, errors, or catastrophic hardware failures. We strongly advise users to maintain independent backups of critical unencrypted data.",
      "4. Content Liability: Zancrypt does not monitor, review, or have access to the contents of the encrypted files uploaded by users. Consequently, Zancrypt expressly disclaims any liability arising from user-uploaded data, including but not limited to copyright infringement, illegal content distribution, or malware transmission.",
      "5. Limitation of Liability: In no event shall Zancrypt or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, business interruption, personal injury, or loss of privacy) arising out of or in any way related to the use of or inability to use the platform, even if Zancrypt has been advised of the possibility of such damages."
    ]
  },
  contactUs: {
    title: "Contact Us",
    subtitle: "Get in touch with the Zancrypt team.",
    content: [
      "Zancrypt Infrastructure Inc. is dedicated to providing enterprise-grade support for all our users. Whether you have questions regarding our zero-knowledge architecture, require assistance with Razorpay billing transactions, or need to report a service issue, our team is available to assist you.",
      "Company Name: Zancrypt Infrastructure Inc.",
      "Registered Address: 123 Secure Valley, Tech Park, Bangalore, Karnataka 560001, India.",
      "Operating Address: 123 Secure Valley, Tech Park, Bangalore, Karnataka 560001, India.",
      "General Email: hello@zancrypt.in",
      "Support & Billing Email: support@zancrypt.in",
      "Legal Inquiries: legal@zancrypt.in",
      "Our standard support hours are Monday through Friday, 9:00 AM to 6:00 PM IST. We aim to respond to all billing and technical inquiries within 24 business hours. For immediate assistance with ongoing enterprise deployments, please refer to your dedicated priority support channel."
    ]
  }
};
