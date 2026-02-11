import { NextResponse } from 'next/server';
import { AIRecommendationResultSchema } from '@eatwhat/shared';
import type { AIMatchInput } from '@eatwhat/shared';

const API_URL = 'https://dashscope.aliyuncs.com/api/v1/apps/completion';

const buildPrompt = (input: AIMatchInput) => {
  const payload = JSON.stringify(input, null, 2);
  return [
    '你是餐厅地点推荐智能体。',
    '请根据系统输入生成推荐，严格只返回 JSON，不要包含多余文字或 Markdown。',
    '输出必须包含 midpoint_analysis 和 candidates（3-5 项）。',
    'candidates 字段包含 venue_name、address、location{lat,lng}、type(organic|sponsored)、recommendation_reason、estimated_cost、best_for(数组)、suggested_item、imgUrl(可选，直接 URL)。',
    '系统输入如下：',
    payload,
  ].join('\n');
};

const normalizeImageUrl = (value?: string) => {
  if (!value) return undefined;
  const markdownMatch = value.match(/\((https?:\/\/[^)]+)\)/);
  if (markdownMatch) return markdownMatch[1];
  return value;
};

const normalizeStringArray = (value: unknown) => {
  if (Array.isArray(value)) return value.map((item) => String(item)).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[，,、\/]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [] as string[];
};

const normalizeRecommendation = (raw: Record<string, unknown>) => {
  const candidates = Array.isArray(raw.candidates) ? raw.candidates : [];
  return {
    midpoint_analysis: String(raw.midpoint_analysis ?? ''),
    candidates: candidates
      .map((candidate) => {
        const item = candidate as Record<string, unknown>;
        return {
          venue_name: String(item.venue_name ?? item.name ?? ''),
          address: String(item.address ?? ''),
          location: {
            lat: Number((item.location as { lat?: number })?.lat ?? item.lat ?? 0),
            lng: Number((item.location as { lng?: number })?.lng ?? item.lng ?? 0),
          },
          type: item.type === 'sponsored' ? 'sponsored' : 'organic',
          recommendation_reason: String(item.recommendation_reason ?? ''),
          estimated_cost: Number(item.estimated_cost ?? item.price ?? 0),
          best_for: normalizeStringArray(item.best_for),
          suggested_item: String(item.suggested_item ?? ''),
          imgUrl: normalizeImageUrl(
            typeof item.imgUrl === 'string'
              ? item.imgUrl
              : typeof item.image === 'string'
              ? item.image
              : typeof item.image_url === 'string'
              ? item.image_url
              : undefined
          ),
        };
      })
      .filter((candidate) => candidate.venue_name),
  };
};

const extractJsonFromText = (text: string) => {
  const trimmed = text.replace(/`json|`/g, '').trim();
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('AI response does not include JSON payload.');
  }
  return trimmed.slice(start, end + 1);
};

export async function POST(request: Request) {
  const { input } = (await request.json()) as { input?: AIMatchInput };
  if (!input) {
    return NextResponse.json({ message: 'Missing input.' }, { status: 400 });
  }

  const apiKey = process.env.DASHSCOPE_API_KEY ?? process.env.API_KEY;
  const appId = process.env.DASHSCOPE_APP_ID ?? process.env.APP_ID;
  if (!apiKey || !appId) {
    return NextResponse.json({ message: 'DashScope credentials are not configured.' }, { status: 500 });
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'X-DashScope-AppId': appId,
      },
      body: JSON.stringify({
        prompt: buildPrompt(input),
        stream: false,
      }),
    });

    const data = (await response.json()) as Record<string, unknown>;
    if (!response.ok || data.code) {
      const message = String(data.message ?? 'DashScope request failed.');
      return NextResponse.json({ message }, { status: response.status || 400 });
    }

    const output = data.output as { text?: string } | undefined;
    const text = typeof output?.text === 'string' ? output.text : '';
    const jsonText = extractJsonFromText(text);
    const parsed = JSON.parse(jsonText) as Record<string, unknown>;
    const normalized = normalizeRecommendation(parsed);
    const validated = AIRecommendationResultSchema.safeParse(normalized);
    if (!validated.success) {
      return NextResponse.json({ message: 'AI response does not match expected schema.' }, { status: 422 });
    }

    return NextResponse.json(validated.data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'DashScope request failed.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
