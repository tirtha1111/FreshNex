export interface AIThresholdResearchResult {
  productName: string;
  category: string;
  tempMin: number;
  tempMax: number;
  optimalTemp: number;
  humMin: number;
  humMax: number;
  optimalHumidity: number;
  mq135Threshold: number;
  shelfLifeDays: number;
  ethyleneSensitivity: 'High' | 'Moderate' | 'Low' | 'None';
  scientificRationale: string;
  citations: string[];
  provider: 'ai-gpt-oss-120b' | 'gemini' | 'scientific-database' | string;
  model?: string;
  note?: string;
  researchedAt: string;
}

/**
 * Conducts automated food science research via AI model openai/gpt-oss-120b (or server fallbacks)
 * to determine precise cold-chain IoT threshold bounds.
 */
export async function researchProductThresholds(
  productName: string,
  category?: string,
  storageContext?: string
): Promise<AIThresholdResearchResult> {
  const cleanName = productName.trim();
  if (!cleanName) {
    throw new Error('Please specify a product name for AI research.');
  }

  const response = await fetch('/api/ai/suggest-thresholds', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      productName: cleanName,
      category,
      storageContext,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `AI research request failed with status ${response.status}`);
  }

  const data: AIThresholdResearchResult = await response.json();
  return data;
}
