import { useMemo } from "react";
import { KernButton, KernCheckbox, KernText } from "@kern-ux-annex/kern-react-kit";
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
      onSelectionChange(selectedFiles.filter((selected) => selected !== file));
      return;
    }
    onSelectionChange([...selectedFiles, file]);
  };

  if (lineFiles.length === 0) {
    return (
      <KernText type="body" size="small" muted>
        Bitte zuerst ein Jahr wählen.
      </KernText>
    );
  }

  return (
    <div className="lines-selector">
      <div className="lines-selector__toolbar">
        <KernText type="label" component="span">
          {selectedFiles.length} von {lineFiles.length} Linien
        </KernText>
        <div className="lines-selector__actions">
          <KernButton
            label="Alle"
            variant="tertiary"
            onClick={handleSelectAll}
            disabled={selectedFiles.length === lineFiles.length}
          />
          <KernButton
            label="Keine"
            variant="tertiary"
            onClick={handleClearAll}
            disabled={selectedFiles.length === 0}
          />
        </div>
      </div>
      <div className="lines-selector__grid">
        {lineFiles.map((lineFile) => (
          <KernCheckbox
            key={lineFile.file}
            id={`line-${lineFile.file}`}
            label={lineFile.label}
            checked={selectedSet.has(lineFile.file)}
            onChange={() => handleToggleLine(lineFile.file)}
          />
        ))}
      </div>
    </div>
  );
}
