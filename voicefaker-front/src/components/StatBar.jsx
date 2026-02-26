import React, { useEffect, useState } from 'react';

export default function StatBar({ label, count, percentage, color = 'var(--cyan)', icon }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setWidth(percentage), 100);
    return () => clearTimeout(t);
  }, [percentage]);

  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {icon && <span style={{ fontSize: '16px' }}>{icon}</span>}
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: '600',
            fontSize: '14px',
            color: 'var(--text-primary)',
          }}>{label}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}>{count} fois</span>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: '500',
            color,
          }}>{percentage}%</span>
        </div>
      </div>
      <div style={{
        height: '6px',
        background: 'var(--border)',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${width}%`,
          background: `linear-gradient(90deg, ${color}, rgba(139,92,246,0.8))`,
          borderRadius: '3px',
          transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: `0 0 8px ${color}40`,
        }} />
      </div>
    </div>
  );
}