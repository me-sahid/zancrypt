import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ShardMap = ({ fileId, activeNodes = 6, shardCount = 3 }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Stagger animation on mount
    const dots = containerRef.current.querySelectorAll('.shard-dot');
    gsap.fromTo(dots, 
      { scale: 0, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.4, stagger: 0.05, ease: 'back.out(1.5)' }
    );
  }, [fileId]);

  // Create an array of node dots
  const nodes = Array.from({ length: 6 }).map((_, i) => ({
    id: i,
    hasShard: i < shardCount, // Distribute shards to first N nodes (simplified for visual)
    active: i < activeNodes
  }));

  return (
    <div ref={containerRef} className="flex gap-1.5 items-center">
      {nodes.map((node) => (
        <div 
          key={node.id} 
          className={`shard-dot w-2 h-2 rounded-full ${
            !node.active 
              ? 'bg-border' 
              : node.hasShard 
                ? 'bg-accent shadow-[0_0_5px_rgba(79,255,176,0.5)]' 
                : 'bg-surface-raised border border-border'
          }`}
          title={node.hasShard ? "Contains Shard" : node.active ? "Online Node" : "Offline Node"}
        />
      ))}
    </div>
  );
};

export default ShardMap;
