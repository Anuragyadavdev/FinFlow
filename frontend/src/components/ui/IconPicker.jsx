const ICONS = [
  '🍔','🍕','☕','🍺','🛒','🛍️','👕','👟','💄','💅',
  '🚗','🚌','🚕','⛽','✈️','🚂','🏠','🏘️','💡','💧',
  '🔥','📱','💻','🎬','🎮','🎵','📚','🏥','💊','🏋️',
  '🐶','🐱','🎁','🛡️','💰','💵','💳','📈','📉','🏦',
  '⚡','🌐','🎓','🎯','📦','🔧','🎨','📺','📷','🍽️',
];

export default function IconPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-10 gap-1.5 max-h-40 overflow-y-auto p-2 rounded-xl bg-white/5 border border-white/10">
      {ICONS.map((ic) => (
        <button
          key={ic}
          type="button"
          onClick={() => onChange(ic)}
          className={`h-9 rounded-lg flex items-center justify-center text-lg transition ${
            value === ic
              ? 'bg-primary-500/30 ring-2 ring-primary-500'
              : 'hover:bg-white/10'
          }`}
        >
          {ic}
        </button>
      ))}
    </div>
  );
}