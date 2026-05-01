export function formatPrice(price: number): string {
  return 'Rs. ' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function timeAgo(date: Date): string {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return Math.floor(diff / 60) + ' mins ago';
  if (diff < 86400) return Math.floor(diff / 3600) + ' hours ago';
  if (diff < 604800) return Math.floor(diff / 86400) + ' days ago';
  return Math.floor(diff / 604800) + ' weeks ago';
}

export const SERVICE_GRADIENTS = [
  'from-sky-400 to-blue-500',
  'from-rose-400 to-pink-500',
  'from-violet-400 to-purple-500',
  'from-emerald-400 to-green-500',
  'from-amber-400 to-yellow-500',
  'from-cyan-400 to-teal-500',
  'from-fuchsia-400 to-pink-600',
  'from-lime-400 to-green-600',
  'from-indigo-400 to-blue-600',
  'from-orange-400 to-red-500',
  'from-teal-400 to-cyan-600',
  'from-pink-400 to-rose-600',
];

export const CATEGORY_GRADIENTS = [
  'from-emerald-400 to-green-500',
  'from-blue-400 to-indigo-500',
  'from-amber-400 to-orange-500',
  'from-purple-400 to-violet-500',
  'from-rose-400 to-pink-500',
  'from-cyan-400 to-teal-500',
];
