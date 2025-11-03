import React from "react";
import type { MarketItem } from "../types";
import HeatmapBox from "./HeatmapBox.tsx";
import { useMemo } from "react";

interface Props {
  data: MarketItem[];
  timeframe: "6h" | "24h" | "72h" | "7days" | "30days";
}

const Heatmap: React.FC<Props> = ({ data, timeframe }) => {
  const sortedData = useMemo(() => {
    return [...data]
      .map((item) => {
        const price = parseFloat(item[`${timeframe} ago`].replace(",", "."));
        const supply = parseFloat(item.Supply);
        const type = item.Type;

        const mcap = price * supply;

        return { ...item, MCAP: mcap, Type: type };
      })
      .sort((a, b) => b.MCAP - a.MCAP);
  }, [data, timeframe]);
  const cases = sortedData.filter((item) => item.Type === "Case");
  const skins = sortedData.filter((item) => item.Type === "Skin");
  return (
    <div className="grid lg:grid-cols-2 grid-rows-2 gap-0 p-0 pt-0 mt-0 m-0">
      {/* LEFT MAIN GRID */}
      <div className="m-2 ">
        {/* Title for left grid */}
        <h2 className="text-lg font-semibold mb-1 text-center italic">Cases</h2>

        <div className="grid grid-cols-2 gap-0 p-0 m-1">
          {/* LEFT SIDE */}
          <div className="col-span-1 grid grid-rows-2 h-160">
            <HeatmapBox item={cases[0]} timeframe={timeframe} />
            <HeatmapBox item={cases[1]} timeframe={timeframe} />
          </div>

          {/* RIGHT SIDE */}
          <div className="grid grid-cols-2 grid-rows-4 gap-0 h-160">
            {cases.slice(2, 8).map((item, idx) => (
              <HeatmapBox key={idx} item={item} timeframe={timeframe} />
            ))}

            <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0">
              {cases.slice(8, 12).map((item, idx) => (
                <HeatmapBox key={idx} item={item} timeframe={timeframe} />
              ))}
            </div>

            <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0">
              {cases.slice(12, 16).map((item, idx) => (
                <HeatmapBox key={idx} item={item} timeframe={timeframe} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT MAIN GRID */}
      <div className="m-2">
        {/* Title for right grid */}
        <h2 className="text-lg font-semibold mb-0 text-center italic">Skins</h2>

        <div className="grid grid-cols-2 gap-0 p-0 m-1">
          {/* LEFT SIDE */}
          <div className="col-span-1 grid grid-rows-2 h-160">
            <HeatmapBox item={skins[0]} timeframe={timeframe} />
            <HeatmapBox item={skins[1]} timeframe={timeframe} />
          </div>

          {/* RIGHT SIDE */}
          <div className="grid grid-cols-2 grid-rows-4 gap-0 h-160">
            {skins.slice(2, 8).map((item, idx) => (
              <HeatmapBox key={idx} item={item} timeframe={timeframe} />
            ))}

            <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0">
              {skins.slice(8, 12).map((item, idx) => (
                <HeatmapBox key={idx} item={item} timeframe={timeframe} />
              ))}
            </div>

            <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0">
              {skins.slice(12, 16).map((item, idx) => (
                <HeatmapBox key={idx} item={item} timeframe={timeframe} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
