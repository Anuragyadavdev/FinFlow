import axiosClient from './axiosClient';

export const aiApi = {
  ask: (question) =>
    axiosClient
      .post('/ai/ask', { question })
      .then((r) => r.data.data),

  advise: (payload) =>
    axiosClient
      .post('/ai/advise', payload)
      .then((r) => r.data.data),

  samples: () =>
    axiosClient.get('/ai/samples').then((r) => r.data.data),
};