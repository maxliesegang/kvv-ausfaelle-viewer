import { KernSelect } from "@kern-ux-annex/kern-react-kit";

export interface FilterSelectOption<T extends string> {
  value: T;
  label: string;
}

interface FilterSelectProps<T extends string> {
  id: string;
  label: string;
  value: T;
  options: ReadonlyArray<FilterSelectOption<T>>;
  onChange: (value: T) => void;
}

/**
 * A labelled KERN select bound to a single filter value. Generic over the
 * filter's value union, so call sites stay type-safe without casts. `required`
 * is passed so KERN drops its "- Optional" suffix — these filters always carry a
 * value (an explicit "Alle …" option). Adding a new select filter is then just
 * supplying an `id`, `label`, the value, its options array and an `onChange`.
 */
export function FilterSelect<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: FilterSelectProps<T>) {
  return (
    <KernSelect
      id={id}
      label={label}
      required
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </KernSelect>
  );
}
