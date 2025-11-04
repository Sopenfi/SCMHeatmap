import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  treemap,
  hierarchy,
  type HierarchyRectangularNode,
} from "d3-hierarchy";
import type { MarketItem } from "../types";

interface Props {
  data: MarketItem[];
  timeframe: "6h" | "24h" | "3D" | "7D" | "30D";
  viewMode: string;
}

interface MyNode {
  name: string;
  value?: number;
  change?: number;
  clampedChange?: number;
  children?: MyNode[];
}

const ResponsiveTreemap: React.FC<Props> = ({ data, timeframe, viewMode }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () =>
      setSize({ width: el.offsetWidth, height: el.offsetHeight });
    updateSize();
    const obs = new ResizeObserver(updateSize);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const sortedData = useMemo(() => {
    return [...data]
      .map((item) => {
        const current = parseFloat(item["Current price"].replace(",", "."));
        const past = parseFloat(item[`${timeframe} ago`].replace(",", "."));
        const supply = parseFloat(item.Supply);
        const mcap = past * supply;
        const change = ((current - past) / past) * 100;
        const clampedChange = Math.max(-100, Math.min(100, change));
        return { ...item, MCAP: mcap, change, clampedChange };
      })
      .sort((a, b) => b.MCAP - a.MCAP);
  }, [data, timeframe]);

  const treeData = useMemo(() => {
    if (viewMode === "Combined") {
      return {
        name: "root",
        children: sortedData.map((item) => ({
          name: item.Item,
          value: item.MCAP,
          change: item.change,
          clampedChange: item.clampedChange,
        })),
      };
    }

    // Grouped view (by Type)
    const grouped: Record<string, MyNode[]> = {};
    sortedData.forEach((item) => {
      if (!grouped[item.Type]) grouped[item.Type] = [];
      grouped[item.Type].push({
        name: item.Item,
        value: item.MCAP,
        change: item.change,
        clampedChange: item.clampedChange,
      });
    });

    return {
      name: "root",
      children: Object.entries(grouped).map(([type, children]) => ({
        name: type,
        children,
      })),
    };
  }, [sortedData, viewMode]);

  // --- build hierarchy + layout ---
  const root = useMemo(() => {
    if (size.width === 0 || size.height === 0) return null;
    const root = hierarchy<MyNode>(treeData)
      .sum((d) => d.value ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    treemap<MyNode>()
      .size([size.width, size.height])
      .padding(1)
      .paddingTop(1)
      .paddingLeft(4)
      .paddingRight(4)
      .paddingBottom(1)(root);

    return root;
  }, [treeData, size]);

  if (!root) return <div ref={containerRef} className="w-full h-[650px]" />;

  const leaves = root.leaves() as HierarchyRectangularNode<MyNode>[];

  return (
    <div ref={containerRef} className="relative w-full h-[650px]">
      {leaves.map((leaf, i) => {
        const { x0, y0, x1, y1, data } = leaf;
        const w = Math.max(0, x1 - x0);
        const h = Math.max(0, y1 - y0);
        const clampedChange = data.clampedChange ?? 0;
        const intensity = Math.min(Math.abs(clampedChange) / 100, 1);

        let r, g, b;
        if (clampedChange < 0) {
          r = 150 + 55 * intensity;
          g = Math.round(40 * (1 - intensity));
          b = Math.round(40 * (1 - intensity));
        } else {
          r = Math.round(100 * (1 - intensity));
          g = 150 + 55 * intensity;
          b = Math.round(100 * (1 - intensity));
        }

        const adjust = (v: number, a: number) =>
          Math.min(255, Math.max(0, v + a));
        const lighter = `rgb(${adjust(r, 20)}, ${adjust(g, 20)}, ${adjust(
          b,
          20
        )})`;
        const base = `rgb(${r}, ${g}, ${b})`;
        const darker = `rgb(${adjust(r, -20)}, ${adjust(g, -20)}, ${adjust(
          b,
          -20
        )})`;

        return (
          <div
            key={i}
            className="absolute flex flex-col items-center justify-center text-xs text-black font-semibold text-center"
            style={{
              left: x0,
              top: y0,
              width: w,
              height: h,
              background: `radial-gradient(circle at 50%, ${lighter} 0%, ${base} 70%, ${darker} 100%)`,
              boxSizing: "border-box",
            }}
          >
            {w > 80 && h > 60 && (
              <>
                <div>{data.name}</div>
                <div>{data.change?.toFixed(2)}%</div>
                <div>
                  {((data.value ?? 0) / 1_000_000).toLocaleString("fr-FR", {
                    maximumFractionDigits: 1,
                  })}{" "}
                  M€
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResponsiveTreemap;
