import React, { useState, useEffect } from "react";
import { useSheetData } from "./hooks/useSheetData";
import TimeframeSelector from "./components/TimeframeSelector.tsx";
import "./index.css";
import BackgroundMusic from "./components/Music.tsx";
import Change from "./components/Change.tsx";
import Loading from "./components/Loading.tsx";
import ViewModeSelector from "./components/viewModeSelector.tsx";
import D3Heatmap from "./components/D3Heatmap.tsx";
import BoxSizeSelector from "./components/BoxSizeSelector.tsx";

const SHEET_ID = "1HGYx_kpOQgQHKVnwkY1Dm5oyqqdCO9pOep-TbYUVHvQ";
const SHEET_NAME = "data";

const App: React.FC = () => {
  const { data, loading } = useSheetData(SHEET_ID, SHEET_NAME);
  const [showLoading, setShowLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<
    "6h" | "24h" | "3D" | "7D" | "30D"
  >("24h");
  const [BoxSize, setBoxSize] = useState<number>(0.8);

  const [viewMode, setViewMode] = useState<"Divided" | "Combined">("Divided");

  useEffect(() => {
    if (!loading) {
      const timeout = setTimeout(() => setShowLoading(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  if (loading || showLoading) return <Loading />;

  return (
    <div className="min-h-screen lg:px-40 md:px-20 pt-3 pb-10 p-2 flex flex-col items-center bg-gradient-to-t from-gray-900 to-gray-700">
      <h1 className="text-4xl font-bold">SCM Heatmap</h1>

      <BackgroundMusic data={data} timeframe={timeframe} />

      <div className="flex sm:flex-row flex-col items-center mb-0 mt-2 gap-10 mb-2">
        <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
        <TimeframeSelector timeframe={timeframe} setTimeframe={setTimeframe} />
        <BoxSizeSelector BoxSize={BoxSize} setBoxSize={setBoxSize} />
        <div className="text-3xl font-bold text-white ml-0 flex items-center">
          <Change data={data} timeframe={timeframe} />
        </div>
      </div>
      <D3Heatmap
        data={data}
        timeframe={timeframe}
        viewMode={viewMode}
        BoxSize={BoxSize}
      />
    </div>
  );
};

export default App;
