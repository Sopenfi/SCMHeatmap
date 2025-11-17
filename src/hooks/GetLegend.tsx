import React from "react";
import { getColorInfo } from "./getColorInfo";

interface Props {
  timeframe: "6h" | "24h" | "3D" | "7D" | "30D";
}

const GetLegend: React.FC<Props> = ({ timeframe }) => {
  const { thresholds } = getColorInfo(1, timeframe);
  const colorBars = [
    { label: thresholds.tNegative100, color: "rgba(242, 54, 69, 1)" }, // worst
    { label: thresholds.tNegative66, color: "rgba(178, 40, 51,1)" }, // second worst
    { label: thresholds.tNegative33, color: "rgba(128, 25, 34,1)" }, // third worst
    { label: 0, color: "rgb(61, 61, 61)" }, // neutral
    { label: thresholds.tPositive33, color: "rgb(26, 51, 38)" }, // third best
    { label: thresholds.tPositive66, color: "rgb(5, 102, 54)" }, // second best
    { label: thresholds.tPositive100, color: "rgb(8, 153, 80)" }, // best
  ];
  return (
    <div>
      <div className="flex flex-row h-10 justify-evenly w-100%">
        {colorBars.map((bar, i) => (
          <div
            className="flex flex-col w-20 justify-center items-center "
            key={i}
          >
            {Number.isInteger(bar.label) ? bar.label : bar.label.toFixed(1)}%
            <div
              key={i}
              className="rounded-sm"
              style={{
                backgroundColor: bar.color,
                width: "100%",
                height: 10,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GetLegend;
