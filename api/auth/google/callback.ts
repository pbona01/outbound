import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { code, error } = req.query;
  if (error || !code) {
    return res.redirect('/integrations?error=oauth_cancelled');
  }

  // Handle token exchange securely server-side in the future
  return res.redirect('/integrations?status=gmail_connected');
}
