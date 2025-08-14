import { HealthProfile } from './types';

export const DEFAULT_CATEGORIES = [
  { name: 'Makanan', color: '#ef4444' },
  { name: 'Transportasi', color: '#f97316' },
  { name: 'Tagihan', color: '#eab308' },
  { name: 'Hiburan', color: '#84cc16' },
  { name: 'Belanja', color: '#22c55e' },
  { name: 'Kesehatan', color: '#14b8a6' },
  { name: 'Lainnya', color: '#64748b' },
];

export const DEFAULT_HEALTH_PROFILE: HealthProfile = {
    dietPreference: 'Normal',
};
