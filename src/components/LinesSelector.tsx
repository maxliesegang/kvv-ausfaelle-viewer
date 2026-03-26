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
    onSelectionChange(lineFiles.map((lf) => lf.file));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleToggleLine = (file: string) => {
    if (selectedSet.has(file)) {
      onSelectionChange(selectedFiles.filter((f) => f !== file));
      return;
    }
    onSelectionChange([...selectedFiles, file]);
  };

  return (
    <div className="lines-selector">
      <div className="lines-header">
        <span className="control-label">Linien</span>
        <div className="line-controls">
          <button
            type="button"
            className="select-btn"
            onClick={handleSelectAll}
            disabled={selectedFiles.length === lineFiles.length}
          >
            Alle
          </button>
          <button
            type="button"
            className="select-btn"
            onClick={handleClearAll}
            disabled={selectedFiles.length === 0}
          >
            Keine
          </button>
        </div>
      </div>
      <div className="chips">
        {lineFiles.map((lf) => (
          <button
            key={lf.file}
            type="button"
            className={`chip ${selectedSet.has(lf.file) ? "chip-active" : ""}`}
            onClick={() => handleToggleLine(lf.file)}
          >
            {lf.label}
          </button>
        ))}
      </div>
    </div>
  );
}
