import React from 'react';

const LANGS = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
];

export default function LangSelector({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
      {LANGS.map((lang) => {
        const isActive = value === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => onChange(lang.code)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '12px',
              border: `1px solid ${isActive ? 'var(--cyan)' : 'var(--border)'}`,
              background: isActive ? 'rgba(0,230,200,0.1)' : 'var(--bg-glass)',
              color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: '600',
              fontFamily: 'var(--font-display)',
              cursor: 'pointer',
              transition: 'var(--transition)',
              backdropFilter: 'blur(10px)',
              boxShadow: isActive ? '0 0 16px rgba(0,230,200,0.15)' : 'none',
            }}
          >
            <span style={{ fontSize: '18px' }}>{lang.flag}</span>
            {lang.label}
          </button>
        );
      })}
    </div>
  );
}