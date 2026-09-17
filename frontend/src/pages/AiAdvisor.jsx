import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCpu, FiInfo, FiTrendingUp, FiAlertTriangle, FiCheck, FiTarget,
} from 'react-icons/fi';

import GlassCard from '../components/ui/GlassCard';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { useAdviseAi } from '../hooks/queries/useAi';
import { formatCurrency } from '../utils/formatters';

const schema = z.object({
  amount: z.coerce.number().positive('Amount must be > 0'),
  question: z.string().min(5, 'Ask a question'),
  riskTolerance: z.enum(['LOW', 'MODERATE', 'HIGH']),
  timeHorizon: z.enum(['SHORT', 'MEDIUM', 'LONG']),
});

const PRESETS = [
  { amount: 25000, question: 'Where should I invest ₹25,000 for 1 year?', riskTolerance: 'LOW',    timeHorizon: 'SHORT' },
  { amount: 50000, question: 'Where should I invest ₹50,000 for 2 years?', riskTolerance: 'MODERATE', timeHorizon: 'MEDIUM' },
  { amount: 100000, question: 'Where should I invest ₹1,00,000 for 5 years?', riskTolerance: 'HIGH', timeHorizon: 'LONG' },
];

export default function AiAdvisor() {
  const adviseMut = useAdviseAi();
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { riskTolerance: 'MODERATE', timeHorizon: 'MEDIUM' },
  });

  const onSubmit = (data) => adviseMut.mutate(data);

  const usePreset = (p) => {
    reset(p);
    adviseMut.mutate(p);
  };

  const advice = adviseMut.data;

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow-primary">
            <FiCpu className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI Investment Advisor</h1>
            <p className="text-sm text-gray-400">
              Get educational investment suggestions based on your data
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <GlassCard className="mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Investment Amount (₹)"
              type="number"
              step="1000"
              placeholder="50000"
              error={errors.amount?.message}
              {...register('amount')}
            />

            <div>
              <label className="label-base">Risk Tolerance</label>
              <select className="input-base" {...register('riskTolerance')}>
                <option value="LOW">Low — Preserve capital</option>
                <option value="MODERATE">Moderate — Balanced</option>
                <option value="HIGH">High — Growth focused</option>
              </select>
            </div>

            <div>
              <label className="label-base">Time Horizon</label>
              <select className="input-base" {...register('timeHorizon')}>
                <option value="SHORT">Short (under 1 year)</option>
                <option value="MEDIUM">Medium (1–3 years)</option>
                <option value="LONG">Long (3+ years)</option>
              </select>
            </div>
          </div>

          <Input
            label="Your Question"
            placeholder="e.g. Where should I invest for a house down payment?"
            error={errors.question?.message}
            {...register('question')}
          />

          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => usePreset(p)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition"
              >
                ₹{p.amount.toLocaleString('en-IN')} • {p.riskTolerance} • {p.timeHorizon}
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={adviseMut.isPending}>
              <FiCpu size={16} /> Get AI Advice
            </Button>
          </div>
        </form>
      </GlassCard>

      {/* Results */}
      <AnimatePresence>
        {adviseMut.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <GlassCard>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary-500 to-accent-cyan flex items-center justify-center shadow-glow-primary animate-pulse">
                  <FiCpu className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-semibold">Analyzing your finances…</p>
                  <p className="text-xs text-gray-400">
                    Fetching savings, goals, and live market data
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {advice && !adviseMut.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Fallback notice */}
            {advice.fallback && (
              <GlassCard className="border-accent-amber/30 bg-accent-amber/5">
                <div className="flex items-start gap-3">
                  <FiAlertTriangle className="text-accent-amber mt-0.5" size={18} />
                  <div>
                    <p className="text-sm font-medium text-accent-amber">
                      AI service temporarily unavailable
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Showing raw context instead. Try again later for full AI advice.
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Summary */}
            {advice.summary && !advice.fallback && (
              <GlassCard className="bg-gradient-to-br from-primary-500/10 to-transparent border-primary-500/20">
                <div className="flex items-start gap-3">
                  <FiCpu className="text-primary-300 mt-0.5" size={18} />
                  <div>
                    <p className="text-xs font-semibold text-primary-300 uppercase tracking-wider mb-1">
                      Advisor Summary
                    </p>
                    <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {advice.summary}
                    </p>
                  </div>
                </div>
              </GlassCard>
            )}

            {/* Facts */}
            {advice.facts?.length > 0 && (
              <AdviceSection
                icon={<FiInfo size={16} />}
                title="Facts"
                items={advice.facts}
                accent="cyan"
              />
            )}

            {/* Calculations */}
            {advice.calculations?.length > 0 && (
              <AdviceSection
                icon={<FiTarget size={16} />}
                title="Calculations"
                items={advice.calculations}
                accent="primary"
              />
            )}

            {/* Suggestions */}
            {advice.suggestions?.length > 0 && (
              <GlassCard>
                <div className="flex items-center gap-2 mb-3">
                  <FiTrendingUp className="text-accent-green" size={16} />
                  <h3 className="text-sm font-semibold text-accent-green uppercase tracking-wider">
                    Suggestions
                  </h3>
                </div>
                <div className="space-y-3">
                  {advice.suggestions.map((s, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <p className="text-sm font-medium">{s.title}</p>
                        {s.riskLevel && (
                          <Badge
                            variant={
                              s.riskLevel === 'LOW'
                                ? 'green'
                                : s.riskLevel === 'HIGH'
                                ? 'red'
                                : 'amber'
                            }
                          >
                            {s.riskLevel}
                          </Badge>
                        )}
                      </div>
                      {s.reason && (
                        <p className="text-xs text-gray-400 leading-relaxed">
                          {s.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Risks */}
            {advice.risks?.length > 0 && (
              <AdviceSection
                icon={<FiAlertTriangle size={16} />}
                title="Risks"
                items={advice.risks}
                accent="red"
              />
            )}

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 text-center">
              {advice.disclaimer || 'This is educational, not financial advice.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdviceSection({ icon, title, items, accent }) {
  const colors = {
    cyan: 'text-accent-cyan',
    primary: 'text-primary-400',
    red: 'text-accent-red',
  };
  return (
    <GlassCard>
      <div className="flex items-center gap-2 mb-3">
        <span className={colors[accent]}>{icon}</span>
        <h3 className={`text-sm font-semibold uppercase tracking-wider ${colors[accent]}`}>
          {title}
        </h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <FiCheck className="text-accent-green mt-1 flex-shrink-0" size={12} />
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}