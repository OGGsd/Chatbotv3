// Webhook service for contact form submissions

export interface ContactWebhookData {
  name: string;
  email: string;
}

export interface WebhookPayload {
  name: string;
  email: string;
  timeCreated: string;
  telegramChatId: string;
  internalId: string;
}

// Generate a unique internal ID for tracking
function generateInternalId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `contact_${timestamp}_${random}`;
}

// Extract name from email if no name provided
function extractNameFromEmail(email: string): string {
  const localPart = email.split('@')[0];
  // Convert common email patterns to readable names
  return localPart
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}

export async function sendContactWebhook(data: ContactWebhookData): Promise<void> {
  // Your actual Telegram chat ID from the bot API response
  const TELEGRAM_CHAT_ID = import.meta.env.VITE_TELEGRAM_CHAT_ID || "6181099256";
  
  // Prepare webhook payload
  const payload: WebhookPayload = {
    name: data.name || extractNameFromEmail(data.email),
    email: data.email,
    timeCreated: new Date().toISOString(),
    telegramChatId: TELEGRAM_CHAT_ID,
    internalId: generateInternalId()
  };

  // Webhook URL - n8n GET webhook
  const webhookUrl = import.meta.env.VITE_CONTACT_WEBHOOK_URL || 'https://asdfasfdsvd.app.n8n.cloud/webhook/b9ba15bd-54b9-45d4-97ca-cdb31437ea11';

  // Build URL with query parameters for GET request
  const url = new URL(webhookUrl);
  url.searchParams.append('name', payload.name);
  url.searchParams.append('email', payload.email);
  url.searchParams.append('timeCreated', payload.timeCreated);
  url.searchParams.append('telegramChatId', payload.telegramChatId);
  url.searchParams.append('internalId', payload.internalId);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Webhook failed with status: ${response.status}`);
    }

    // Log successful webhook for debugging
    console.log('Contact webhook sent successfully:', {
      name: payload.name,
      email: payload.email,
      telegramChatId: payload.telegramChatId,
      internalId: payload.internalId,
      timestamp: payload.timeCreated
    });

  } catch (error) {
    console.error('Webhook error:', error);
    throw new Error('Failed to send contact request');
  }
}

// Utility function to validate webhook configuration
export function validateWebhookConfig(): boolean {
  const webhookUrl = import.meta.env.VITE_CONTACT_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('VITE_CONTACT_WEBHOOK_URL not configured. Using default webhook URL.');
    return false;
  }
  
  try {
    new URL(webhookUrl);
    return true;
  } catch {
    console.error('Invalid webhook URL configured');
    return false;
  }
}

// Initialize webhook validation on module load
validateWebhookConfig();