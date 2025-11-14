import { useState, useEffect } from "react";
import { fetchRootIndex, fetchYearIndex, fetchLineData } from "../api";
import type { Cancellation } from "../types";
import { fileToLabel } from "../utils/dataTransforms";

export interface LineFile {
  file: string;
  label: string;
}

export function useKVVData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [lineFiles, setLineFiles] = useState<LineFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [rawData, setRawData] = useState<Cancellation[]>([]);

  // Initial load: root index
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const root = await fetchRootIndex();
        setYears(root.years);
        if (root.years.length > 0) {
          setSelectedYear(root.years[root.years.length - 1]); // latest year
        }
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load year index when year changes
  useEffect(() => {
    if (!selectedYear) return;
    (async () => {
      try {
        setLoading(true);
        const yearIndex = await fetchYearIndex(selectedYear);
        const files = yearIndex.files
          .filter((f) => f.endsWith(".json") && f !== "index.json")
          .map((f) => ({ file: f, label: fileToLabel(f) }));
        setLineFiles(files);
        setSelectedFiles(files.map((f) => f.file)); // default all
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedYear]);

  // Load data when selected year or files change
  useEffect(() => {
    if (!selectedYear || selectedFiles.length === 0) {
      setRawData([]);
      return;
    }
    (async () => {
      try {
        setLoading(true);
        const all: Cancellation[] = [];
        for (const file of selectedFiles) {
          const entries = await fetchLineData(selectedYear, file);
          // Ensure entries is an array before spreading
          if (Array.isArray(entries)) {
            all.push(...entries);
          } else {
            console.warn(`Invalid data format for ${file}:`, entries);
          }
        }
        // Sort by date/time descending
        all.sort((a, b) => {
          if (a.date === b.date) {
            return (b.fromTime ?? "").localeCompare(a.fromTime ?? "");
          }
          return b.date.localeCompare(a.date);
        });
        setRawData(all);
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedYear, selectedFiles]);

  return {
    loading,
    error,
    years,
    selectedYear,
    setSelectedYear,
    lineFiles,
    selectedFiles,
    setSelectedFiles,
    rawData,
  };
}
