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
    <div className="fixed bottom-6 right-6 z-50 bg-white/95 backdrop-blur border border-gray-100 shadow-2xl rounded-2xl p-4 flex items-center gap-4 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-blue-100/50">
      <button
        onClick={togglePlay}
        disabled={loading}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none ${
          isPlaying
            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-200'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'
        } disabled:opacity-50`}
      >
        {loading ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : isPlaying ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <div className="flex flex-col pr-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Radio Streaming</span>
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPlaying ? 'bg-green-400' : 'bg-gray-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? 'bg-green-500' : 'bg-gray-400'}`}></span>
          </span>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{isPlaying ? 'LIVE' : 'OFFLINE'}</span>
        </div>
        <span className="text-sm font-bold text-gray-800">Radio Faedah Kita</span>
        
        <div className="flex items-center gap-1.5 mt-1.5">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9H4.5v6h3.25L12 18.75z" />
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-16 h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
        </div>
      </div>
    </div>
  );
}
