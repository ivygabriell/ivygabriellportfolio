export function whatsappUrl(number: string, message: string): string {
  if (!/^\d{10,15}$/.test(number))
    throw new Error(`whatsapp number must be digits only (country code included): "${number}"`);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
