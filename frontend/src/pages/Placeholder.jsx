import GlassCard from '../components/ui/GlassCard';

export default function Placeholder({ title, description }) {
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">{title}</h1>
      <GlassCard>
        <p className="text-gray-400">
          {description || `${title} will be built in an upcoming step.`}
        </p>
      </GlassCard>
    </div>
  );
}