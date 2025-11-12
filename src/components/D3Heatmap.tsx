import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  treemap,
  hierarchy,
  type HierarchyRectangularNode,
  treemapBinary,
} from "d3-hierarchy";
import type { MarketItem } from "../types";

interface Props {
  data: MarketItem[];
  timeframe: "6h" | "24h" | "3D" | "7D" | "30D";
  viewMode: string;
  BoxSize: number;
}

interface MyNode {
  name: string;
  value?: number;
  box_size?: number;
  change?: number;
  clampedChange?: number;
  children?: MyNode[];
}

const ResponsiveTreemap: React.FC<Props> = ({
  data,
  timeframe,
  viewMode,
  BoxSize,
}) => {
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
        //const box_size = Math.pow(mcap, 0.8);
        console.log(BoxSize);
        const box_size = Math.pow(mcap, BoxSize);
        const change = ((current - past) / past) * 100;
        const clampedChange = Math.max(-100, Math.min(100, change));

        return { ...item, MCAP: mcap, change, clampedChange, box_size };
      })
      .sort((a, b) => b.MCAP - a.MCAP);
  }, [data, timeframe, BoxSize]);

  const treeData = useMemo(() => {
    if (viewMode === "Combined") {
      return {
        name: "root",
        children: sortedData.map((item) => ({
          name: item.Item,
          value: item.MCAP,
          box_size: item.box_size,
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
        box_size: item.box_size,
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

  const root = useMemo(() => {
    if (size.width === 0 || size.height === 0) return null;

    const root = hierarchy<MyNode>(treeData)
      .sum((d) => d.box_size ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    treemap<MyNode>()
      .tile(treemapBinary)
      .size([size.width, size.height])
      .padding(2)
      .paddingTop(10)
      .paddingLeft(4)
      .paddingRight(4)
      .paddingBottom(10)(root);

    return root as HierarchyRectangularNode<MyNode>;
  }, [treeData, size]);

  if (!root) return <div ref={containerRef} className="w-full h-[750px]" />;

  const leaves = root.leaves() as HierarchyRectangularNode<MyNode>[];
  const sectorGroups = (root.children ??
    []) as HierarchyRectangularNode<MyNode>[];

  return (
    <div
      ref={containerRef}
      className="relative w-full md:h-[750px] h-[1000px]" // taller on mobile
    >
      {/* show sector titles when not combined */}
      {viewMode !== "Combined" &&
        sectorGroups.map((group, i) => {
          const { x0, y0, data } = group;
          return (
            <div
              key={`title-${i}`}
              className="absolute text-gray-300 text-sm pointer-events-none z-10 leading-none font-Raleway font-light"
              style={{
                left: x0 + 10,
                top: y0 - 8,
                whiteSpace: "nowrap",
              }}
            >
              {data.name}s{" >"}
            </div>
          );
        })}

      {/* treemap */}
      {leaves.map((leaf, i) => {
        const { x0, y0, x1, y1, data } = leaf;
        const w = Math.max(0, x1 - x0);
        const h = Math.max(0, y1 - y0);
        const clampedChange = data.clampedChange ?? 0;
        const intensity = Math.min(Math.abs(clampedChange) / 100, 1);

        const maxBoxSize = Math.max(...leaves.map((l) => l.data.box_size ?? 0));
        const boxSizeNormalized = (data.box_size ?? 0) / maxBoxSize;
        const minFont = 8;
        const maxFont = 12;

        const fontSize = Math.min(
          minFont + (maxFont - minFont) * boxSizeNormalized,
          w / 5,
          h / 3
        );

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
            className="absolute flex flex-col items-center justify-center text-black font-semibold text-center"
            style={{
              left: x0,
              top: y0,
              width: w,
              height: h,
              background: `radial-gradient(circle at 50%, ${lighter} 0%, ${base} 70%, ${darker} 100%)`,
              boxSizing: "border-box",
              fontSize: `${fontSize}px`,
            }}
          >
            {w > 80 && h > 60 ? (
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
            ) : w > 50 && h > 30 ? (
              <>
                <div>{data.name}</div>
                <div>{data.change?.toFixed(2)}%</div>
              </>
            ) : w > 40 && h > 30 ? (
              <div> {data.name} </div>
            ) : (
              <div> </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResponsiveTreemap;
