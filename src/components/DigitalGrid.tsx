import React from 'react';

export default function DigitalGrid() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Primary Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} 
      />
      
      {/* Secondary Fine Grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '10px 10px'
        }} 
      />

      {/* Radiant Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent_70%)]" />
      
      {/* Scanning Line Effect */}
      <div className="absolute inset-0 w-full h-[100%] pointer-events-none overflow-hidden">
        <div className="w-full h-[2px] bg-indigo-500/10 absolute top-0 animate-scanline" />
      </div>
    </div>
  );
}
