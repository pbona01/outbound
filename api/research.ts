import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { domain, role = 'Executive' } = req.body;
  if (!domain) {
    return res.status(400).json({ success: false, error: 'Domain is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(400).json({
      success: false,
      code: 'PROVIDER_NOT_CONFIGURED',
      error: 'Gemini API Key is not configured. AI drafting and domain research is unavailable.',
    });
  }

  try {
    const cleanDomain = domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    const targetUrl = `https://${cleanDomain}`;

    let scrapedText = '';
    let scrapedTitle = '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const siteRes = await fetch(targetUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) OutboundOS-Auditor/1.0' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (siteRes.ok) {
        const html = await siteRes.text();
        scrapedTitle = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || cleanDomain;
        scrapedText = html
          .replace(/<script\b[^<]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style\b[^<]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .slice(0, 3000);
      }
    } catch {
      scrapedText = `Could not reach ${cleanDomain}. Fallback to offline domain analysis.`;
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are an expert B2B sales research agent. Analyze this company domain:
Domain: ${cleanDomain}
Website context: ${scrapedText || 'None available'}

Perform domain analysis and extract factual insights. Return strict, parseable JSON with the following schema:
{
  "companyName": "string",
  "domain": "string",
  "industry": "string",
  "location": "string",
  "score": 0-100 (numeric fit score),
  "decisionMaker": { "name": "string", "role": "string", "email": "string", "verified": false },
  "techStack": ["string"],
  "observations": [
    { "issue": "string", "impact": "string", "evidence": "string", "severity": "high"|"medium"|"low" }
  ],
  "evidenceUrls": ["string"],
  "confidenceScore": 0-100
}

If no specific details are found on the website, mark decisionMaker name as "Contact unavailable", email as "Email unavailable", and confidenceScore low. DO NOT make up fake people or fake emails.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const rawText = response.text || '';
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse Gemini JSON response');
    }

    const result = JSON.parse(jsonMatch[0]);
    return res.json({ success: true, result });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
