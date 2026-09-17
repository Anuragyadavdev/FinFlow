import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import IconPicker from '../ui/IconPicker';
import ColorPicker from '../ui/ColorPicker';
import {
  useCreateCategory,
  useUpdateCategory,
} from '../../hooks/queries/useCategories';

const schema = z.object({
  name: z.string().min(1, 'Name required').max(100),
  type: z.enum(['INCOME', 'EXPENSE']),
  icon: z.string().min(1),
  color: z.string().min(4),
  description: z.string().max(500).optional(),
});

export default function CategoryFormModal({
  open, onClose, category, defaultType = 'EXPENSE',
}) {
  const isEdit = !!category;
  const createMut = useCreateCategory();
  const updateMut = useUpdateCategory();

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: defaultType,
      icon: '📦',
      color: '#6C63FF',
    },
  });

  const icon = watch('icon');
  const color = watch('color');
  const type = watch('type');

  useEffect(() => {
    if (open && category) {
      reset({
        name: category.name,
        type: category.type,
        icon: category.icon || '📦',
        color: category.color || '#6C63FF',
        description: category.description || '',
      });
    } else if (open) {
      reset({
        name: '',
        type: defaultType,
        icon: '📦',
        color: '#6C63FF',
        description: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  const onSubmit = (data) => {
    if (isEdit) {
      updateMut.mutate({ id: category.id, data }, { onSuccess: onClose });
    } else {
      createMut.mutate(data, { onSuccess: onClose });
    }
  };

  const isLoading = createMut.isPending || updateMut.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Category' : 'New Category'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Type tabs */}
        <div className="flex gap-2 p-1 rounded-xl bg-white/5">
          {[
            { v: 'EXPENSE', l: 'Expense', c: 'text-accent-red' },
            { v: 'INCOME', l: 'Income', c: 'text-accent-green' },
          ].map((opt) => (
            <button
              key={opt.v}
              type="button"
              onClick={() => setValue('type', opt.v)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                type === opt.v
                  ? `bg-white/10 ${opt.c}`
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {opt.l}
            </button>
          ))}
        </div>

        <Input
          label="Category Name"
          placeholder="e.g. Gym"
          error={errors.name?.message}
          {...register('name')}
        />

        <div>
          <label className="label-base">Icon</label>
          <IconPicker value={icon} onChange={(v) => setValue('icon', v)} />
        </div>

        <div>
          <label className="label-base">Color</label>
          <ColorPicker value={color} onChange={(v) => setValue('color', v)} />
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center text-xl"
            style={{ background: `${color}33`, border: `1px solid ${color}55` }}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium">
              {watch('name') || 'Category name'}
            </p>
            <p className="text-xs text-gray-400">
              {type === 'INCOME' ? 'Income' : 'Expense'}
            </p>
          </div>
        </div>

        <div>
          <label className="label-base">Description (optional)</label>
          <textarea
            className="input-base min-h-[70px]"
            placeholder="What is this category for?"
            {...register('description')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" loading={isLoading}>
            {isEdit ? 'Update' : 'Create'} Category
          </Button>
        </div>
      </form>
    </Modal>
  );
}