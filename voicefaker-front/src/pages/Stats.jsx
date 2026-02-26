import React, { useState } from 'react';
import { statsActivity, statsLanguages, statsVoices } from '../api/api';
import StatBar from '../components/StatBar';

const pageTitle = {
  fontFamily: 'var(--font-display)',
  fontWeight: '800',
  fontSize: '32px',
  letterSpacing: '-1px',
  color: 'var(--text-primary)',
  marginBottom: '6px',
};

const pageSubtitle = {
  fontFamily: 'var(--font-mono)',
  fontSize: '13px',
  color: 'var(--text-muted)',
  marginBottom: '40px',
};

const card = {
  background: 'var(--bg-glass)',
  backdropFilter: 'blur(16px)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '28px',
  transition: 'border-color 0.3s',
};

const sectionLabel = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  letterSpacing: '1.5px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  marginBottom: '6px',
};

const sectionTitle = {
  fontFamily: 'var(--font-display)',
  fontWeight: '700',
  fontSize: '20px',
  color: 'var(--text-primary)',
  marginBottom: '20px',
};

const callBtn = (color = 'var(--cyan)') => ({
  padding: '10px 20px',
  borderRadius: '10px',
  background: `rgba(0,0,0,0.3)`,
  border: `1px solid ${color}40`,
  color: color,
  fontFamily: 'var(--font-display)',
  fontWeight: '600',
  fontSize: '13px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const LANG_FLAGS = { fr: '🇫🇷', en: '🇺🇸', es: '🇪🇸', de: '🇩🇪', it: '🇮🇹' };
const VOICE_ICONS = {
  default: '👤', dark_vador: '🦾', robot: '🤖',
  cartoon: '🎭', masculine_rock: '🎸', child: '🧒',
};
const HOUR_ICONS = ['🌙','🌙','🌙','🌙','🌙','🌅','🌅','☀️','☀️','☀️','☀️','☀️',
                    '🌤','🌤','🌤','🌤','🌤','🌆','🌆','🌆','🌆','🌃','🌃','🌃'];

function Spinner() {
  return (
    <div style={{
      width: '16px', height: '16px',
      border: '2px solid rgba(255,255,255,0.1)',
      borderTopColor: 'var(--cyan)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

function MetaChip({ label, value, color }) {
  return (
    <div style={{
      padding: '10px 16px',
      borderRadius: '10px',
      background: `${color}10`,
      border: `1px solid ${color}30`,
      display: 'inline-flex',
      flexDirection: 'column',
      gap: '2px',
      marginRight: '10px',
      marginBottom: '16px',
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
        {label}
      </span>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', color }}>
        {value}
      </span>
    </div>
  );
}

// ─── ACTIVITY SECTION ────────────────────────────────────────────────────────
function ActivitySection() {
  const [mode, setMode] = useState('date'); // 'date' | 'range'
  const [date, setDate] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const inputStyle = {
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
    padding: '9px 14px',
    fontSize: '13px',
    fontFamily: 'var(--font-mono)',
    width: '150px',
  };

  const fetch = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const res = mode === 'date'
        ? await statsActivity(date)
        : await statsActivity(null, from, to);
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={card}>
      <div style={sectionLabel}>01 — Activité</div>
      <div style={sectionTitle}>📈 Pic d'activité par heure</div>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '18px' }}>
        {['date', 'range'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              border: `1px solid ${mode === m ? 'var(--cyan)' : 'var(--border)'}`,
              background: mode === m ? 'rgba(0,230,200,0.1)' : 'transparent',
              color: mode === m ? 'var(--cyan)' : 'var(--text-muted)',
              fontFamily: 'var(--font-display)',
              fontWeight: '600',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'var(--transition)',
            }}
          >
            {m === 'date' ? 'Date précise' : 'Plage de dates'}
          </button>
        ))}
      </div>

      {/* Inputs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '18px' }}>
        {mode === 'date' ? (
          <input
            style={inputStyle}
            placeholder="JJ/MM/AAAA"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        ) : (
          <>
            <input style={inputStyle} placeholder="Du JJ/MM/AAAA" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>→</span>
            <input style={inputStyle} placeholder="Au JJ/MM/AAAA" value={to} onChange={(e) => setTo(e.target.value)} />
          </>
        )}
        <button onClick={fetch} disabled={loading} style={callBtn('var(--cyan)')}>
          {loading ? <Spinner /> : '🔍'} Analyser
        </button>
      </div>

      {error && <div style={{ color: 'var(--pink)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '16px' }}>⚠ {error}</div>}

      {data && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <div style={{ marginBottom: '20px' }}>
            <MetaChip label="TOTAL" value={data.total} color="var(--cyan)" />
            <MetaChip label="PIC" value={data.peak_hour || '—'} color="var(--violet)" />
            <MetaChip label="PÉRIODE" value={data.date_range} color="var(--text-secondary)" />
          </div>
          {data.activity?.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>
              Aucune activité sur cette période
            </div>
          ) : (
            data.activity?.map((item) => {
              const h = parseInt(item.hour);
              return (
                <StatBar
                  key={item.hour}
                  label={item.hour}
                  count={item.count}
                  percentage={item.percentage}
                  color="var(--cyan)"
                  icon={HOUR_ICONS[h] || '🕐'}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

// ─── LANGUAGES SECTION ───────────────────────────────────────────────────────
function LanguagesSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await statsLanguages();
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={card}>
      <div style={sectionLabel}>02 — Langues</div>
      <div style={sectionTitle}>🌍 Préférences linguistiques</div>

      <button onClick={fetch} disabled={loading} style={{ ...callBtn('var(--cyan)'), marginBottom: '20px' }}>
        {loading ? <Spinner /> : '📊'} Charger les stats
      </button>

      {error && <div style={{ color: 'var(--pink)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '16px' }}>⚠ {error}</div>}

      {data && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <div style={{ marginBottom: '20px' }}>
            <MetaChip label="TOTAL GÉNÉRATIONS" value={data.total} color="var(--cyan)" />
            <MetaChip label="LANGUE #1" value={`${LANG_FLAGS[data.most_requested] || ''} ${data.most_requested?.toUpperCase()}`} color="var(--violet)" />
          </div>
          {data.ranking?.map((item, i) => (
            <StatBar
              key={item.lang}
              label={item.lang.toUpperCase()}
              count={item.count}
              percentage={item.percentage}
              color={i === 0 ? 'var(--cyan)' : 'var(--violet)'}
              icon={LANG_FLAGS[item.lang] || '🌐'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── VOICES SECTION ──────────────────────────────────────────────────────────
function VoicesSection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await statsVoices();
      setData(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={card}>
      <div style={sectionLabel}>03 — Voix</div>
      <div style={sectionTitle}>🎭 Effets vocaux populaires</div>

      <button onClick={fetch} disabled={loading} style={{ ...callBtn('var(--violet)'), marginBottom: '20px' }}>
        {loading ? <Spinner /> : '🎤'} Charger les stats
      </button>

      {error && <div style={{ color: 'var(--pink)', fontFamily: 'var(--font-mono)', fontSize: '12px', marginBottom: '16px' }}>⚠ {error}</div>}

      {data && (
        <div style={{ animation: 'fadeUp 0.4s ease' }}>
          <div style={{ marginBottom: '20px' }}>
            <MetaChip label="TOTAL GÉNÉRATIONS" value={data.total} color="var(--violet)" />
            <MetaChip label="VOIX #1" value={`${VOICE_ICONS[data.most_requested] || '🎤'} ${data.most_requested}`} color="var(--cyan)" />
          </div>
          {data.ranking?.map((item, i) => (
            <StatBar
              key={item.voice}
              label={item.voice}
              count={item.count}
              percentage={item.percentage}
              color={i === 0 ? 'var(--violet)' : 'var(--cyan)'}
              icon={VOICE_ICONS[item.voice] || '🎤'}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function Stats() {
  return (
    <div style={{ maxWidth: '780px', animation: 'fadeUp 0.4s ease' }}>
      <h1 style={pageTitle}>Statistiques</h1>
      <p style={pageSubtitle}>ANALYSE DES USAGES · TEMPS RÉEL · DYNAMODB</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <ActivitySection />
        <LanguagesSection />
        <VoicesSection />
      </div>
    </div>
  );
}