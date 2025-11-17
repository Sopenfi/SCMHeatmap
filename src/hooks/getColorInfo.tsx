export type ColorScaleInfo = {
  color: string;
  thresholds: {
    tNegative100: number;
    tNegative66: number;
    tNegative33: number;
    tPositive33: number;
    tPositive66: number;
    tPositive100: number;
    scale: number;
  };
};

export const getColorInfo = (
  change: number | null | undefined,
  timeframe: string
): ColorScaleInfo => {
  const worst = "rgba(242, 54, 69, 1)";
  const secondworst = "rgba(178, 40, 51,1)";
  const thirdworst = "rgba(128, 25, 34,1)";
  const neutral = "rgb(61, 61, 61)";
  const thirdbest = "rgb(26, 51, 38)";
  const secondbest = "rgb(5, 102, 54)";
  const best = "rgb(8, 153, 80)";
  // determine scales for each timeframe
  const scales: Record<string, number> = {
    "6h": 4,
    "24h": 8,
    "3D": 16,
    "7D": 24,
    "30D": 30,
  };
  const scale = scales[timeframe] ?? 3;

  // tipping points
  const tNegative100 = -scale;
  const tNegative66 = -scale * 0.66;
  const tNegative33 = -scale * 0.33;
  const tPositive33 = scale * 0.33;
  const tPositive66 = scale * 0.66;
  const tPositive100 = scale;

  // determine color
  let color = neutral;
  if (change != null) {
    if (change <= tNegative66) color = worst;
    else if (change <= tNegative33) color = secondworst;
    else if (change < 0) color = thirdworst;
    else if (change < tPositive33) color = neutral;
    else if (change < tPositive66) color = thirdbest;
    else if (change < scale) color = secondbest;
    else color = best;
  }

  return {
    color,
    thresholds: {
      scale,
      tNegative100,
      tNegative66,
      tNegative33,
      tPositive33,
      tPositive66,
      tPositive100,
    },
  };
};
