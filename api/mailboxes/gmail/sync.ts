import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(400).json({
    success: false,
    code: 'MAILBOX_NOT_CONNECTED',
    error: 'Mailbox not connected. Synchronization is unavailable.',
  });
}
