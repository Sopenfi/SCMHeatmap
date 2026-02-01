import React, { useState, useEffect } from "react";
import { useSheetData } from "./hooks/useSheetData";
import TimeframeSelector from "./components/TimeframeSelector.tsx";
import "./index.css";
import Change from "./components/Change.tsx";
import Loading from "./components/Loading.tsx";
import ViewModeSelector from "./components/viewModeSelector.tsx";
import D3Heatmap from "./components/D3Heatmap.tsx";
import ScaleSelector from "./components/ScaleSelector.tsx";

import GetLegend from "./hooks/GetLegend";
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
      const timeout = setTimeout(() => setShowLoading(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  if (loading || showLoading) return <Loading />;

  return (
    <>
      {(loading || showLoading) && <Loading />}
      <div style={{ display: loading || showLoading ? "none" : "block" }}>
        <div className="min-h-screen px-2 pt-2 pb-1 p-2 flex flex-col bg-black">
          <div className="w-full flex justify-between items-center">
            <h1 className="ml-3 text-3xl font-semibold font-Raleway text-white">
              SCM Heatmap
            </h1>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-2 sm:gap-4 mt-2 px-3">
            <div className="flex flex-row gap-2 sm:gap-4">
              <ScaleSelector BoxSize={BoxSize} setBoxSize={setBoxSize} />
              <ViewModeSelector viewMode={viewMode} setViewMode={setViewMode} />
            </div>
            <div className="flex flex-row gap-2 sm:gap-4">
              <div className="text-3xl font-bold text-white flex items-center">
                <TimeframeSelector
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                />
                <Change data={data} timeframe={timeframe} />
              </div>
            </div>
          </div>
          <div className="pr-3 pl-3">
            <D3Heatmap
              data={data}
              timeframe={timeframe}
              viewMode={viewMode}
              BoxSize={BoxSize}
            />
          </div>
          <div className="text-white flex flex-col justify-start md:w-100 w-100% mr-3 ml-3">
            <GetLegend timeframe={timeframe} />
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
