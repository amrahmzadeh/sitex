/**
 * Bildiriş göndərmə köməkçisi (Telegram Bot & Webhook)
 * Əlaqə formalarından (inquiries) gələn yeni müraciətlər üçün bildiriş göndərir.
 */

interface InquiryNotificationData {
  orgName: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  subject?: string | null;
  service?: string | null;
  message: string;
}

export async function sendInquiryNotification(data: InquiryNotificationData): Promise<void> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const webhookUrl = process.env.INQUIRY_WEBHOOK_URL;

  // 1. Telegram Bildirişi
  if (botToken && chatId) {
    try {
      const text = [
        `📩 *Yeni Müraciət (${escapeMarkdown(data.orgName)})*`,
        `👤 *Göndərən:* ${escapeMarkdown(data.fullName)}`,
        data.phone ? `📞 *Telefon:* ${escapeMarkdown(data.phone)}` : '',
        data.email ? `✉️ *E-poçt:* ${escapeMarkdown(data.email)}` : '',
        data.service ? `💼 *Xidmət:* ${escapeMarkdown(data.service)}` : '',
        data.subject ? `📌 *Mövzu:* ${escapeMarkdown(data.subject)}` : '',
        `💬 *Mesaj:*\n${escapeMarkdown(data.message)}`,
      ].filter(Boolean).join('\n');

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'MarkdownV2',
        }),
      });
    } catch (err) {
      console.warn('[notifications] Telegram bildirişi göndərilmədi:', err);
    }
  }

  // 2. Xarici Webhook / Zapier / Make
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'new_inquiry',
          timestamp: new Date().toISOString(),
          ...data,
        }),
      });
    } catch (err) {
      console.warn('[notifications] Webhook bildirişi göndərilmədi:', err);
    }
  }
}

function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}
