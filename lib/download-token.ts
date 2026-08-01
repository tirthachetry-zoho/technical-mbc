import jwt from "jsonwebtoken";

const SECRET = process.env.DOWNLOAD_TOKEN_SECRET!;
const MAX_DOWNLOADS = 5;
const TOKEN_TTL = "15m";

export function signDownloadToken(orderId: string, userId: string) {
  return jwt.sign({ orderId, userId }, SECRET, { expiresIn: TOKEN_TTL });
}

export function verifyDownloadToken(token: string) {
  return jwt.verify(token, SECRET) as { orderId: string; userId: string };
}

export const MAX_DOWNLOADS_PER_ORDER = MAX_DOWNLOADS;
