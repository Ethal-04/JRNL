const prompts = [
  "What made you smile today?",
  "What's a challenge you overcame recently?",
  "Describe your perfect day.",
  "What are you grateful for today?",
  "What's something you'd like to improve about yourself?",
  "Write about a memory that makes you happy.",
  "What are your goals for this month?",
  "Describe a person who inspires you.",
  "What would you tell your younger self?",
  "What's something you're looking forward to?",
];

export function getDailyPrompt(): string {
  const today = new Date();
  const index = today.getDate() % prompts.length;
  return prompts[index];
}
