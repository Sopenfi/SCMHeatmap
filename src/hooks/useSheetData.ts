import { useEffect, useState } from "react";
import type { MarketItem } from "../types";

export function useSheetData(sheetId: string, sheetName: string) {
  const [data, setData] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://opensheet.elk.sh/${sheetId}/${sheetName}`
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching sheet:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sheetId, sheetName]);

  return { data, loading };
}
