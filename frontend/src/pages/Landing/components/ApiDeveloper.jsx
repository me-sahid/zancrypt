import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Terminal, Code, Cpu } from 'lucide-react';

const ApiDeveloper = () => {
  const containerRef = useRef(null);
  const [activeTab, setActiveTab] = useState('upload');

  const snippets = {
    upload: `curl -X POST "https://api.yuuvault.com/v1/files/upload" \\
  -H "Authorization: Bearer <TOKEN>" \\
  -F "file=@/path/to/data.pdf" \\
  -F "encryption_mode=AES-GCM-256" \\
  -F "shard_count=5" \\
  -F "parity_count=2"

# Response
{
  "file_id": "file_9x8c7v6b",
  "status": "sharding_in_progress",
  "shard_distribution": ["aws-us-east", "gcp-eu-west", "azure-ap-south"]
}`,
    download: `import requests

headers = {"Authorization": f"Bearer {API_KEY}"}
response = requests.get(
    "https://api.yuuvault.com/v1/files/file_9x8c7v6b/download",
    headers=headers,
    stream=True
)

with open("decrypted_data.pdf", "wb") as f:
    for chunk in response.iter_content(chunk_size=8192):
        f.write(decrypt_chunk(chunk, LOCAL_KEY))`,
    status: `const response = await fetch('https://api.yuuvault.com/v1/network/health');
const data = await response.json();

console.log(\`Global Uptime: \${data.uptime_percentage}%\`);
console.log(\`Active Nodes: \${data.active_nodes.length}\`);

if (data.status === 'degraded') {
  triggerAlert('Infrastructure operating at reduced capacity');
}`
  };

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo('.dev-terminal',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 60%',
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-8 bg-[#0a0a0c] border-y border-white/5 relative">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
        
        {/* Copy */}
        <div className="lg:col-span-5">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Terminal className="w-3.5 h-3.5 mr-2" />
            Developer First
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Built for Engineers</h2>
          <p className="text-lg text-text-secondary mb-10 leading-relaxed">
            Integrate enterprise-grade encrypted storage into your own applications in minutes. Our RESTful API exposes programmatic control over sharding, distribution, and node selection.
          </p>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <Code className="w-5 h-5 text-primary-accent" />
              <span className="font-medium">Comprehensive SDKs for Python, Node, & Go</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <Cpu className="w-5 h-5 text-primary-accent" />
              <span className="font-medium">Direct Infrastructure Telemetry API</span>
            </div>
          </div>
        </div>

        {/* Terminal UI */}
        <div className="lg:col-span-7 dev-terminal relative">
          <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-accent via-blue-600 to-purple-600 rounded-2xl blur opacity-20" />
          
          <div className="relative bg-[#0d0d12] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            {/* Window Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#13131a]">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex space-x-4">
                {['upload', 'download', 'status'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-xs font-mono uppercase tracking-wider transition-colors ${activeTab === tab ? 'text-primary-accent' : 'text-text-secondary hover:text-white'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Code Content */}
            <div className="p-6 overflow-x-auto h-[350px]">
              <pre className="text-sm font-mono text-green-400">
                <code>{snippets[activeTab]}</code>
              </pre>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ApiDeveloper;
