export type Lang = 'en' | 'si' | 'ta';

const LANG_KEY = 'needly_lang';

export function getLang(): Lang {
  return (localStorage.getItem(LANG_KEY) as Lang) ?? 'en';
}

export function setLang(lang: Lang): void {
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang === 'si' ? 'si' : lang === 'ta' ? 'ta' : 'en';
}

export const LANG_LABELS: Record<Lang, string> = {
  en: 'EN',
  si: 'සිං',
  ta: 'தமிழ்',
};

type TranslationMap = Record<string, Record<Lang, string>>;

export const T: TranslationMap = {
  hero_title_1: { en: 'Find trusted', si: 'විශ්වාසනීය', ta: 'நம்பகமான' },
  hero_title_2: { en: 'local pros', si: 'ප්‍රාදේශීය විශේෂඥයන්', ta: 'உள்ளூர் நிபுணர்கள்' },
  hero_title_3: { en: 'book in seconds.', si: 'ත්වරිතයෙන් වෙන් කරවා ගන්න.', ta: 'நொடியில் முன்பதிவு செய்யுங்கள்.' },
  search_placeholder: { en: 'What service are you looking for?', si: 'ඔබට අවශ්‍ය සේවාව කුමක්ද?', ta: 'நீங்கள் என்ன சேவை தேடுகிறீர்கள்?' },
  cta_search: { en: 'Search', si: 'සොයන්න', ta: 'தேடு' },
  cta_join: { en: 'Join Needlyy', si: 'Needlyy හා එකතු වෙන්න', ta: 'Needlyy இல் சேருங்கள்' },
  cta_emergency: { en: 'Emergency', si: 'හදිසි', ta: 'அவசரம்' },
  nav_browse: { en: 'Browse', si: 'සොයා බලන්න', ta: 'உலாவுக' },
  nav_feed: { en: 'Feed', si: 'ෆීඩ්', ta: 'ஊட்டம்' },
  nav_about: { en: 'About', si: 'අප ගැන', ta: 'எங்களை பற்றி' },
  verified_sellers: { en: 'Verified Sellers', si: 'සත්‍යාපිත විකුණුම්කරුවන්', ta: 'சரிபார்க்கப்பட்ட விற்பனையாளர்கள்' },
  secure_payments: { en: 'Secure Payments', si: 'ආරක්ෂිත ගෙවීම්', ta: 'பாதுகாப்பான கொடுப்பனவுகள்' },
  support_24_7: { en: '24/7 Support', si: '24/7 සහාය', ta: '24/7 ஆதரவு' },
};

export function t(key: keyof typeof T, lang: Lang): string {
  return T[key]?.[lang] ?? T[key]?.['en'] ?? key;
}
