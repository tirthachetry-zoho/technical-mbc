import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

/**
 * Watermarks a PDF buffer with the buyer's name/email/order ID on every page.
 * The watermark is semi-transparent diagonal text that doesn't obstruct reading
 * but identifies the buyer for anti-piracy purposes.
 */
export async function watermarkPdf(
  pdfBuffer: Buffer,
  buyerInfo: { name: string; email: string; orderId: string }
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const watermarkText = `${buyerInfo.email} | Order: ${buyerInfo.orderId}`;

  for (const page of pages) {
    const { width, height } = page.getSize();

    // Diagonal watermark across the page
    page.drawText(watermarkText, {
      x: width / 2 - font.widthOfTextAtSize(watermarkText, 10) / 2,
      y: height / 2,
      size: 10,
      font,
      color: rgb(0.7, 0.7, 0.7),
      opacity: 0.3,
    });

    // Small footer watermark at bottom
    page.drawText(`Licensed to: ${buyerInfo.name || buyerInfo.email}`, {
      x: 10,
      y: 5,
      size: 6,
      font,
      color: rgb(0.5, 0.5, 0.5),
      opacity: 0.5,
    });
  }

  const watermarkedBytes = await pdfDoc.save();
  return Buffer.from(watermarkedBytes);
}