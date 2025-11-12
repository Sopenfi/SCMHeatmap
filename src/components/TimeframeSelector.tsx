import React, { useState, useEffect, useRef } from "react";

interface Props {
  timeframe: "6h" | "24h" | "3D" | "7D" | "30D";
  setTimeframe: React.Dispatch<
    React.SetStateAction<"6h" | "24h" | "3D" | "7D" | "30D">
  >;
}

const TimeframeSelector: React.FC<Props> = ({ timeframe, setTimeframe }) => {
  const options = ["6h", "24h", "3D", "7D", "30D"] as const;
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleSelect = (o: (typeof options)[number]) => {
    setTimeframe(o);
    setOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex justify-between w-45 rounded-md shadow-sm p-2 py-1 text-sm font-semibold text-white  hover:bg-gray-900 focus:outline-none"
      >
        <div className="flex items-center gap-2 ">
          <svg width="24" height="24">
            {/* Row 1 */}
            <rect width="10" height="10" fill="#51cc53" rx="2" x="0" y="1" />
            <rect width="10" height="10" fill="#c25a48ff" rx="2" x="12" y="1" />

            {/* Row 2 */}
            <rect width="10" height="10" fill="#992824ff" rx="2" x="0" y="13" />
            <rect width="10" height="10" fill="#24994f" rx="2" x="12" y="13" />
          </svg>
          Change ({timeframe}), %
        </div>
        <svg
          className={`ml-2 -mr-1 h-5 w-5 transition-transform duration-400 ${
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
        <div className="absolute left-0 mt-1 w-48 origin-top-left rounded-md bg-black shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1 flex flex-col items-center gap-1">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => handleSelect(o)}
                className={`block  text-left px-2 py-2 text-sm rounded ${
                  timeframe === o
                    ? "bg-gray-700 text-white w-[90%] h-[90%]"
                    : "hover:text-white text-gray-600 w-[90%] h-[90%]"
                }`}
              >
                Change {o}, %
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeframeSelector;
