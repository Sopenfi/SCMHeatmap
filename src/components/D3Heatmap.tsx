import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  treemap,
  hierarchy,
  type HierarchyRectangularNode,
  treemapBinary,
} from "d3-hierarchy";
import type { MarketItem } from "../types";
import { getColorInfo } from "../hooks/getColorInfo";

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
  image_url?: string;
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
        const image_url = item.Image;
        const mcap = past * supply;
        //const box_size = Math.pow(mcap, 0.8);
        console.log(BoxSize);
        const box_size = Math.pow(mcap, BoxSize);
        const change = ((current - past) / past) * 100;
        const clampedChange = Math.max(-100, Math.min(100, change));
        const timescale = past;
        return {
          ...item,
          MCAP: mcap,
          change,
          clampedChange,
          box_size,
          image_url,
          timescale,
        };
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
          image_url: item.image_url,
        })),
      };
    }

    const grouped: Record<string, MyNode[]> = {};
    sortedData.forEach((item) => {
      if (!grouped[item.Type]) grouped[item.Type] = [];
      grouped[item.Type].push({
        name: item.Item,
        value: item.MCAP,
        box_size: item.box_size,
        change: item.change,
        clampedChange: item.clampedChange,
        image_url: item.image_url,
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
      .paddingLeft(3)
      .paddingRight(3)
      .paddingBottom(5)(root);

    return root as HierarchyRectangularNode<MyNode>;
  }, [treeData, size]);

  if (!root) return <div ref={containerRef} className="w-full h-[800px]" />;

  const leaves = root.leaves() as HierarchyRectangularNode<MyNode>[];
  const sectorGroups = (root.children ??
    []) as HierarchyRectangularNode<MyNode>[];

  return (
    <div
      ref={containerRef}
      className="relative w-full md:h-[800px] h-[1300px]" // taller on mobile
    >
      {viewMode !== "Combined" &&
        sectorGroups.map((group, i) => {
          const { x0, y0, data } = group;
          return (
            <div
              key={`title-${i}`}
              className="absolute text-gray-300 text-sm pointer-events-none z-10 leading-none font-Raleway font-light"
              style={{
                left: x0 + 10,
                top: y0 - 7,
                whiteSpace: "nowrap",
                maxWidth: group.x1 - group.x0 - 8,
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {data.name}s{" >"}
            </div>
          );
        })}

      {leaves.map((leaf, i) => {
        const { x0, y0, x1, y1, data } = leaf;
        const w = Math.max(0, x1 - x0);
        const h = Math.max(0, y1 - y0);

        const maxBoxSize = Math.max(...leaves.map((l) => l.data.box_size ?? 0));
        const boxSizeNormalized = (data.box_size ?? 0) / maxBoxSize;

        const { color } = getColorInfo(data.change, timeframe);
        const minFontSize = 9;
        const fontSize = Math.max(
          minFontSize,
          (w + h) * 0.05 * boxSizeNormalized,
        );

        return (
          <div
            key={i}
            className="absolute flex flex-col items-center justify-center text-black text-center "
            style={{
              left: x0,
              top: y0,
              width: w,
              height: h,
              background: color,
              boxSizing: "border-box",
              fontSize: `${fontSize}px`,
              fontWeight: 400,
            }}
          >
            {w > 80 && h > 60 ? (
              <>
                <img
                  src={data.image_url}
                  className="w-[full] h-[40%] object-contain duration-300 ease-in-out hover:scale-[1.5] z-10 hover:z-[15]"
                />
                <div>
                  {data.change != null
                    ? data.change >= 0
                      ? `+${data.change.toFixed(2)}%`
                      : `${data.change.toFixed(2)}%`
                    : ""}
                </div>
              </>
            ) : w > 40 && h > 30 ? (
              <>
                <img
                  src={data.image_url}
                  className="w-[full] h-[60%] object-contain"
                />
                <div>{data.change?.toFixed(2)}%</div>{" "}
              </>
            ) : (
              <></>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ResponsiveTreemap;
