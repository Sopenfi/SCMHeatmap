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

        const mcap = price * supply;

        return { ...item, MCAP: mcap };
      })
      .sort((a, b) => b.MCAP - a.MCAP);
  }, [data, timeframe]);

  return (
    <div className="grid grid-cols-2 gap-0 p-0 pt-0 mt-0 m-10">
      {/* LEFT SIDE */}
      <div className="col-span-1 grid grid-rows-2 h-160">
        <HeatmapBox item={sortedData[0]} timeframe={timeframe} />
        <HeatmapBox item={sortedData[1]} timeframe={timeframe} />
      </div>

      {/* RIGHT SIDE */}
      <div className="grid grid-cols-2 grid-rows-4 gap-0 h-160">
        <HeatmapBox item={sortedData[2]} timeframe={timeframe} />
        <HeatmapBox item={sortedData[3]} timeframe={timeframe} />
        <HeatmapBox item={sortedData[4]} timeframe={timeframe} />
        <HeatmapBox item={sortedData[5]} timeframe={timeframe} />
        <HeatmapBox item={sortedData[6]} timeframe={timeframe} />

        <div className="grid grid-cols-2 grid-rows-1 w-full h-full gap-0">
          <HeatmapBox item={sortedData[7]} timeframe={timeframe} />
          <HeatmapBox item={sortedData[8]} timeframe={timeframe} />
        </div>

        <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0">
          <HeatmapBox item={sortedData[9]} timeframe={timeframe} />
          <HeatmapBox item={sortedData[10]} timeframe={timeframe} />
          <HeatmapBox item={sortedData[11]} timeframe={timeframe} />
          <HeatmapBox item={sortedData[12]} timeframe={timeframe} />
        </div>

        <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0">
          <HeatmapBox item={sortedData[13]} timeframe={timeframe} />
          <HeatmapBox item={sortedData[14]} timeframe={timeframe} />

          <div className="grid grid-cols-2 grid-rows-1 w-full h-full gap-0">
            <HeatmapBox item={sortedData[15]} timeframe={timeframe} />
            <HeatmapBox item={sortedData[16]} timeframe={timeframe} />
          </div>

          <div className="grid grid-cols-2 grid-rows-2 w-full h-full gap-0">
            <HeatmapBox item={sortedData[17]} timeframe={timeframe} />
            <HeatmapBox item={sortedData[18]} timeframe={timeframe} />
            <HeatmapBox item={sortedData[19]} timeframe={timeframe} />
            <HeatmapBox item={sortedData[20]} timeframe={timeframe} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Heatmap;
