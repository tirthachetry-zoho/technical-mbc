/**
 * WhatsApp notification utilities
 */

const ADMIN_WHATSAPP = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "";

/**
 * Format order details for WhatsApp message
 */
export function formatOrderMessage(order: {
  orderNumber: string;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  amount: number;
  items: Array<{ title: string; price: number }>;
}): string {
  const customerInfo = order.guestName 
    ? `*Customer:* ${order.guestName}\n*Email:* ${order.guestEmail || 'N/A'}\n*Phone:* ${order.guestPhone || 'N/A'}`
    : `*Email:* ${order.guestEmail || 'N/A'}`;

  const itemsList = order.items
    .map((item, idx) => `${idx + 1}. ${item.title} - ₹${(item.price / 100).toFixed(2)}`)
    .join('\n');

  return encodeURIComponent(
    `🛒 *New Order Confirmed*\n\n` +
    `*Order #:* ${order.orderNumber}\n\n` +
    `${customerInfo}\n\n` +
    `*Items:*\n${itemsList}\n\n` +
    `*Total Amount:* ₹${(order.amount / 100).toFixed(2)}\n\n` +
    `✅ Payment confirmed via UPI`
  );
}

/**
 * Get WhatsApp URL for order notification (server-safe)
 */
export function getOrderNotificationWhatsAppUrl(order: {
  orderNumber: string;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  amount: number;
  items: Array<{ title: string; price: number }>;
}): string | null {
  if (!ADMIN_WHATSAPP) {
    console.warn("[WHATSAPP] Admin WhatsApp number not configured");
    return null;
  }

  const message = formatOrderMessage(order);
  return `https://wa.me/${ADMIN_WHATSAPP}?text=${message}`;
}

/**
 * Open WhatsApp chat with pre-filled message for order notification (client-side only)
 */
export function sendOrderNotificationWhatsApp(order: {
  orderNumber: string;
  guestName?: string | null;
  guestEmail?: string | null;
  guestPhone?: string | null;
  amount: number;
  items: Array<{ title: string; price: number }>;
}): void {
  const whatsappUrl = getOrderNotificationWhatsAppUrl(order);
  if (whatsappUrl && typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank');
  }
}

/**
 * Open WhatsApp chat for customer support (client-side only)
 */
export function openCustomerSupportWhatsApp(message?: string): void {
  const defaultMessage = encodeURIComponent("Hi, I need help with my order.");
  const msg = message || defaultMessage;
  
  if (!ADMIN_WHATSAPP) {
    console.warn("[WHATSAPP] Admin WhatsApp number not configured");
    return;
  }

  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${msg}`;
  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank');
  }
}