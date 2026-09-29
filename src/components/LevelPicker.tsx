import { levels, type LevelId } from '../data/course';

interface LevelPickerProps {
  value: LevelId;
  onChange: (level: LevelId) => void;
  compact?: boolean;
}

export function LevelPicker({ value, onChange, compact = false }: LevelPickerProps) {
  return (
    <div className={`level-picker${compact ? ' level-picker-compact' : ''}`} role="group" aria-label="Elige tu nivel de inglés">
      {levels.map((level) => (
        <button
          key={level.id}
          type="button"
          className={`level-pick${value === level.id ? ' is-selected' : ''}`}
          aria-pressed={value === level.id}
          onClick={() => onChange(level.id)}
        >
          <span className="level-code">{level.cefr}</span>
          {!compact && <span className="level-pick-name">{level.name}</span>}
        </button>
      ))}
    </div>
  );
}
