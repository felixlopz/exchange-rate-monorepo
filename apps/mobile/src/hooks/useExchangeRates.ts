import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface ExchangeRates {
  usd_to_ves: number;
  eur_to_ves: number;
  eur_to_usd: number;
}

export function useExchangeRates() {
  const [rates, setRates] = useState<ExchangeRates>({
    usd_to_ves: 0,
    eur_to_ves: 0,
    eur_to_usd: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLatestBCVRates();

      if (data.length > 0) {
        // Find USD and EUR rates
        const usdRate = data.find(
          (r) => r.currency_from === 'USD' && r.currency_to === 'VES'
        );
        const eurRate = data.find(
          (r) => r.currency_from === 'EUR' && r.currency_to === 'VES'
        );

        const usd_to_ves = usdRate ? parseFloat(usdRate.rate) : 0;
        const eur_to_ves = eurRate ? parseFloat(eurRate.rate) : 0;
        const eur_to_usd = eur_to_ves && usd_to_ves ? eur_to_ves / usd_to_ves : 0;

        setRates({
          usd_to_ves,
          eur_to_ves,
          eur_to_usd,
        });
      }
    } catch (err) {
      console.error('Failed to fetch exchange rates:', err);
      setError('No se pudieron cargar las tasas de cambio');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, []);

  const convertToVES = (amount: number, currency: 'USD' | 'EUR' | 'VES'): number => {
    if (currency === 'VES') return amount;
    if (currency === 'USD') return amount * rates.usd_to_ves;
    if (currency === 'EUR') return amount * rates.eur_to_ves;
    return 0;
  };

  return { rates, loading, error, refresh: fetchRates, convertToVES };
}
