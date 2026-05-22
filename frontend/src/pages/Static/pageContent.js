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
    subtitle: "Our commitment to your data.",
    content: [
      "Since Zancrypt is a zero-knowledge platform, we fundamentally cannot read, scan, or analyze the files you upload. We collect only the absolute minimum telemetry required to keep the network operational.",
      "We do not sell your data, we do not run third-party trackers, and we minimize our dependency on external analytics services.",
      "Your authentication details are secured locally via WebAuthn, meaning we never store a password that could be compromised. We believe that the best way to protect your privacy is to not have your data in the first place."
    ]
  },
  termsOfService: {
    title: "Terms of Service",
    subtitle: "Rules of the network.",
    content: [
      "By using Zancrypt, you agree to not use the platform for the distribution of illegal, malicious, or abusive material. While we cannot read your files, we cooperate with verifiable legal requests and can terminate accounts found violating our policies.",
      "The service is provided 'as is'. While we engineer for maximum uptime and data durability through replication, you are responsible for maintaining your master keys.",
      "If you lose access to your biometric authenticators and your fallback keys, your data is mathematically unrecoverable. We cannot bypass our own encryption to save you."
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
  }
};
