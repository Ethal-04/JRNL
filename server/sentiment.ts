
import natural from 'natural';
const analyzer = new natural.SentimentAnalyzer();

export function analyzeSentiment(text: string) {
  const tokens = new natural.WordTokenizer().tokenize(text) || [];
  const score = analyzer.getSentiment(tokens);
  return {
    score,
    label: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
  };
}
