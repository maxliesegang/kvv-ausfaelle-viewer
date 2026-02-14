import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchLineData, fetchRootIndex, fetchYearIndex } from "../api";
import type { Cancellation } from "../types";
import { fileToLabel } from "../utils/dataTransforms";

export interface LineFile {
  file: string;
  label: string;
}

const YEAR_SORT_OPTIONS = {
  numeric: true,
  sensitivity: "base",
} as const;

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function normalizeSelectedFiles(files: string[]): string[] {
  return [...new Set(files)].sort((a, b) =>
    a.localeCompare(b, undefined, YEAR_SORT_OPTIONS)
  );
}

function compareByDateAndTimeDesc(a: Cancellation, b: Cancellation): number {
  if (a.date === b.date) {
    return (b.fromTime ?? "").localeCompare(a.fromTime ?? "");
  }
  return b.date.localeCompare(a.date);
}

function toLineFiles(files: string[]): LineFile[] {
  return files
    .filter((file) => file.endsWith(".json") && file !== "index.json")
    .map((file) => ({
      file,
      label: fileToLabel(file),
    }))
    .sort((a, b) => a.label.localeCompare(b.label, undefined, YEAR_SORT_OPTIONS));
}

function getCacheKey(year: string, file: string): string {
  return `${year}/${file}`;
}

export function useKVVData() {
  const [rootLoading, setRootLoading] = useState(true);
  const [yearLoading, setYearLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);

  const [lineFiles, setLineFiles] = useState<LineFile[]>([]);
  const [selectedFilesState, setSelectedFilesState] = useState<string[]>([]);

  const [rawData, setRawData] = useState<Cancellation[]>([]);

  const lineDataCacheRef = useRef<Map<string, Cancellation[]>>(new Map());
  const dataRequestIdRef = useRef(0);

  const loading = useMemo(
    () => rootLoading || yearLoading || dataLoading,
    [dataLoading, rootLoading, yearLoading]
  );

  const setSelectedFiles = useCallback((files: string[]) => {
    setSelectedFilesState(normalizeSelectedFiles(files));
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const loadRootIndex = async () => {
      setRootLoading(true);
      setError(null);

      try {
        const root = await fetchRootIndex(controller.signal);
        if (controller.signal.aborted) return;

        const sortedYears = [...root.years].sort((a, b) =>
          a.localeCompare(b, undefined, YEAR_SORT_OPTIONS)
        );

        setYears(sortedYears);
        setSelectedYear((currentYear) => currentYear ?? sortedYears.at(-1) ?? null);
      } catch (e) {
        if (!isAbortError(e)) {
          setError((e as Error).message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setRootLoading(false);
        }
      }
    };

    void loadRootIndex();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!selectedYear) {
      setLineFiles([]);
      setSelectedFilesState([]);
      setRawData([]);
      return;
    }

    const controller = new AbortController();

    const loadYearIndex = async () => {
      setYearLoading(true);
      setError(null);
      setRawData([]);
      setSelectedFilesState([]);

      try {
        const yearIndex = await fetchYearIndex(selectedYear, controller.signal);
        if (controller.signal.aborted) return;

        const files = toLineFiles(yearIndex.files);
        const defaultSelection = files.map((lineFile) => lineFile.file);

        setLineFiles(files);
        setSelectedFilesState(defaultSelection);
      } catch (e) {
        if (!isAbortError(e)) {
          setError((e as Error).message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setYearLoading(false);
        }
      }
    };

    void loadYearIndex();

    return () => {
      controller.abort();
    };
  }, [selectedYear]);

  useEffect(() => {
    if (!selectedYear || selectedFilesState.length === 0) {
      setRawData([]);
      setDataLoading(false);
      return;
    }

    const controller = new AbortController();
    dataRequestIdRef.current += 1;
    const requestId = dataRequestIdRef.current;

    const loadLineDataForSelection = async () => {
      setDataLoading(true);
      setError(null);

      try {
        const fileData = await Promise.all(
          selectedFilesState.map(async (file) => {
            const cacheKey = getCacheKey(selectedYear, file);
            const cached = lineDataCacheRef.current.get(cacheKey);
            if (cached) return cached;

            const response = await fetchLineData(selectedYear, file, controller.signal);
            const entries = Array.isArray(response) ? response : [];
            lineDataCacheRef.current.set(cacheKey, entries);
            return entries;
          })
        );

        if (controller.signal.aborted || requestId !== dataRequestIdRef.current) {
          return;
        }

        const combined = fileData.flat();
        combined.sort(compareByDateAndTimeDesc);
        setRawData(combined);
      } catch (e) {
        if (isAbortError(e) || requestId !== dataRequestIdRef.current) {
          return;
        }

        setRawData([]);
        setError((e as Error).message);
      } finally {
        if (!controller.signal.aborted && requestId === dataRequestIdRef.current) {
          setDataLoading(false);
        }
      }
    };

    void loadLineDataForSelection();

    return () => {
      controller.abort();
    };
  }, [selectedFilesState, selectedYear]);

  return {
    loading,
    error,
    years,
    selectedYear,
    setSelectedYear,
    lineFiles,
    selectedFiles: selectedFilesState,
    setSelectedFiles,
    rawData,
  };
}
