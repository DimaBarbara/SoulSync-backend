const { HfInference } = require('@huggingface/inference');
const Mood = require('../models/mood-model');
const { getEnvVar } = require('../utils/getEnvVar');

const HF_ACCESS_TOKEN = getEnvVar('HUGGING_FACE_API_KEY');
const hf = new HfInference(HF_ACCESS_TOKEN);

async function analyzeMood(userId, text) {

  const emotionModel = 'j-hartmann/emotion-english-distilroberta-base';
  const adviceModel = 'google/gemma-3-270m';

  let emotionsArray = [];
  try {
    const result = await hf.textClassification({
      model: emotionModel,
      inputs: text,
    });
    const sorted = result.sort((a, b) => b.score - a.score);
    emotionsArray = sorted.slice(0, 3).map(e => ({
      label: e.label.toLowerCase(),
      score: (e.score * 100).toFixed(2),
    }));
  } catch (err) {
    console.error('Emotion analysis failed:', err);
    emotionsArray = [{ label: 'neutral', score: '100.00' }];
  }

  const mainEmotion = emotionsArray[0]?.label || 'neutral';
  
  const prompt = `You are a psychologist. The user's main emotion is: ${mainEmotion}. The text they wrote is: "${text}". Give a short, practical, specific advice in English to help with this state.`;

  let advice = null;

  try {
    const result = await hf.textGeneration({
      model: adviceModel,
      inputs: prompt,
      parameters: { max_new_tokens: 60 },
      options: { wait_for_model: true }
    });
    advice = result.generated_text?.trim() || null;
  } catch (err) {
    console.error('AI advice generation failed:', err);
    advice = "AI unavailable right now";
  }

  const moodEntry = await Mood.create({
    userId,
    text,
    emotions: emotionsArray,
    advice
  });

  return moodEntry;
}

module.exports = { analyzeMood };
