import React from 'react';

const VOICES = [
  { id: 'default',       label: 'Default',        icon: '👤', desc: 'Voix naturelle gTTS' },
  { id: 'dark_vador',    label: 'Dark Vador',      icon: '🦾', desc: 'Grave & intense' },
  { id: 'robot',         label: 'Robot',           icon: '🤖', desc: 'Effet mécanique' },
  { id: 'cartoon',       label: 'Cartoon',         icon: '🎭', desc: 'Haut perché & rapide' },
  { id: 'masculine_rock',label: 'Masculine Rock',  icon: '🎸', desc: 'Grave & puissant' },
  { id: 'child',         label: 'Child',           icon: '🧒', desc: 'Voix enfantine' },
];

export default function VoiceCard({ value, onChange }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: '10px',
    }}>
      {VOICES.map((v) => {
        const isActive = value === v.id;
        return (
          <button
            key={v.id}
            onClick={() => onChange(v.id)}
            style={{
              padding: '16px 14px',
              borderRadius: '14px',
              border: `1px solid ${isActive ? 'var(--violet)' : 'var(--border)'}`,
              background: isActive ? 'rgba(139,92,246,0.12)' : 'var(--bg-glass)',
              color: isActive ? 'var(--violet)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'var(--transition)',
              textAlign: 'left',
              backdropFilter: 'blur(10px)',
              boxShadow: isActive ? '0 0 20px rgba(139,92,246,0.2)' : 'none',
              transform: isActive ? 'translateY(-2px)' : 'none',
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{v.icon}</div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontWeight: '700',
              fontSize: '13px',
              marginBottom: '4px',
              color: isActive ? 'var(--violet)' : 'var(--text-primary)',
            }}>
              {v.label}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
            }}>
              {v.desc}
            </div>
          </button>
        );
      })}
    </div>
  );
}