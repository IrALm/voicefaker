import React, { useState } from 'react';
import LangSelector from '../components/LangSelector';
import VoiceCard from '../components/VoiceCard';
import AudioPlayer from '../components/AudioPlayer';
import { generateAudio } from '../api/api';

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
  letterSpacing: '0.5px',
};

const sectionLabel = {
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  letterSpacing: '1.5px',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  marginBottom: '14px',
};

const card = {
  background: 'var(--bg-glass)',
  backdropFilter: 'blur(16px)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-lg)',
  padding: '28px',
  marginBottom: '20px',
};

export default function Generate() {
  const [text, setText] = useState('');
  const [lang, setLang] = useState('fr');
  const [voice, setVoice] = useState('default');
  const [loading, setLoading] = useState(false);
  const [filename, setFilename] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setFilename(null);
    try {
      const res = await generateAudio(text, lang, voice);
      setFilename(res.data.filename);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la génération');
    } finally {
      setLoading(false);
    }
  };

  const charCount = text.length;

  return (
    <div style={{ maxWidth: '780px', animation: 'fadeUp 0.4s ease' }}>
      {/* Header */}
      <div>
        <h1 style={pageTitle}>Générateur vocal</h1>
        <p style={pageSubtitle}>TRANSFORMEZ VOTRE TEXTE EN AUDIO · {lang.toUpperCase()} · {voice.toUpperCase()}</p>
      </div>

      {/* Langue */}
      <div style={card}>
        <div style={sectionLabel}>01 — Langue</div>
        <LangSelector value={lang} onChange={setLang} />
      </div>

      {/* Voix */}
      <div style={card}>
        <div style={sectionLabel}>02 — Effet vocal</div>
        <VoiceCard value={voice} onChange={setVoice} />
      </div>

      {/* Texte */}
      <div style={card}>
        <div style={sectionLabel}>03 — Texte à synthétiser</div>
        <div style={{ position: 'relative' }}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Saisissez votre texte ici..."
            rows={5}
            style={{
              width: '100%',
              background: 'rgba(0,0,0,0.3)',
              border: `1px solid ${text ? 'rgba(0,230,200,0.3)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              padding: '16px',
              fontSize: '15px',
              fontFamily: 'var(--font-display)',
              resize: 'vertical',
              lineHeight: '1.7',
              transition: 'var(--transition)',
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '14px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: charCount > 400 ? 'var(--pink)' : 'var(--text-muted)',
          }}>
            {charCount} car.
          </div>
        </div>

        {/* Send button */}
        <button
          onClick={handleGenerate}
          disabled={loading || !text.trim()}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            background: loading || !text.trim()
              ? 'rgba(255,255,255,0.04)'
              : 'linear-gradient(135deg, var(--cyan), var(--violet))',
            color: loading || !text.trim() ? 'var(--text-muted)' : '#000',
            fontFamily: 'var(--font-display)',
            fontWeight: '700',
            fontSize: '15px',
            letterSpacing: '0.5px',
            cursor: loading || !text.trim() ? 'not-allowed' : 'pointer',
            transition: 'var(--transition)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            boxShadow: loading || !text.trim() ? 'none' : 'var(--shadow-cyan)',
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '16px', height: '16px',
                border: '2px solid rgba(255,255,255,0.2)',
                borderTopColor: 'var(--cyan)',
                borderRadius: '50%',
                animation: 'spin 0.7s linear infinite',
              }} />
              Génération en cours...
            </>
          ) : (
            <>🎙 Générer l'audio</>
          )}
        </button>
      </div>

      {/* Error */}
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
          animation: 'fadeUp 0.3s ease',
        }}>
          ⚠ {error}
        </div>
      )}

      {/* Audio player */}
      {filename && <AudioPlayer filename={filename} />}
    </div>
  );
}