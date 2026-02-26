import React, { useState } from 'react';
import { listFiles } from '../api/api';
import AudioPlayer from '../components/AudioPlayer';

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

const VOICE_ICONS = {
  default: '👤', dark_vador: '🦾', robot: '🤖',
  cartoon: '🎭', masculine_rock: '🎸', child: '🧒',
};

const LANG_FLAGS = { fr: '🇫🇷', en: '🇺🇸', es: '🇪🇸', de: '🇩🇪', it: '🇮🇹' };

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function Files() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [activePlayer, setActivePlayer] = useState(null);

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await listFiles();
      const data = Array.isArray(res.data) ? res.data : JSON.parse(res.data);
      setFiles(data.sort((a, b) => b.created_at?.localeCompare(a.created_at)));
      setLoaded(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '860px', animation: 'fadeUp 0.4s ease' }}>
      <div>
        <h1 style={pageTitle}>Fichiers générés</h1>
        <p style={pageSubtitle}>HISTORIQUE DES GÉNÉRATIONS AUDIO</p>
      </div>

      {/* Load button */}
      <button
        onClick={fetchFiles}
        disabled={loading}
        style={{
          padding: '13px 28px',
          borderRadius: 'var(--radius-md)',
          background: loading ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, var(--cyan), var(--violet))',
          color: loading ? 'var(--text-muted)' : '#000',
          fontFamily: 'var(--font-display)',
          fontWeight: '700',
          fontSize: '14px',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'var(--transition)',
          marginBottom: '32px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: loading ? 'none' : 'var(--shadow-cyan)',
        }}
      >
        {loading ? (
          <>
            <div style={{
              width: '14px', height: '14px',
              border: '2px solid rgba(255,255,255,0.2)',
              borderTopColor: 'var(--cyan)',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            Chargement...
          </>
        ) : (
          <>📁 Charger les fichiers</>
        )}
      </button>

      {error && (
        <div style={{
          background: 'rgba(244,63,142,0.08)',
          border: '1px solid rgba(244,63,142,0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          color: 'var(--pink)',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          marginBottom: '20px',
        }}>⚠ {error}</div>
      )}

      {loaded && files.length === 0 && (
        <div style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          padding: '60px',
        }}>Aucun fichier trouvé</div>
      )}

      {/* Counter */}
      {files.length > 0 && (
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          marginBottom: '16px',
          letterSpacing: '1px',
        }}>
          {files.length} FICHIER{files.length > 1 ? 'S' : ''} TROUVÉ{files.length > 1 ? 'S' : ''}
        </div>
      )}

      {/* Files list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {files.map((f) => (
          <div key={f.id} style={{
            background: 'var(--bg-glass)',
            border: `1px solid ${activePlayer === f.filename ? 'var(--border-active)' : 'var(--border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            backdropFilter: 'blur(16px)',
            transition: 'var(--transition)',
            animation: 'fadeUp 0.3s ease',
          }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ flex: 1, marginRight: '16px' }}>
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: '600',
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  marginBottom: '6px',
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {f.text}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                }}>
                  {f.created_at} · {formatBytes(f.file_size_bytes)}
                </div>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(0,230,200,0.1)',
                  border: '1px solid rgba(0,230,200,0.2)',
                  color: 'var(--cyan)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {LANG_FLAGS[f.lang]} {f.lang.toUpperCase()}
                </span>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: '20px',
                  background: 'rgba(139,92,246,0.1)',
                  border: '1px solid rgba(139,92,246,0.2)',
                  color: 'var(--violet)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {VOICE_ICONS[f.voice]} {f.voice}
                </span>
              </div>
            </div>

            {/* Play toggle */}
            <button
              onClick={() => setActivePlayer(activePlayer === f.filename ? null : f.filename)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: activePlayer === f.filename ? 'rgba(0,230,200,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activePlayer === f.filename ? 'var(--cyan)' : 'var(--border)'}`,
                color: activePlayer === f.filename ? 'var(--cyan)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-display)',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
            >
              {activePlayer === f.filename ? '▼ Masquer le lecteur' : '▶ Écouter'}
            </button>

            {/* Audio player inline */}
            {activePlayer === f.filename && (
              <div style={{ marginTop: '16px' }}>
                <AudioPlayer filename={f.filename} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}