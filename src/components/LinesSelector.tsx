import { useMemo } from "react";
import type { LineFile } from "../hooks/useKVVData";

interface LinesSelectorProps {
  lineFiles: LineFile[];
  selectedFiles: string[];
  onSelectionChange: (files: string[]) => void;
}

export function LinesSelector({
  lineFiles,
  selectedFiles,
  onSelectionChange,
}: LinesSelectorProps) {
  const selectedSet = useMemo(() => new Set(selectedFiles), [selectedFiles]);

  const handleSelectAll = () => {
    onSelectionChange(lineFiles.map((lineFile) => lineFile.file));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleToggleLine = (file: string) => {
    if (selectedSet.has(file)) {
      onSelectionChange(selectedFiles.filter((selectedFile) => selectedFile !== file));
      return;
    }

    onSelectionChange([...selectedFiles, file]);
  };

  return (
    <div className="lines-selector">
      <div className="lines-header">
        <label>Lines</label>
        <div className="line-controls">
          <button
            type="button"
            className="select-btn"
            onClick={handleSelectAll}
            disabled={selectedFiles.length === lineFiles.length}
          >
            All
          </button>
          <button
            type="button"
            className="select-btn"
            onClick={handleClearAll}
            disabled={selectedFiles.length === 0}
          >
            None
          </button>
        </div>
      </div>
      <div className="chips">
        {lineFiles.map((lineFile) => {
          const active = selectedSet.has(lineFile.file);

          return (
            <button
              key={lineFile.file}
              type="button"
              className={`chip ${active ? "chip-active" : ""}`}
              onClick={() => handleToggleLine(lineFile.file)}
            >
              {lineFile.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
