import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { prospectId, campaignId } = req.body;
  if (!prospectId) {
    return res.status(400).json({ success: false, error: 'prospectId is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({
      success: false,
      error: 'AI drafting is not configured. Please supply GEMINI_API_KEY in settings.',
    });
  }

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ success: false, error: 'Supabase is not configured on the server.' });
  }

  try {
    const supabaseServer = createClient(supabaseUrl, supabaseKey);

    // 1. Fetch prospect
    const { data: prospect, error: pError } = await supabaseServer
      .from('prospects')
      .select('*')
      .eq('id', prospectId)
      .single();

    if (pError || !prospect) {
      return res.status(404).json({ success: false, error: `Prospect not found: ${pError?.message || 'unknown'}` });
    }

    // 2. Fetch campaign
    const { data: campaign, error: cError } = await supabaseServer
      .from('campaigns')
      .select('*')
      .eq('id', campaignId || prospect.campaign_id || '')
      .single();

    // 3. Fetch workspace
    const { data: workspace, error: wError } = await supabaseServer
      .from('workspaces')
      .select('*')
      .eq('id', prospect.workspace_id)
      .single();

    if (wError || !workspace) {
      return res.status(404).json({ success: false, error: `Workspace not found: ${wError?.message || 'unknown'}` });
    }

    const offer = workspace.offer || 'Our standard premium services and customized solutions';
    const recipientName = prospect.contact_name || 'there';
    const recipientEmail = prospect.contact_email || '';
    const companyName = prospect.company_name || 'your company';
    const evidence = prospect.evidence || '';

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are an elite B2B copywriter specialized in personalized cold outreach.
Write a highly targeted, direct, and non-spammy cold email to:
Recipient: ${recipientName}
Company: ${companyName}
Observations / Context: ${evidence}

Our Offer: ${offer}

Write a subject line and email body. The email must be conversational, respect the prospect's time, and suggest a clear but low-friction next step (like a 5-minute chat or brief review).
Return ONLY a strict JSON object with this exact schema:
{
  "subject": "subject line text",
  "body": "email body text"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const rawText = response.text || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse Gemini JSON response');
    }

    const emailDraft = JSON.parse(jsonMatch[0]);

    // 4. Save to email_messages as 'draft'
    const { data: savedMsg, error: insertError } = await supabaseServer
      .from('email_messages')
      .insert({
        workspace_id: prospect.workspace_id,
        campaign_id: campaignId || prospect.campaign_id || null,
        prospect_id: prospectId,
        sender: workspace.name || 'Outbound Engine',
        recipient: recipientEmail || 'Email unavailable',
        subject: emailDraft.subject,
        body: emailDraft.body,
        status: 'draft',
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Error saving email draft to DB:', insertError);
    }

    // Return email so frontend client gets it exactly as data.email
    return res.json({
      success: true,
      email: {
        subject: emailDraft.subject,
        body: emailDraft.body,
      },
      savedMessageId: savedMsg?.id || null,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
