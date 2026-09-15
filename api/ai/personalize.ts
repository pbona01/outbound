import type { VercelRequest, VercelResponse } from '@vercel/node';
import handler from '../draft-email';

export default async function personalizeHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
