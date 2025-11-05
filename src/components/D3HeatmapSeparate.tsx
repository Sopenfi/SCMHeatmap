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
  viewMode: string; // "Combined" or "Divided"
}

interface MyNode {
  name: string;
  value?: number;
  change?: number;
  box_size?: number;
  clampedChange?: number;
  children?: MyNode[];
}

const ResponsiveTreemap: React.FC<Props> = ({ data, timeframe, viewMode }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  // --- track container size ---
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

  // --- compute values & sort ---
  const sortedData = useMemo(() => {
    return [...data]
      .map((item) => {
        const current = parseFloat(item["Current price"].replace(",", "."));
        const past = parseFloat(item[`${timeframe} ago`].replace(",", "."));
        const supply = parseFloat(item.Supply);
        const size = parseFloat(item.Size);
        const mcap = past * supply;
        const box_size = Math.pow(mcap, 0.7);
        const change = ((current - past) / past) * 100;
        const clampedChange = Math.max(-100, Math.min(100, change));
        return { ...item, MCAP: mcap, change, clampedChange, box_size };
      })
      .sort((a, b) => b.MCAP - a.MCAP);
  }, [data, timeframe]);

  // --- build tree structure ---
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

    // Divided view
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

  //combined treemap
  const combinedRoot = useMemo(() => {
    if (viewMode !== "Combined" || size.width === 0 || size.height === 0)
      return null;

    const root = hierarchy<MyNode>(treeData)
      .sum((d) => d.box_size ?? 0)
      .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

    treemap<MyNode>()
      .size([size.width, size.height])
      .padding(1)
      .paddingTop(10)
      .paddingLeft(4)
      .paddingRight(4)
      .paddingBottom(10)(root);

    return root as HierarchyRectangularNode<MyNode>;
  }, [treeData, size, viewMode]);

  // RENDER
  if (viewMode === "Combined") {
    if (!combinedRoot)
      return <div ref={containerRef} className="w-full h-[650px]" />;

    const leaves = combinedRoot.leaves() as HierarchyRectangularNode<MyNode>[];
    const sectorGroups = (combinedRoot.children ??
      []) as HierarchyRectangularNode<MyNode>[];

    return (
      <div ref={containerRef} className="relative w-full h-[650px]">
        {sectorGroups.map((group, i) => {
          const { x0, y0, x1, data } = group;
          return (
            <div
              key={`title-${i}`}
              className="absolute font-semibold text-gray-300 text-sm pointer-events-none"
              style={{
                left: x0 + 10,
                top: y0 - 10,
                whiteSpace: "nowrap",
              }}
            ></div>
          );
        })}

        {leaves.map((leaf, i) => {
          const { x0, y0, x1, y1, data } = leaf;
          const w = x1 - x0;
          const h = y1 - y0;
          const clampedChange = data.clampedChange ?? 0;
          const intensity = Math.min(Math.abs(clampedChange) / 100, 1);
          let r, g, b;
          if (clampedChange < 0) {
            r = 150 + 55 * intensity;
            g = 40 * (1 - intensity);
            b = 40 * (1 - intensity);
          } else {
            r = 100 * (1 - intensity);
            g = 150 + 55 * intensity;
            b = 100 * (1 - intensity);
          }

          return (
            <div
              key={i}
              className="absolute flex flex-col items-center justify-center text-xs text-black font-semibold text-center"
              style={{
                left: x0,
                top: y0,
                width: w,
                height: h,
                background: `rgb(${r},${g},${b})`,
                boxSizing: "border-box",
              }}
            >
              {w > 60 && h > 60 && (
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
  }

  // divided view separate treemaps
  const groupedSectors = (treeData.children ?? []) as MyNode[];
  const numSectors = groupedSectors.length;
  let cols: number;

  if (size.width < 600) {
    cols = 1;
  } else if (size.width < 900) {
    cols = 2;
  } else if (size.width < 1300) {
    cols = 3;
  } else {
    cols = 4;
  }

  const rows = Math.ceil(numSectors / cols);
  const sectorWidth = size.width / cols;
  const sectorHeight = size.height / rows;

  return (
    <div ref={containerRef} className="relative w-full md:h-[650px] h-[1300px]">
      {groupedSectors.map((sector, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const xOffset = col * sectorWidth;
        const yOffset = row * sectorHeight;

        // Build treemap for this sector
        const localRoot = treemap<MyNode>()
          .size([sectorWidth, sectorHeight])
          .padding(1)
          .paddingTop(10)
          .paddingBottom(10)
          .paddingRight(3)
          .paddingLeft(3)(
          hierarchy<MyNode>(sector)
            .sum((d) => d.box_size ?? 0)
            .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
        ) as HierarchyRectangularNode<MyNode>;

        return (
          <div
            key={sector.name}
            style={{
              position: "absolute",
              left: xOffset,
              top: yOffset,
              width: sectorWidth,
              height: sectorHeight,
            }}
          >
            <div
              className="absolute top-0 left-2 text-gray-300 text-sm font-semibold z-100"
              style={{ top: "-10px" }}
            >
              {sector.name}s
            </div>

            {localRoot.leaves().map((leaf, j) => {
              const { x0, y0, x1, y1, data } = leaf;
              const w = x1 - x0;
              const h = y1 - y0;
              const clampedChange = data.clampedChange ?? 0;
              const intensity = Math.min(Math.abs(clampedChange) / 100, 1);
              const color =
                clampedChange < 0
                  ? `rgb(${150 + 55 * intensity}, ${40 * (1 - intensity)}, ${
                      40 * (1 - intensity)
                    })`
                  : `rgb(${100 * (1 - intensity)}, ${150 + 55 * intensity}, ${
                      100 * (1 - intensity)
                    })`;

              return (
                <div
                  key={j}
                  className="absolute flex flex-col items-center justify-center text-xs text-black font-semibold text-center"
                  style={{
                    position: "absolute",
                    left: x0,
                    top: y0,
                    width: w,
                    height: h,
                    background: color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "black",
                    overflow: "hidden",
                  }}
                >
                  {w > 60 && h > 60 && (
                    <>
                      <div>{data.name}</div>
                      <p>{data.change?.toFixed(2)}%</p>
                      <div>
                        {((data.value ?? 0) / 1_000_000).toLocaleString(
                          "fr-FR",
                          {
                            maximumFractionDigits: 1,
                          }
                        )}{" "}
                        M€
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default ResponsiveTreemap;
