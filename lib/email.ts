/**
 * Email utility — stub implementation that logs to console.
 * In production, replace with Resend/SendGrid/Nodemailer integration.
 *
 * Example with Resend:
 *   import { Resend } from "resend";
 *   const resend = new Resend(process.env.RESEND_API_KEY);
 *   await resend.emails.send({ from, to, subject, html });
 */

type EmailParams = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailParams) {
  // TODO: Replace with real email provider (Resend/SendGrid/Nodemailer)
  console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
  console.log(`[EMAIL] Body: ${html.slice(0, 200)}...`);
  return { success: true };
}

export function purchaseConfirmationEmail(
  userName: string,
  orderNumber: string,
  items: { title: string; price: number }[],
  total: number
) {
  const itemList = items
    .map((i) => `<tr><td style="padding:8px;border-bottom:1px solid #eee">${i.title}</td><td style="padding:8px;border-bottom:1px solid #eee;text-align:right">₹${i.price / 100}</td></tr>`)
    .join("");

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#046bd2">Payment Successful! 🎉</h2>
      <p>Hi ${userName},</p>
      <p>Thank you for your purchase. Your order <strong>${orderNumber}</strong> has been confirmed.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#f0f5fa">
            <th style="padding:8px;text-align:left">Product</th>
            <th style="padding:8px;text-align:right">Price</th>
          </tr>
        </thead>
        <tbody>${itemList}</tbody>
        <tfoot>
          <tr><td style="padding:8px;font-weight:bold">Total</td><td style="padding:8px;font-weight:bold;text-align:right">₹${total / 100}</td></tr>
        </tfoot>
      </table>
      <p>You can download your PDFs from your <a href="${process.env.NEXT_PUBLIC_BASE_URL || ""}/dashboard/downloads?order=${orderNumber}" style="color:#046bd2">downloads page</a>.</p>
      <p style="color:#666;font-size:14px;margin-top:24px">— ToppersNotes Team</p>
    </div>
  `;
}