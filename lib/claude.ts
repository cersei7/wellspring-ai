import Anthropic from '@anthropic-ai/sdk';

export const claude = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export const MODEL = 'claude-sonnet-4-6';

export async function askClaude(
  prompt: string,
  systemPrompt?: string,
  maxTokens = 1024
): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'sk-ant-...') {
    console.warn('ANTHROPIC_API_KEY not set. Returning mock response.');
    return JSON.stringify([{ category: "food", name: "canned goods", quantity: 1, unit: "item", attributes: {} }]);
  }

  const response = await claude.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
}
