import React from 'react';

export default function LogoIcon({ className = 'size-8' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Bearing Shield Outline */}
      <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2" className="opacity-60" />
      <circle cx="16" cy="16" r="11" stroke="currentColor" strokeWidth="1.5" />
      {/* Inner Vault / Bearing Ball Core */}
      <circle cx="16" cy="16" r="5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
      
      {/* Precision Bearing Balls */}
      <circle cx="16" cy="8" r="1.5" fill="currentColor" />
      <circle cx="24" cy="16" r="1.5" fill="currentColor" />
      <circle cx="16" cy="24" r="1.5" fill="currentColor" />
      <circle cx="8" cy="16" r="1.5" fill="currentColor" />
    </svg>
  );
}
