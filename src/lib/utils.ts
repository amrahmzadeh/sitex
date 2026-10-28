import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number, currency: string = 'AZN'): string {
  return `${price.toFixed(2)} ${currency}`;
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[əƏ]/g, 'e')
    .replace(/[öÖ]/g, 'o')
    .replace(/[üÜ]/g, 'u')
    .replace(/[çÇ]/g, 'c')
    .replace(/[şŞ]/g, 's')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60);
}

export function formatWhatsAppUrl(
  countryCode: string,
  phone: string,
  message: string
): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const cleanCode = countryCode.replace(/\D/g, '');
  const fullNumber = `${cleanCode}${cleanPhone}`;
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${fullNumber}?text=${encodedMessage}`;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
