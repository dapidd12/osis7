/**
 * Formats Instagram handle or URL into a clickable link
 */
export function getInstagramUrl(input: string): string {
  if (!input) return 'https://instagram.com';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanHandle = trimmed.replace(/^@/, '');
  return `https://instagram.com/${cleanHandle}`;
}

/**
 * Formats TikTok handle or URL into a clickable link
 */
export function getTikTokUrl(input: string): string {
  if (!input) return 'https://tiktok.com';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const cleanHandle = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  return `https://tiktok.com/${cleanHandle}`;
}

/**
 * Formats WhatsApp phone number and optional message into a wa.me link
 */
export function getWhatsAppUrl(phone: string, message?: string): string {
  if (!phone) return 'https://wa.me';
  // Remove non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');
  // If starts with 08, convert to 628
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  } else if (!cleanPhone.startsWith('62')) {
    cleanPhone = '62' + cleanPhone;
  }
  
  const baseUrl = `https://wa.me/${cleanPhone}`;
  if (message && message.trim()) {
    return `${baseUrl}?text=${encodeURIComponent(message.trim())}`;
  }
  return baseUrl;
}
