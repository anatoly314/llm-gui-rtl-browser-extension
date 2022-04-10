import { useState } from 'react';

export default function App() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999999,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      {/* Trigger bar - bold and visible */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200px',
          height: '8px',
          backgroundColor: '#3b82f6',
          borderBottomLeftRadius: '8px',
          borderBottomRightRadius: '8px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          opacity: isHovered ? 1 : 0.9,
          boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
        }}
      />

      {/* Sliding panel */}
      <div
        style={{
          position: 'absolute',
          top: isHovered ? '8px' : '-450px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '400px',
          height: '400px',
          backgroundColor: 'white',
          borderRadius: '0 0 12px 12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'top 0.3s ease',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
        <h2
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
          }}>
          RTL Settings
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: '14px',
            color: '#6b7280',
          }}>
          Panel content will go here. This is just a POC.
        </p>
      </div>
    </div>
  );
}
