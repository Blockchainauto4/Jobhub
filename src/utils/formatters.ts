export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

export function formatDateBr(dateStr: string): string {
  if (!dateStr) return '';
  if (dateStr.toLowerCase().includes('hoje')) return 'Hoje';
  if (dateStr.toLowerCase().includes('amanhã') || dateStr.toLowerCase().includes('amanha')) return 'Amanhã';

  try {
    const [year, month, day] = dateStr.split('-');
    if (year && month && day) {
      return `${day}/${month}/${year}`;
    }
  } catch {
    // fallback
  }
  return dateStr;
}

export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function createWhatsAppLink(phone: string, text: string): string {
  const digits = cleanPhone(phone);
  const formattedPhone = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`;
}

export function createGoogleMapsDirectionsLink(address: string, locationName?: string): string {
  const query = locationName ? `${locationName}, ${address}` : address;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;
}

export function createWazeLink(address: string): string {
  return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
}
