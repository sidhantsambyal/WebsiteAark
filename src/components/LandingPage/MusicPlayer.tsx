import React, { useState, useRef } from 'react';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error("Playback failed:", err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="music-container">
      <audio ref={audioRef} src={audioSrc} loop />

      <button className="MusicBtn" onClick={togglePlay}>
        <span className="text">{isPlaying ? 'Pause' : 'Play'}</span>
      </button>

      <style>{`
        .music-container {
          position: fixed;
          bottom: 20px;
          /* Placed at 105px from right (20px skip offset + 75px skip width + 10px gap) */
          right: 105px; 
          z-index: 99;
        }

        .MusicBtn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 75px;
          height: 28px;
          background-color: #0d2a54;
          color: #ffffff;
          border: 1px solid #9db1cc;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .text {
          font-family: 'Oxanium', sans-serif;
          font-size: 12px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .MusicBtn:hover {
          background-color: #163a6e;
          border-color: #ffffff;
        }

        .MusicBtn:active {
          transform: scale(0.95);
        }
      `}</style>
    </div>
  );
};

export default MusicPlayer;