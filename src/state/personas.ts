import type { Identity, IncomeType, ReadyInput } from './types.ts';

export interface Persona {
  id: 'hafiz' | 'aina' | 'daniel';
  name: string;
  tagline: { en: string; ms: string };
  ready: ReadyInput;
}

export const PERSONAS: Persona[] = [
  {
    id: 'hafiz',
    name: 'Hafiz, 25',
    tagline: { en: 'Gig worker. No payslip.', ms: 'Pekerja gig. Tiada slip gaji.' },
    ready: { age: '25', incomeType: 'gig', income: '2800', commitments: '500' },
  },
  {
    id: 'aina',
    name: 'Aina, 23',
    tagline: { en: 'Fresh graduate. No credit history.', ms: 'Graduan baharu. Tiada sejarah kredit.' },
    ready: { age: '23', incomeType: 'salaried', income: '3500', commitments: '300' },
  },
  {
    id: 'daniel',
    name: 'Daniel, 24',
    tagline: { en: 'Final-year student. Part-time income.', ms: 'Pelajar tahun akhir. Pendapatan separuh masa.' },
    ready: { age: '24', incomeType: 'student', income: '1200', commitments: '200' },
  },
];

/** Fixed mock data returned by the pretend MyKad scan. Not a real person. */
export const MOCK_IDENTITY: Identity = {
  name: 'Mohd Hafiz bin Abdullah',
  ic: '010412-**-***5',
  dob: '12 April 2001',
  address: 'No. 12, Jalan Setapak 3, 53000 Kuala Lumpur',
};

export const HAFIZ_CONTACT = { phone: '012-345 6789', email: 'hafiz.demo@example.com' };

export const EMPLOYMENT_LABEL: Record<IncomeType, { en: string; ms: string }> = {
  salaried: { en: 'Salaried', ms: 'Bergaji' },
  gig: { en: 'Gig worker', ms: 'Pekerja gig' },
  parttime: { en: 'Part-time', ms: 'Separuh masa' },
  student: { en: 'Student', ms: 'Pelajar' },
};
