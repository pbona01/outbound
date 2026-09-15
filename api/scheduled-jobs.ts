import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { campaignId, prospectId, sequenceStepId, scheduledFor } = req.body;
    
    if (!campaignId || !prospectId) {
      return res.status(400).json({ success: false, error: 'campaignId and prospectId are required' });
    }

    const idempotencyKey = crypto
      .createHash('sha256')
      .update(`${campaignId}-${prospectId}-${sequenceStepId || ''}`)
      .digest('hex');

    return res.json({
      success: true,
      job: {
        id: `job-${idempotencyKey.slice(0, 10)}`,
        idempotencyKey,
        campaignId,
        prospectId,
        sequenceStepId: sequenceStepId || null,
        scheduledFor: scheduledFor || new Date().toISOString(),
        status: 'pending',
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
