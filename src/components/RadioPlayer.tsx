'use client';

import { useState, useRef, useEffect } from 'react';

interface RadioPlayerProps {
  streamUrl: string;
}

export default function RadioPlayer({ streamUrl }: RadioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(streamUrl);
    audioRef.current.volume = volume;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [streamUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Playback failed', err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 245, 0.82)',
      border: '1px solid rgba(210, 195, 150, 0.35)',
      borderRadius: '14px',
      padding: '24px',
      backdropFilter: 'blur(6px)',
      boxShadow: '0 1px 6px rgba(100, 80, 20, 0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
    }}>
      <button
        onClick={togglePlay}
        disabled={loading}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none shrink-0 ${
          isPlaying
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200'
            : 'text-white shadow-lg'
        } disabled:opacity-50`}
        style={{ background: isPlaying ? undefined : 'var(--accent-primary)' }}
      >
        {loading ? (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : isPlaying ? (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Radio Streaming</span>
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-green-400' : 'bg-gray-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          </span>
          <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{isPlaying ? 'LIVE' : 'OFFLINE'}</span>
        </div>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>Radio Faedah Kita</span>
        
        <div className="flex items-center gap-2 mt-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9H4.5v6h3.25L12 18.75z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer flex-1"
            style={{ accentColor: 'var(--accent-primary)' }}
          />
        </div>
      </div>
    </div>
  );
}
