const COLORS = [
  '#6C63FF','#00D4FF','#FF6B6B','#22C55E','#F59E0B',
  '#A855F7','#EC4899','#14B8A6','#F97316','#3B82F6',
  '#8B5CF6','#10B981','#EF4444','#84CC16','#06B6D4',
];

export default function ColorPicker({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          style={{ background: c }}
          className={`h-8 w-8 rounded-full transition-transform ${
            value === c
              ? 'ring-2 ring-white ring-offset-2 ring-offset-surface-bg scale-110'
              : 'hover:scale-110'
          }`}
        />
      ))}
    </div>
  );
}