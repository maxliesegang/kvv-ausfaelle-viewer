import type { LineFile } from "../hooks/useKVVData";

interface LinesSelectorProps {
  lineFiles: LineFile[];
  selectedFiles: string[];
  onSelectionChange: (files: string[]) => void;
}

export function LinesSelector({ lineFiles, selectedFiles, onSelectionChange }: LinesSelectorProps) {
  const handleSelectAll = () => {
    onSelectionChange(lineFiles.map((f) => f.file));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const handleToggleLine = (file: string, isActive: boolean) => {
    onSelectionChange(
      isActive
        ? selectedFiles.filter((f) => f !== file)
        : [...selectedFiles, file]
    );
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
          >
            All
          </button>
          <button
            type="button"
            className="select-btn"
            onClick={handleClearAll}
          >
            None
          </button>
        </div>
      </div>
      <div className="chips">
        {lineFiles.map((lf) => {
          const active = selectedFiles.includes(lf.file);
          return (
            <button
              key={lf.file}
              type="button"
              className={`chip ${active ? "chip-active" : ""}`}
              onClick={() => handleToggleLine(lf.file, active)}
            >
              {lf.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
