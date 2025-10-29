import React, { useState } from "react";
import { useSheetData } from "./hooks/useSheetData";
import Heatmap from "./components/Heatmap";
import TimeframeSelector from "./components/TimeframeSelector.tsx";
import "./index.css";
import BackgroundMusic from "./components/Music.tsx";
import Change from "./components/Change.tsx";
const SHEET_ID = "1HGYx_kpOQgQHKVnwkY1Dm5oyqqdCO9pOep-TbYUVHvQ";
const SHEET_NAME = "data";

const App: React.FC = () => {
  const { data, loading } = useSheetData(SHEET_ID, SHEET_NAME);

  const [timeframe, setTimeframe] = useState<
    "6h" | "24h" | "72h" | "7days" | "30days"
  >("6h");

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen lg:px-70 md:px-20 pt-3 flex flex-col items-center bg-gradient-to-t from-gray-900 to-gray-700">
      <h1 className="text-4xl font-bold">SCM Heatmap</h1>

      <BackgroundMusic data={data} timeframe={timeframe} />

      <div className="flex sm:flex-row flex-col items-center mb-2 mt-2">
        <TimeframeSelector timeframe={timeframe} setTimeframe={setTimeframe} />
        <div className="text-3xl font-bold text-white ml-6 flex items-center">
          <Change data={data} timeframe={timeframe} />
        </div>
      </div>
      <Heatmap data={data} timeframe={timeframe} />
    </div>
  );
};

export default App;
