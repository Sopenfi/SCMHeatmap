import { useEffect, useMemo, useRef, useState } from "react";
import type { MarketItem } from "../types";
import MoneyRain from "./MoneyRain";
import canny3 from "../music/canny3.mp3";
import canny4 from "../music/canny4.mp3";
import sonicslowed from "../music/sonicslowed.mp3";
import suicidemouse from "../music/suicidemouse.mp3";
import sonic from "../music/sonic.mp3";
import volvo from "../music/volvo.mp3";
import tequila from "../music/tequila.mp3";
import life from "../music/life.mp3";
import sneakyadventure from "../music/sneakyadventure.mp3";

interface BackgroundMusicProps {
  data: MarketItem[];
  timeframe: "6h" | "24h" | "72h" | "7days" | "30days";
}
const BackgroundMusic: React.FC<BackgroundMusicProps> = ({
  data,
  timeframe,
}) => {
  const sortedData = useMemo(() => {
    return [...data]
      .map((item) => {
        const currentPrice = parseFloat(
          item["Current price"].replace(",", ".")
        );
        const pastPrice = parseFloat(
          item[`${timeframe} ago`].replace(",", ".")
        );
        const supply = parseFloat(item.Supply);

        const currentMCAP = currentPrice * supply;
        const pastMCAP = pastPrice * supply;

        const priceDiff = currentPrice - pastPrice;
        const priceDiffPct = ((currentPrice - pastPrice) / pastPrice) * 100;

        const mcapDiff = currentMCAP - pastMCAP;
        const mcapDiffPct = ((currentMCAP - pastMCAP) / pastMCAP) * 100;

        return {
          ...item,
          CurrentMCAP: currentMCAP,
          PastMCAP: pastMCAP,
          PriceDiff: priceDiff,
          PriceDiffPct: priceDiffPct,
          MCAPDiff: mcapDiff,
          MCAPDiffPct: mcapDiffPct,
        };
      })
      .sort((a, b) => b.CurrentMCAP - a.CurrentMCAP);
  }, [data, timeframe]);

  const totalChange = useMemo(() => {
    const totalCurrentMCAP = sortedData.reduce(
      (sum, item) => sum + item.CurrentMCAP,
      0
    );
    const totalPastMCAP = sortedData.reduce(
      (sum, item) => sum + item.PastMCAP,
      0
    );

    const totalDiff = totalCurrentMCAP - totalPastMCAP;
    const totalDiffPct =
      ((totalCurrentMCAP - totalPastMCAP) / totalPastMCAP) * 100;

    return { totalCurrentMCAP, totalPastMCAP, totalDiff, totalDiffPct };
  }, [sortedData]);

  console.log(totalChange.totalDiffPct);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentTrack, setCurrentTrack] =
    useState<string>("/music/default.mp3");

  useEffect(() => {});
  useEffect(() => {
    let newTrack = currentTrack;

    if (totalChange.totalDiffPct > 20) newTrack = tequila;
    else if (totalChange.totalDiffPct > 15) newTrack = volvo; // 20 - 15
    else if (totalChange.totalDiffPct > 10) newTrack = canny4; // 15-10
    else if (totalChange.totalDiffPct > 5) newTrack = canny3; // 10 - 5
    else if (totalChange.totalDiffPct > 1) newTrack = life; // 5-1
    else if (totalChange.totalDiffPct > -1)
      newTrack = sneakyadventure; // 1 - -1
    else if (totalChange.totalDiffPct > -5) newTrack = suicidemouse; // -1 - -5
    else if (totalChange.totalDiffPct > -10) newTrack = sonic; //-5 - -10
    else newTrack = sonicslowed;
    if (newTrack !== currentTrack) {
      setCurrentTrack(newTrack);
    }

    // Change the song
    if (audioRef.current) {
      const audio = audioRef.current;
      const wasPlaying = !audio.paused;
      audio.pause();
      audio.src = newTrack;
      audio.load();

      if (wasPlaying) {
        audio.play().catch((err) => console.log("Playback blocked:", err));
      }
    }

    setCurrentTrack(newTrack);
  }, [data, timeframe]);
  // Try autoplay
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false));
      }
    }
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const vol = parseFloat(e.target.value);
    audio.volume = vol;
    setVolume(vol);
  };

  return (
    <div className="flex flex-row items-center gap-2 mt-4">
      <audio ref={audioRef} src="src/music/volvo.mp3" loop />
      <MoneyRain active={isPlaying && currentTrack.includes("Tequila.mp3")} />
      <button
        onClick={togglePlay}
        className="px-3 py-1 bg-blue-600 text-white rounded"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <button
        onClick={toggleMute}
        className="px-3 py-1 bg-gray-600 text-white rounded"
      >
        {isMuted ? "Unmute" : "Mute"}
      </button>

      <div className="flex items-center gap-2">
        <label htmlFor="volume" className="text-white"></label>
        <input
          id="volume"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={changeVolume}
        />
      </div>
    </div>
  );
};

export default BackgroundMusic;
