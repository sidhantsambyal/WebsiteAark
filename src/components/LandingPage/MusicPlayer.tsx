import React, { useState, useRef } from 'react';
import backgroundMusic from '../../assets/Music/Startrek201.mp3';
// Added interface for the prop
interface MusicPlayerProps {
  shift?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ shift }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioSrc = backgroundMusic;

  const flatPath = "M 0 14 L 50 14 L 100 14 L 150 14 L 200 14 L 250 14 L 300 14";
  const wavePath = "M 0 14 C 12.5 0, 37.5 28, 50 14 C 62.5 0, 87.5 28, 100 14 C 112.5 0, 137.5 28, 150 14 C 162.5 0, 187.5 28, 200 14 C 212.5 0, 237.5 28, 250 14 C 262.5 0, 287.5 28, 300 14";

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
    // Dynamic right position based on the shift prop
    <div className="music-container" style={{ right: shift ? '20px' : '105px' }}>
      <audio ref={audioRef} src={audioSrc} loop />

      <button className="MusicBtn" onClick={togglePlay}>
        <div className="wave-wrapper">
          <svg width="300%" height="100%" viewBox="0 0 300 28" preserveAspectRatio="none">
            <path
              className={`line-path ${isPlaying ? 'animating' : ''}`}
              d={isPlaying ? wavePath : flatPath}
              fill="none"
              stroke="rgba(157, 177, 204, 0.5)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="text">{isPlaying ? 'Pause' : 'Play'}</span>
      </button>

      <style>{`
        .music-container {
          position: fixed;
          bottom: 20px;
          z-index: 99;
          /* Smooth transition for moving between positions */
          transition: right 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .MusicBtn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 75px;
          height: 28px;
          background: transparent;
          border: 1px solid #9db1cc;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
        }

        .wave-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .line-path {
          opacity: 0;
          transition: d 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease;
        }

        .line-path.animating {
          opacity: 1;
          animation: wave-slide 3s linear infinite;
        }

        @keyframes wave-slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-16.66%); }
        }

        .text {
          position: relative;
          font-family: 'Raleway', sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: #ffffff;
          z-index: 10;
          pointer-events: none;
          text-shadow: 0 0 3px rgba(0,0,0,0.4);
        }

        .MusicBtn:hover {
          border-color: #ffffff;
          background-color: rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};

export default MusicPlayer;