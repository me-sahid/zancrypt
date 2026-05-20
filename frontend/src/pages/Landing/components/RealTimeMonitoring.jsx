import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Server, AlertCircle, CheckCircle2 } from 'lucide-react';

// Generate some dummy initial data
const generateData = (num) => {
  const data = [];
  let time = new Date().getTime();
  for (let i = 0; i < num; i++) {
    data.push({
      time: time + i * 1000,
      latency: Math.floor(Math.random() * 20) + 10,
      throughput: Math.floor(Math.random() * 500) + 200,
    });
  }
  return data;
};

const RealTimeMonitoring = () => {
  const containerRef = useRef(null);
  const [data, setData] = useState(generateData(20));

  // Simulate real-time data incoming
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: new Date().getTime(),
          latency: Math.floor(Math.random() * 20) + 10,
          throughput: Math.floor(Math.random() * 500) + 200,
        });
        return newData;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 50%',
        }
      });

      tl.fromTo('.dashboard-ui',
        { y: 100, opacity: 0, rotateX: 10 },
        { y: 0, opacity: 1, rotateX: 0, duration: 1, ease: 'power3.out', perspective: 1000 }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const logs = [
    { type: 'info', msg: 'Shard recovery triggered for Node eu-central-1', time: '1s ago' },
    { type: 'success', msg: 'New node connected: ap-northeast-2', time: '5s ago' },
    { type: 'warning', msg: 'Latency spike detected in Redis Event Bus', time: '12s ago' },
    { type: 'success', msg: 'AES key rotation completed successfully', time: '2m ago' },
  ];

  return (
    <section ref={containerRef} className="py-32 px-8 bg-void border-y border-border/40 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">Unprecedented Visibility</h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Monitor your infrastructure with a state-of-the-art Datadog-style telemetry suite built right into the platform. Real-time metrics, instant alerting.
          </p>
        </div>

        {/* Dashboard Mockup */}
        <div className="dashboard-ui relative max-w-5xl mx-auto bg-[#0d0d12] border border-white/10 rounded-2xl shadow-[0_30px_100px_-20px_rgba(0,112,243,0.3)] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#13131a]">
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-sm font-medium text-text-secondary flex items-center">
                <Activity className="w-4 h-4 mr-2 text-primary-accent" />
                Live Telemetry
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-500 uppercase tracking-wider font-bold">System Online</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 grid lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-surface-elevated/30 border border-white/5 rounded-xl p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-medium text-sm">Global API Latency (ms)</h3>
                <span className="text-2xl font-bold text-white">{data[data.length - 1].latency}<span className="text-sm text-text-secondary font-normal ml-1">ms</span></span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0070f3" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0070f3" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="latency" stroke="#0070f3" strokeWidth={2} fillOpacity={1} fill="url(#colorLatency)" isAnimationActive={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Sidebar Stats & Logs */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-elevated/30 border border-white/5 rounded-xl p-4">
                  <div className="text-text-secondary text-xs uppercase mb-1">Active Nodes</div>
                  <div className="text-xl font-bold text-white">24 <span className="text-green-500 text-sm">↑</span></div>
                </div>
                <div className="bg-surface-elevated/30 border border-white/5 rounded-xl p-4">
                  <div className="text-text-secondary text-xs uppercase mb-1">Queue Size</div>
                  <div className="text-xl font-bold text-white">1.2k</div>
                </div>
              </div>

              <div className="bg-surface-elevated/30 border border-white/5 rounded-xl p-5 h-[230px] overflow-hidden">
                <h3 className="text-white font-medium text-sm mb-4">Event Stream</h3>
                <div className="space-y-3">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-start space-x-3 text-xs">
                      {log.type === 'info' && <Activity className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />}
                      {log.type === 'success' && <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />}
                      {log.type === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />}
                      <div>
                        <div className="text-gray-300">{log.msg}</div>
                        <div className="text-gray-600 mt-0.5">{log.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RealTimeMonitoring;
