import {
  useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { stockApi, watchlistApi } from '../../api/stockApi';

export function useStockQuote(symbol, opts = {}) {
  return useQuery({
    queryKey: ['stock', 'quote', symbol],
    queryFn: () => stockApi.quote(symbol),
    enabled: !!symbol,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 5, // 5 min
    ...opts,
  });
}

export function useStockChart(symbol, range) {
  return useQuery({
    queryKey: ['stock', 'chart', symbol, range],
    queryFn: () => stockApi.chart(symbol, range),
    enabled: !!symbol,
    staleTime: 1000 * 60 * 5,
  });
}

export function useStockSearch(query) {
  return useQuery({
    queryKey: ['stock', 'search', query],
    queryFn: () => stockApi.search(query),
    enabled: query?.length >= 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGainers() {
  return useQuery({
    queryKey: ['stock', 'gainers'],
    queryFn: stockApi.gainers,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLosers() {
  return useQuery({
    queryKey: ['stock', 'losers'],
    queryFn: stockApi.losers,
    staleTime: 1000 * 60 * 5,
  });
}

export function useWatchlist() {
  return useQuery({
    queryKey: ['watchlist'],
    queryFn: watchlistApi.getAll,
    staleTime: 1000 * 60,
  });
}

export function useAddToWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: watchlistApi.add,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Added to watchlist');
    },
  });
}

export function useRemoveFromWatchlist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: watchlistApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist'] });
      toast.success('Removed from watchlist');
    },
  });
}