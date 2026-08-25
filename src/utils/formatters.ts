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

export function cleanDigits(value: string): string {
  return (value || '').replace(/\D/g, '');
}

export function cleanPhone(phone: string): string {
  return cleanDigits(phone);
}

/**
 * Format Brazilian phone number:
 * (XX) XXXXX-XXXX for 11 digits (mobile)
 * (XX) XXXX-XXXX for 10 digits (landline)
 */
export function formatPhone(value: string): string {
  const digits = cleanDigits(value).slice(0, 11);
  if (!digits) return '';

  if (digits.length <= 2) {
    return `(${digits}`;
  }
  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

export function isValidPhone(phone: string): boolean {
  const digits = cleanDigits(phone);
  if (digits.length < 10 || digits.length > 11) return false;
  const ddd = parseInt(digits.slice(0, 2), 10);
  if (ddd < 11 || ddd > 99) return false;
  if (digits.length === 11 && digits[2] !== '9') return false;
  return true;
}

/**
 * Format Brazilian CPF: 000.000.000-00
 */
export function formatCPF(value: string): string {
  const digits = cleanDigits(value).slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function isValidCPF(cpf: string): boolean {
  const digits = cleanDigits(cpf);
  return digits.length === 11;
}

/**
 * Format Brazilian CNPJ: 00.000.000/0001-00
 */
export function formatCNPJ(value: string): string {
  const digits = cleanDigits(value).slice(0, 14);
  if (!digits) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
}

export function formatCpfOrCnpj(value: string): string {
  const digits = cleanDigits(value);
  if (digits.length <= 11) {
    return formatCPF(value);
  }
  return formatCNPJ(value);
}

export function isValidCpfOrCnpj(value: string): boolean {
  const digits = cleanDigits(value);
  return digits.length === 11 || digits.length === 14;
}

/**
 * Format PIX key according to type
 */
export function formatPixKey(value: string, type: 'cpf' | 'email' | 'phone' | 'random'): string {
  if (!value) return '';
  if (type === 'phone') {
    return formatPhone(value);
  }
  if (type === 'cpf') {
    return formatCPF(value);
  }
  return value.trim();
}

export function validatePixKey(value: string, type: 'cpf' | 'email' | 'phone' | 'random'): { isValid: boolean; message: string } {
  const trimmed = (value || '').trim();
  if (!trimmed) {
    return { isValid: false, message: 'Chave PIX obrigatória' };
  }

  if (type === 'phone') {
    const valid = isValidPhone(trimmed);
    return {
      isValid: valid,
      message: valid ? 'Telefone com DDD válido' : 'Digite DDD + 9 dígitos para o PIX'
    };
  }

  if (type === 'cpf') {
    const digits = cleanDigits(trimmed);
    const valid = digits.length === 11;
    return {
      isValid: valid,
      message: valid ? 'CPF com 11 dígitos válido' : 'Digite os 11 dígitos do CPF'
    };
  }

  if (type === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const valid = emailRegex.test(trimmed);
    return {
      isValid: valid,
      message: valid ? 'E-mail válido' : 'Formato de e-mail inválido (ex: nome@email.com)'
    };
  }

  if (type === 'random') {
    const valid = trimmed.length >= 10;
    return {
      isValid: valid,
      message: valid ? 'Chave aleatória válida' : 'Chave aleatória deve conter caracteres válidos'
    };
  }

  return { isValid: true, message: 'Formato válido' };
}

export function validateName(name: string): { isValid: boolean; message: string } {
  const trimmed = (name || '').trim();
  if (!trimmed) {
    return { isValid: false, message: 'Nome é obrigatório' };
  }
  if (trimmed.length < 3) {
    return { isValid: false, message: 'Nome muito curto (mínimo 3 letras)' };
  }
  return { isValid: true, message: 'Nome confirmado' };
}

export function createWhatsAppLink(phone: string, text: string): string {
  const digits = cleanDigits(phone);
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

