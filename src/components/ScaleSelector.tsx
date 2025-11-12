import { Slider } from "@mui/material";
import { useEffect, useRef, useState } from "react";

interface Props {
  BoxSize: number;
  setBoxSize: (value: number) => void;
}
const ScaleSelector: React.FC<Props> = ({ BoxSize, setBoxSize }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (o: number) => {
    setBoxSize(o);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div ref={dropdownRef} className="relative inline-block text-left ">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex w-40 justify-between items-center rounded-md p-1 shadow-sm py-1 text-sm font-semibold text-white hover:bg-gray-900 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke="white"
              d="M6.5 21.5V17m0 4.5H11m-4.5 0L12 16m9.5-1v6.5H15M6.5 13V6.5H13m8.5 0V11m0-4.5H17m4.5 0L16 12"
            />
          </svg>
          {BoxSize === 1 ? (
            <span>Realistic scale</span>
          ) : BoxSize === 0 ? (
            <span>Unified scale</span>
          ) : (
            <span> Scale: ({BoxSize})</span>
          )}
        </div>

        <svg
          className={`h-5 w-5 transition-transform duration-400 ${
            open ? "rotate-180" : "rotate-0"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 mt-1 w-40 origin-top-left rounded-md bg-black shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="flex flex-col px-5">
            <Slider
              size="medium"
              value={BoxSize}
              onChange={(_, newValue) => handleSelect(newValue as number)}
              min={0}
              max={1}
              step={0.01}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ScaleSelector;
