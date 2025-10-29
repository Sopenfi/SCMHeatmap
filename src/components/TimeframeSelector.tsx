interface Props {
  timeframe: string;
  setTimeframe: (t: any) => void;
}

const TimeframeSelector: React.FC<Props> = ({ timeframe, setTimeframe }) => {
  const options = ["6h", "24h", "72h", "7days", "30days"];
  return (
    <div className="flex gap-2 ">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => setTimeframe(o)}
          className={`px-3 py-1 rounded ${
            timeframe === o ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
};

export default TimeframeSelector;
