import { useEffect, useRef, useState } from "react";

interface Props {
  viewMode: String;
  setViewMode: (t: any) => void;
}
const viewModeSelector: React.FC<Props> = ({ viewMode, setViewMode }) => {
  const options = ["Divided", "Combined"];
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
    setViewMode(o);
    setOpen(false);
  };
  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-300 focus:outline-none"
      >
        Grouping ({viewMode})
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
        <div className="absolute left-0 mt-1 w-full origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-70">
          <div className="py-1">
            {options.map((o) => (
              <button
                key={o}
                onClick={() => handleSelect(o)}
                className={`block w-full text-left px-4 py-2 text-sm rounded ${
                  viewMode === o
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default viewModeSelector;
