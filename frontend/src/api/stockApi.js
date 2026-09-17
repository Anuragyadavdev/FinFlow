import axiosClient from './axiosClient';

export const stockApi = {
  quote: (symbol) =>
    axiosClient.get(`/stocks/quote/${symbol}`).then((r) => r.data.data),

  chart: (symbol, range = '1mo') =>
    axiosClient
      .get(`/stocks/chart/${symbol}`, { params: { range } })
      .then((r) => r.data.data),

  search: (q) =>
    axiosClient
      .get('/stocks/search', { params: { q } })
      .then((r) => r.data.data),

  gainers: () =>
    axiosClient.get('/stocks/gainers').then((r) => r.data.data),

  losers: () =>
    axiosClient.get('/stocks/losers').then((r) => r.data.data),
};

export const watchlistApi = {
  getAll: () => axiosClient.get('/watchlist').then((r) => r.data.data),
  add: (payload) => axiosClient.post('/watchlist', payload).then((r) => r.data.data),
  remove: (id) => axiosClient.delete(`/watchlist/${id}`).then((r) => r.data),
};