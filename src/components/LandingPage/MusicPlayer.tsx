import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';

const MusicPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioSrc = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

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
    /* Changed right-[15px] to right-[20px] to match your SkipButton CSS exactly */
    <div className="fixed bottom-[52px] right-[20px] z-50">
      <audio ref={audioRef} src={audioSrc} loop />

      <div
        className="flex items-center justify-around bg-[#0d2a54] border border-[#9db1cc] rounded-[20px] shadow-lg overflow-hidden transition-all duration-300 hover:bg-[#163a6e] hover:border-white"
        style={{ width: '75px', height: '28px' }}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-full w-7 rounded-none text-blue-200 hover:bg-white/10 p-0"
            >
              {isMuted || volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </Button>
          </PopoverTrigger>

          <PopoverContent
            side="top"
            sideOffset={12}
            className="w-40 bg-[#0d2a54] border-[#9db1cc] p-3 mb-2 shadow-2xl rounded-xl"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase tracking-tighter text-blue-200/60 font-bold">
                  Vol
                </span>
                <span className="text-[9px] text-blue-200 font-mono">
                  {isMuted ? 0 : volume}%
                </span>
              </div>
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={(vals) => {
                  setVolume(vals[0]);
                  if (vals[0] > 0) setIsMuted(false);
                }}
                className="cursor-pointer"
              />
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-[1px] h-3 bg-[#9db1cc]/30" />

        <Button
          onClick={togglePlay}
          variant="ghost"
          size="icon"
          className="h-full w-7 rounded-none text-white hover:bg-white/10 p-0"
        >
          {isPlaying ? (
            <Pause size={12} fill="currentColor" />
          ) : (
            <Play size={12} className="ml-0.5" fill="currentColor" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default MusicPlayer;