import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { INVESTMENT_TYPES } from '../../utils/constants';
import {
  useCreateInvestment,
  useUpdateInvestment,
} from '../../hooks/queries/useInvestments';

const schema = z.object({
  stockSymbol: z.string().max(20).optional(),
  companyName: z.string().max(200).optional(),
  investmentType: z.enum([
    'STOCK', 'MUTUAL_FUND', 'FIXED_DEPOSIT',
    'BOND', 'GOLD', 'REAL_ESTATE', 'CRYPTO', 'OTHER',
  ]),
  purchaseDate: z.string().min(1, 'Purchase date required'),
  purchasePrice: z.coerce.number().positive('Price must be > 0'),
  quantity: z.coerce.number().int().positive('Quantity must be ≥ 1'),
  currentPrice: z.coerce.number().optional(),
  sector: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function InvestmentFormModal({ open, onClose, investment }) {
  const isEdit = !!investment;
  const createMut = useCreateInvestment();
  const updateMut = useUpdateInvestment();

  const {
    register, handleSubmit, reset, watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      investmentType: 'STOCK',
      purchaseDate: todayStr(),
      quantity: 1,
    },
  });

  const type = watch('investmentType');
  const isStock = type === 'STOCK' || type === 'MUTUAL_FUND';

  useEffect(() => {
    if (open && investment) {
      reset({
        stockSymbol: investment.stockSymbol || '',
        companyName: investment.companyName || '',
        investmentType: investment.investmentType,
        purchaseDate: investment.purchaseDate,
        purchasePrice: investment.purchasePrice,
        quantity: investment.quantity,
        currentPrice: investment.currentPrice ?? investment.purchasePrice,
        sector: investment.sector || '',
        notes: investment.notes || '',
      });
    } else if (open) {
      reset({
        stockSymbol: '',
        companyName: '',
        investmentType: 'STOCK',
        purchaseDate: todayStr(),
        purchasePrice: '',
        quantity: 1,
        currentPrice: '',
        sector: '',
        notes: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, investment]);

  const onSubmit = (data) => {
    if (isEdit) {
      updateMut.mutate({ id: investment.id, data }, { onSuccess: onClose });
    } else {
      createMut.mutate(data, { onSuccess: onClose });
    }
  };

  const isLoading = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Investment' : 'New Investment'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type */}
        <div>
          <label className="label-base">Investment Type</label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {INVESTMENT_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => reset((d) => ({ ...d, investmentType: t.value }))}
                className={`py-2 rounded-xl text-xs font-medium border transition ${
                  type === t.value
                    ? 'border-primary-500 bg-primary-500/10 text-white'
                    : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {isStock && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Stock Symbol (optional)"
              placeholder="e.g. RELIANCE.NS"
              {...register('stockSymbol')}
            />
            <Input
              label="Company Name"
              placeholder="Reliance Industries"
              {...register('companyName')}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Purchase Price (₹)"
            type="number"
            step="0.01"
            placeholder="1000"
            error={errors.purchasePrice?.message}
            {...register('purchasePrice')}
          />
          <Input
            label="Quantity"
            type="number"
            placeholder="10"
            error={errors.quantity?.message}
            {...register('quantity')}
          />
          <Input
            label="Purchase Date"
            type="date"
            error={errors.purchaseDate?.message}
            {...register('purchaseDate')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Current Price (₹, optional)"
            type="number"
            step="0.01"
            placeholder="Leave blank if same as purchase"
            {...register('currentPrice')}
          />
          {isStock && (
            <Input
              label="Sector (optional)"
              placeholder="IT / Banking / FMCG"
              {...register('sector')}
            />
          )}
        </div>

        <div>
          <label className="label-base">Notes (optional)</label>
          <textarea
            className="input-box min-h-[70px] input-base"
            placeholder="Why this investment?"
            {...register('notes')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEdit ? 'Update' : 'Add'} Investment
          </Button>
        </div>
      </form>
    </Modal>
  );
}