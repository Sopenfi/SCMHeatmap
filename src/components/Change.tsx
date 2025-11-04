import { useMemo } from "react";
import type { MarketItem } from "../types";

interface ChangeProps {
  data: MarketItem[];
  timeframe: "6h" | "24h" | "3D" | "7D" | "30D";
}
const Change: React.FC<ChangeProps> = ({ data, timeframe }) => {
  const sortedData = useMemo(() => {
    return [...data]
      .map((item) => {
        const currentPrice = parseFloat(
          item["Current price"].replace(",", ".")
        );
        const pastPrice = parseFloat(
          item[`${timeframe} ago`].replace(",", ".")
        );
        const supply = parseFloat(item.Supply);

        const currentMCAP = currentPrice * supply;
        const pastMCAP = pastPrice * supply;

        const priceDiff = currentPrice - pastPrice;
        const priceDiffPct = ((currentPrice - pastPrice) / pastPrice) * 100;

        const mcapDiff = currentMCAP - pastMCAP;
        const mcapDiffPct = ((currentMCAP - pastMCAP) / pastMCAP) * 100;

        return {
          ...item,
          CurrentMCAP: currentMCAP,
          PastMCAP: pastMCAP,
          PriceDiff: priceDiff,
          PriceDiffPct: priceDiffPct,
          MCAPDiff: mcapDiff,
          MCAPDiffPct: mcapDiffPct,
        };
      })
      .sort((a, b) => b.CurrentMCAP - a.CurrentMCAP);
  }, [data, timeframe]);

  const totalChange = useMemo(() => {
    const totalCurrentMCAP = sortedData.reduce(
      (sum, item) => sum + item.CurrentMCAP,
      0
    );
    const totalPastMCAP = sortedData.reduce(
      (sum, item) => sum + item.PastMCAP,
      0
    );

    const totalDiff = totalCurrentMCAP - totalPastMCAP;
    const totalDiffPct =
      ((totalCurrentMCAP - totalPastMCAP) / totalPastMCAP) * 100;

    return { totalCurrentMCAP, totalPastMCAP, totalDiff, totalDiffPct };
  }, [sortedData]);

  console.log(totalChange.totalDiffPct);

  return (
    <div>
      <h1
        className={
          totalChange.totalDiffPct < 0 ? "text-red-500" : "text-green-500"
        }
      >
        {" "}
        {totalChange.totalDiffPct.toFixed(2)} %{" "}
      </h1>
    </div>
  );
};

export default Change;
