import React from 'react';
import { NavLink } from 'react-router-dom';

const navStyle = {
  width: '220px',
  minHeight: '100vh',
  background: 'rgba(14, 19, 32, 0.8)',
  backdropFilter: 'blur(20px)',
  borderRight: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  flexDirection: 'column',
  padding: '36px 20px',
  position: 'sticky',
  top: 0,
  zIndex: 10,
};

const logoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '48px',
  paddingLeft: '8px',
};

const logoIconStyle = {
  width: '36px',
  height: '36px',
  borderRadius: '10px',
  background: 'linear-gradient(135deg, #00e6c8, #8b5cf6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
};

const logoTextStyle = {
  fontFamily: 'var(--font-display)',
  fontWeight: '800',
  fontSize: '18px',
  letterSpacing: '-0.5px',
  color: 'var(--text-primary)',
};

const navItems = [
  { to: '/generate', icon: '🎙️', label: 'Générer' },
  { to: '/files', icon: '📁', label: 'Fichiers' },
  { to: '/stats', icon: '📊', label: 'Statistiques' },
];

const linkBase = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px 14px',
  borderRadius: '12px',
  textDecoration: 'none',
  color: 'var(--text-secondary)',
  fontSize: '14px',
  fontWeight: '600',
  transition: 'var(--transition)',
  marginBottom: '4px',
  letterSpacing: '0.2px',
};

const linkActiveStyle = {
  ...linkBase,
  background: 'rgba(0, 230, 200, 0.08)',
  color: 'var(--cyan)',
  borderLeft: '2px solid var(--cyan)',
};

const footerStyle = {
  marginTop: 'auto',
  paddingLeft: '8px',
};

const versionStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  color: 'var(--text-muted)',
  letterSpacing: '1px',
};

export default function Navbar() {
  return (
    <nav style={navStyle}>
      <div style={logoStyle}>
        <div style={logoIconStyle}>🎤</div>
        <span style={logoTextStyle}>VoiceFaker</span>
      </div>

      <div>
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            style={({ isActive }) => isActive ? linkActiveStyle : linkBase}
          >
            <span style={{ fontSize: '16px' }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </div>

      <div style={footerStyle}>
        <div style={versionStyle}>v1.0.0 · LOCAL</div>
      </div>
    </nav>
  );
}