import { useEffect, useMemo, useRef, useState } from "react";
import type { MarketItem } from "../types";
import MoneyRain from "./MoneyRain";
import canny3 from "../music/canny3.mp3";
import canny4 from "../music/canny4.mp3";
import canny5 from "../music/canny5.mp3";
import canny6 from "../music/canny6.mp3";
import sonicslowed from "../music/sonicslowed.mp3";
import suicidemouse from "../music/suicidemouse.mp3";
import sonic from "../music/sonic.mp3";
import volvo from "../music/volvo.mp3";
import tequila from "../music/tequila.mp3";
import life from "../music/life.mp3";
import sneakyadventure from "../music/sneakyadventure.mp3";
import cry from "../music/Cry.mp3";
import burningmemory from "../music/burningmemory.mp3";
interface BackgroundMusicProps {
  data: MarketItem[];
  timeframe: "6h" | "24h" | "3D" | "7D" | "30D";
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
  const [volume, setVolume] = useState(0.5);
  const [currentTrack, setCurrentTrack] =
    useState<string>("/music/default.mp3");

  useEffect(() => {
    let newTrack = currentTrack;

    if (totalChange.totalDiffPct > 30) newTrack = tequila; // over 30%
    else if (totalChange.totalDiffPct > 25) newTrack = canny6; // 25 - 30
    else if (totalChange.totalDiffPct > 20) newTrack = canny5; // 20 - 25
    else if (totalChange.totalDiffPct > 15) newTrack = volvo; // 15 - 20
    else if (totalChange.totalDiffPct > 10) newTrack = canny4; // 10 - 15
    else if (totalChange.totalDiffPct > 5) newTrack = canny3; //5 - 10
    else if (totalChange.totalDiffPct > 1) newTrack = life; // 1 - 5
    else if (totalChange.totalDiffPct > -1)
      newTrack = sneakyadventure; // 1 - -1
    else if (totalChange.totalDiffPct > -3) newTrack = suicidemouse; // -1 - -5
    else if (totalChange.totalDiffPct > -5) newTrack = sonic; //-5 - -10
    else if (totalChange.totalDiffPct > -7) newTrack = sonicslowed; //-10 - -15
    else if (totalChange.totalDiffPct > -8) newTrack = cry; //-15 - -20
    else if (totalChange.totalDiffPct > -12)
      newTrack = burningmemory; //-25 - -30
    else newTrack = burningmemory;
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

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const vol = parseFloat(e.target.value);
    audio.volume = vol;
    setVolume(vol);
  };

  return (
    <div className="flex flex-row items-center gap-1 mt-1">
      <audio ref={audioRef} src="src/music/volvo.mp3" loop />
      <MoneyRain active={isPlaying && currentTrack.includes("tequila")} />
      <button
        onClick={togglePlay}
        className="px-2 py-1 bg-gray-600 text-white rounded"
      >
        {isPlaying ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 5C22 3.34315 20.6569 2 19 2H17C15.3431 2 14 3.34315 14 5V19C14 20.6569 15.3431 22 17 22H19C20.6569 22 22 20.6569 22 19V5ZM20 5C20 4.44772 19.5523 4 19 4H17C16.4477 4 16 4.44772 16 5V19C16 19.5523 16.4477 20 17 20H19C19.5523 20 20 19.5523 20 19V5Z"
              stroke="white"
              fill="white"
            />
            <path
              d="M10 5C10 3.34315 8.65686 2 7 2H5C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H7C8.65686 22 10 20.6569 10 19V5ZM8 5C8 4.44772 7.55229 4 7 4H5C4.44772 4 4 4.44772 4 5V19C4 19.5523 4.44772 20 5 20H7C7.55229 20 8 19.5523 8 19V5Z"
              stroke="white"
              fill="white"
            />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5.46484 3.92349C4.79896 3.5739 4 4.05683 4 4.80888V19.1911C4 19.9432 4.79896 20.4261 5.46483 20.0765L19.1622 12.8854C19.8758 12.5108 19.8758 11.4892 19.1622 11.1146L5.46484 3.92349ZM2 4.80888C2 2.55271 4.3969 1.10395 6.39451 2.15269L20.0919 9.34382C22.2326 10.4677 22.2325 13.5324 20.0919 14.6562L6.3945 21.8473C4.39689 22.8961 2 21.4473 2 19.1911V4.80888Z"
              stroke="white"
              fill="white"
            />
          </svg>
        )}
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
