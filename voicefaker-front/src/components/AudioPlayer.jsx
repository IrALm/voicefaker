import React, { useRef, useState, useEffect } from 'react';
import { getDownloadUrl } from '../api/api';

export default function AudioPlayer({ filename }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const url = getDownloadUrl(filename);

  useEffect(() => {
    setPlaying(false);
    setProgress(0);
  }, [filename]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio && audio.duration) {
      setProgress((audio.currentTime / audio.duration) * 100);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  const fmtTime = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const barCount = 28;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0,230,200,0.06), rgba(139,92,246,0.06))',
      border: '1px solid var(--border-active)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      animation: 'fadeUp 0.4s ease',
      boxShadow: '0 0 40px rgba(0,230,200,0.08)',
    }}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.target.duration)}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />

      {/* File info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--cyan)',
            letterSpacing: '1px',
            marginBottom: '4px',
          }}>AUDIO GÉNÉRÉ</div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}>{filename}</div>
        </div>

        {/* Download button */}
        <a
          href={url}
          download={filename}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 16px',
            borderRadius: '10px',
            background: 'rgba(0,230,200,0.1)',
            border: '1px solid rgba(0,230,200,0.3)',
            color: 'var(--cyan)',
            textDecoration: 'none',
            fontSize: '12px',
            fontFamily: 'var(--font-display)',
            fontWeight: '600',
            transition: 'var(--transition)',
          }}
        >
          ⬇ Télécharger
        </a>
      </div>

      {/* Waveform bars */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
        height: '40px',
        marginBottom: '16px',
      }}>
        {Array.from({ length: barCount }).map((_, i) => {
          const filled = (i / barCount) * 100 <= progress;
          const heights = [60, 80, 45, 100, 70, 55, 90, 65, 75, 85,
                           50, 95, 60, 70, 80, 45, 90, 55, 75, 65,
                           100, 50, 85, 70, 60, 90, 45, 80];
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${heights[i % heights.length]}%`,
                borderRadius: '2px',
                background: filled ? 'var(--cyan)' : 'var(--border)',
                transition: 'background 0.1s',
                animation: playing ? `waveBar ${0.6 + (i % 5) * 0.15}s ease-in-out infinite` : 'none',
                animationDelay: `${i * 0.04}s`,
              }}
            />
          );
        })}
      </div>

      {/* Progress bar */}
      <div
        onClick={handleSeek}
        style={{
          height: '4px',
          background: 'var(--border)',
          borderRadius: '2px',
          cursor: 'pointer',
          marginBottom: '12px',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute',
          left: 0, top: 0,
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, var(--cyan), var(--violet))',
          borderRadius: '2px',
          transition: 'width 0.1s linear',
        }} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={togglePlay}
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: playing
              ? 'rgba(0,230,200,0.15)'
              : 'linear-gradient(135deg, var(--cyan), var(--violet))',
            border: playing ? '1px solid var(--cyan)' : 'none',
            color: playing ? 'var(--cyan)' : '#000',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'var(--transition)',
            animation: playing ? 'pulse-cyan 2s infinite' : 'none',
          }}
        >
          {playing ? '⏸' : '▶'}
        </button>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          {fmtTime(audioRef.current?.currentTime)} / {fmtTime(duration)}
        </div>
      </div>
    </div>
  );
}