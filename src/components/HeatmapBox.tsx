import React from "react";
import type { MarketItem } from "../types";

interface Props {
  item: MarketItem;
  timeframe: "6h" | "24h" | "72h" | "7days" | "30days";
}

const HeatmapBox: React.FC<Props> = ({ item, timeframe }) => {
  const current = parseFloat(item["Current price"].replace(",", "."));
  const past = parseFloat(item[`${timeframe} ago`].replace(",", "."));
  const supply = parseFloat(item.Supply);
  const mcap = supply * past;
  const change = ((current - past) / past) * 100;

  const clampedChange = Math.max(-100, Math.min(100, change));

  let r = 0,
    g = 0,
    b = 0;

  if (clampedChange < 0) {
    const intensity = Math.min(Math.abs(clampedChange) / 100, 1);
    r = 150 + 55 * intensity;
    g = Math.round(40 * (1 - intensity));
    b = Math.round(40 * (1 - intensity));
  } else {
    const intensity = Math.min(clampedChange / 100, 1);
    r = Math.round(100 * (1 - intensity));
    g = 150 + 55 * intensity;
    b = Math.round(100 * (1 - intensity));
  }

  const adjust = (value: any, amount: number) =>
    Math.min(255, Math.max(0, value + amount));

  const lighter = `rgb(${adjust(r, 20)}, ${adjust(g, 20)}, ${adjust(b, 20)})`;
  const base = `rgb(${r}, ${g}, ${b})`;
  const darker = `rgb(${adjust(r, -20)}, ${adjust(g, -20)}, ${adjust(b, -20)})`;

  const minMCAP = 128000;
  const maxMCAP = 143638710;
  const normalized = (mcap: number) =>
    ((mcap - minMCAP) / (maxMCAP - minMCAP)) * 0.8 + 0.2;
  const fontScale = normalized(mcap);
  const fontSize = `${0.2 + fontScale * 1}rem`;
  const hoverScale = 1.15;
  return (
    <div
      className="transition-transform duration-300 ease-in-out flex flex-col items-center justify-center text-black p-0 text-center transition-all hover:z-20"
      style={{
        background: `radial-gradient(
      circle at 50%,
      ${lighter} 0%,
      ${base} 70%,
      ${darker} 100%
    )`,
        transformOrigin: "center",
      }}
      title={`${item.Item}\n${change.toFixed(2)}% (${timeframe})`}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = `scale(${hoverScale})`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <p style={{ fontSize, fontWeight: "600" }}>{item.Item}</p>
      <p style={{ fontSize, fontWeight: "600" }}>{change.toFixed(2)}%</p>
      <p style={{ fontSize, fontWeight: "600" }}>
        MCAP:{" "}
        {(mcap / 1_000_000).toLocaleString("fr-FR", {
          maximumFractionDigits: 1,
        })}{" "}
        M€
      </p>
    </div>
  );
};

export default HeatmapBox;
