import { useMutation, useQuery } from '@tanstack/react-query';
import { aiApi } from '../../api/aiApi';

export function useAskAi() {
  return useMutation({
    mutationFn: (question) => aiApi.ask(question),
  });
}

export function useAdviseAi() {
  return useMutation({
    mutationFn: (payload) => aiApi.advise(payload),
  });
}

export function useAiSamples() {
  return useQuery({
    queryKey: ['ai', 'samples'],
    queryFn: aiApi.samples,
    staleTime: 1000 * 60 * 60,
  });
}