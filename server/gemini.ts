import { GoogleGenAI, Type } from '@google/genai';
import { FreelanceJob } from '../src/types.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

export async function parseWhatsAppJobMessage(rawText: string): Promise<Partial<FreelanceJob>> {
  const client = getAiClient();

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Você é o assistente de IA do FreelaHub especializado em extrair vagas freelancers e bicos a partir de mensagens enviadas em grupos de WhatsApp/Telegram.
Analise a mensagem abaixo e extraia todas as informações no formato JSON especificado.

MENSAGEM DO WHATSAPP:
"""
${rawText}
"""`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'Título claro da vaga' },
              role: { type: Type.STRING, description: 'Função principal (ex: Limpeza, Carregador, Bartender, Garçom, Cozinheiro, Montagem, Segurança)' },
              category: { type: Type.STRING, enum: ['Eventos & Festas', 'Bares & Restaurantes', 'Logística & Cargas', 'Limpeza & Serviços', 'Hotelaria & Recepção', 'Outros'] },
              slotsTotal: { type: Type.INTEGER, description: 'Número total de vagas abertas' },
              date: { type: Type.STRING, description: 'Data do trabalho (ex: YYYY-MM-DD ou Hoje/Amanhã)' },
              startTime: { type: Type.STRING, description: 'Horário de início (ex: 13:00)' },
              endTime: { type: Type.STRING, description: 'Horário de término (ex: 22:00)' },
              cachet: { type: Type.NUMBER, description: 'Valor numérico do cachê em Reais (ex: 140.0)' },
              paymentDetails: { type: Type.STRING, description: 'Forma de pagamento (ex: Pagamento ao final via PIX, Acabou levou)' },
              benefits: { type: Type.STRING, description: 'Benefícios como Alimentação no local, VT, etc.' },
              dressCode: { type: Type.STRING, description: 'Exigência de vestimenta (ex: Roupa TODA PRETA)' },
              locationName: { type: Type.STRING, description: 'Nome do local/espaço/restaurante' },
              locationAddress: { type: Type.STRING, description: 'Endereço completo' },
              neighborhood: { type: Type.STRING, description: 'Bairro' },
              city: { type: Type.STRING, description: 'Cidade e estado (ex: São Paulo - SP)' },
              googleMapsUrl: { type: Type.STRING, description: 'Link de traçar rota do Google Maps ou vazio' },
              contactPhone: { type: Type.STRING, description: 'Telefone de contato com DDD' },
              contactName: { type: Type.STRING, description: 'Nome do contato ou responsável' },
              isUrgent: { type: Type.BOOLEAN, description: 'Verdadeiro se for URGENTE, HOJE ou AGORA' },
              requirements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Lista de requisitos e observações'
              }
            },
            required: ['role', 'cachet', 'locationAddress', 'contactPhone']
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (!parsed.googleMapsUrl && parsed.locationAddress) {
          const encoded = encodeURIComponent(parsed.locationAddress);
          parsed.googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
        }
        return parsed;
      }
    } catch (err) {
      console.warn('Gemini parsing failed, using regex fallback:', err);
    }
  }

  // Regex-based robust fallback for offline / no-key cases
  return parseWithRegex(rawText);
}

function parseWithRegex(rawText: string): Partial<FreelanceJob> {
  const isUrgent = /URGENTE|AGORA|HOJE/i.test(rawText);
  
  // Extract role and slots
  const roleMatch = rawText.match(/Fun[çc][ãa]o:\s*([^\n\r(]+)(?:\((\d+)\s*vagas?\))?/i);
  const role = roleMatch ? roleMatch[1].trim() : 'Freelancer';
  const slotsTotal = roleMatch && roleMatch[2] ? parseInt(roleMatch[2], 10) : 1;

  // Extract date
  const dateMatch = rawText.match(/Data:\s*([^\n\r]+)/i);
  const dateStr = dateMatch ? dateMatch[1].trim() : 'Hoje';

  // Extract time
  const timeMatch = rawText.match(/Hor[áa]rio:\s*([^\n\r]+)/i);
  let startTime = '13:00';
  let endTime = '22:00';
  if (timeMatch) {
    const times = timeMatch[1].match(/(\d{1,2})[h:]?(\d{0,2})?\s*(?:[àa]s|ate|-)\s*(\d{1,2})[h:]?(\d{0,2})?/i);
    if (times) {
      startTime = `${times[1].padStart(2, '0')}:${times[2] ? times[2].padStart(2, '0') : '00'}`;
      endTime = `${times[3].padStart(2, '0')}:${times[4] ? times[4].padStart(2, '0') : '00'}`;
    }
  }

  // Extract cachet
  const cachetMatch = rawText.match(/Cach[êe]:\s*R\$\s*([\d.,]+)(?:\s*\(([^)]+)\))?/i);
  let cachet = 120.0;
  let paymentDetails = 'Pagamento ao final via PIX';
  if (cachetMatch) {
    cachet = parseFloat(cachetMatch[1].replace('.', '').replace(',', '.'));
    if (cachetMatch[2]) paymentDetails = cachetMatch[2].trim();
  }

  // Extract benefits
  const benefitsMatch = rawText.match(/Benef[íi]cios:\s*([^\n\r]+)/i);
  const benefits = benefitsMatch ? benefitsMatch[1].trim() : 'Alimentação no local';

  // Extract dress code
  const dressMatch = rawText.match(/Vestimenta:\s*([^\n\r]+)/i);
  const dressCode = dressMatch ? dressMatch[1].trim() : 'Roupa TODA PRETA';

  // Extract location
  const locMatch = rawText.match(/Local:\s*([^\n\r]+)/i);
  const locationAddress = locMatch ? locMatch[1].trim() : 'São Paulo - SP';

  // Extract maps url
  const mapsMatch = rawText.match(/https?:\/\/(?:www\.)?google\.com\/maps[^\s]+/i);
  const googleMapsUrl = mapsMatch ? mapsMatch[0] : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(locationAddress)}`;

  // Extract contact
  const contactMatch = rawText.match(/Contato:\s*(\(?\d{2}\)?\s*\d{4,5}-?\d{4})/i);
  const contactPhone = contactMatch ? contactMatch[1].trim() : '(11) 98799-7872';

  // Guess category
  let category: FreelanceJob['category'] = 'Outros';
  const lower = (role + ' ' + rawText).toLowerCase();
  if (lower.includes('limpez') || lower.includes('higieniz') || lower.includes('faxin')) category = 'Limpeza & Serviços';
  else if (lower.includes('carreg') || lower.includes('montag') || lower.includes('carga') || lower.includes('descarg')) category = 'Logística & Cargas';
  else if (lower.includes('bar') || lower.includes('drink') || lower.includes('coquetel') || lower.includes('cozinha') || lower.includes('garçom') || lower.includes('garcom') || lower.includes('atendente')) category = 'Bares & Restaurantes';
  else if (lower.includes('event') || lower.includes('fest') || lower.includes('show') || lower.includes('casamento')) category = 'Eventos & Festas';

  return {
    title: `${role} - ${locationAddress.split(',')[0]}`,
    role,
    category,
    slotsTotal,
    slotsAvailable: slotsTotal,
    date: dateStr,
    startTime,
    endTime,
    cachet,
    paymentDetails,
    benefits,
    dressCode,
    locationName: locationAddress.split(',')[0] || 'Local do Evento',
    locationAddress,
    neighborhood: 'São Paulo',
    city: 'São Paulo - SP',
    googleMapsUrl,
    contactPhone,
    contactName: 'Coordenação FreelaHub',
    isUrgent,
    requirements: ['Chegar 15 minutos antes', 'Vestimenta exigida', 'Documento com foto'],
    status: 'open'
  };
}

export function generateWhatsAppBroadcast(job: FreelanceJob): string {
  const urgentTag = job.isUrgent ? '🚨 VAGA PARA HOJE (URGENTE/AGORA) 🚨\n\n' : '💼 NOVA VAGA DISPONÍVEL - FREELAHUB\n\n';
  const slotsTxt = job.slotsTotal > 1 ? ` (${job.slotsAvailable}/${job.slotsTotal} vagas)` : ` (${job.slotsTotal} vaga)`;
  
  const cachetFmt = Number(job.cachet).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return `${urgentTag}💼 Função: ${job.role}${slotsTxt}

📅 Data: ${job.date}
⏰ Horário: Das ${job.startTime} às ${job.endTime}
💰 Cachê: R$ ${cachetFmt} (${job.paymentDetails})
${job.benefits ? `🍔 Benefícios: ${job.benefits}\n` : ''}👕 Vestimenta: ${job.dressCode}

📍 Local: ${job.locationName ? `${job.locationName} - ` : ''}${job.locationAddress}

🗺️ Traçar rota no Maps:
${job.googleMapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.locationAddress)}`}

📞 Contato: ${job.contactPhone}
(Chamar no privado ou candidatar-se pelo FreelaHub)`;
}
