// Minimal list of countries for dropdowns and forms
export const COUNTRIES = [
    { code: 'IN', name: 'India', phoneCode: '+91' },
    { code: 'US', name: 'United States', phoneCode: '+1' },
    { code: 'GB', name: 'United Kingdom', phoneCode: '+44' },
    { code: 'CA', name: 'Canada', phoneCode: '+1' },
    { code: 'AU', name: 'Australia', phoneCode: '+61' },
    { code: 'AE', name: 'United Arab Emirates', phoneCode: '+971' },
    { code: 'SA', name: 'Saudi Arabia', phoneCode: '+966' },
    { code: 'SG', name: 'Singapore', phoneCode: '+65' },
    { code: 'MY', name: 'Malaysia', phoneCode: '+60' },
    { code: 'LK', name: 'Sri Lanka', phoneCode: '+94' },
    { code: 'BD', name: 'Bangladesh', phoneCode: '+880' },
    { code: 'PK', name: 'Pakistan', phoneCode: '+92' },
    { code: 'NP', name: 'Nepal', phoneCode: '+977' },
    { code: 'BT', name: 'Bhutan', phoneCode: '+975' },
    { code: 'MV', name: 'Maldives', phoneCode: '+960' },
    { code: 'CN', name: 'China', phoneCode: '+86' },
    { code: 'JP', name: 'Japan', phoneCode: '+81' },
    { code: 'KR', name: 'South Korea', phoneCode: '+82' },
    { code: 'DE', name: 'Germany', phoneCode: '+49' },
    { code: 'FR', name: 'France', phoneCode: '+33' },
    { code: 'IT', name: 'Italy', phoneCode: '+39' },
    { code: 'ES', name: 'Spain', phoneCode: '+34' },
    { code: 'PT', name: 'Portugal', phoneCode: '+351' },
    { code: 'NL', name: 'Netherlands', phoneCode: '+31' },
    { code: 'BE', name: 'Belgium', phoneCode: '+32' },
    { code: 'CH', name: 'Switzerland', phoneCode: '+41' },
    { code: 'SE', name: 'Sweden', phoneCode: '+46' },
    { code: 'NO', name: 'Norway', phoneCode: '+47' },
    { code: 'DK', name: 'Denmark', phoneCode: '+45' },
    { code: 'FI', name: 'Finland', phoneCode: '+358' },
    { code: 'RU', name: 'Russia', phoneCode: '+7' },
    { code: 'BR', name: 'Brazil', phoneCode: '+55' },
    { code: 'AR', name: 'Argentina', phoneCode: '+54' },
    { code: 'MX', name: 'Mexico', phoneCode: '+52' },
    { code: 'ZA', name: 'South Africa', phoneCode: '+27' },
    { code: 'NG', name: 'Nigeria', phoneCode: '+234' },
    { code: 'KE', name: 'Kenya', phoneCode: '+254' },
    { code: 'EG', name: 'Egypt', phoneCode: '+20' },
    { code: 'IL', name: 'Israel', phoneCode: '+972' },
    { code: 'TR', name: 'Turkey', phoneCode: '+90' },
] as const;

export const COUNTRY_CODES = COUNTRIES.map(c => c.code);
export const COUNTRY_NAMES = COUNTRIES.map(c => c.name);
export const COUNTRY_PHONE_CODES = COUNTRIES.map(c => c.phoneCode);

export const DEFAULT_COUNTRY = COUNTRIES.find(c => c.code === 'IN')!;

export const getCountryByCode = (code: string) =>
    COUNTRIES.find(c => c.code === code);

export const getCountryByName = (name: string) =>
    COUNTRIES.find(c => c.name === name);

export const getCountryByPhoneCode = (phoneCode: string) =>
    COUNTRIES.find(c => c.phoneCode === phoneCode);

export type Country = typeof COUNTRIES[number];