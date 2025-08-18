const { HfInference } = require('@huggingface/inference');
const Mood = require('../models/mood-model');
const { getEnvVar } = require('../utils/getEnvVar');

const HF_ACCESS_TOKEN = getEnvVar('HUGGING_FACE_API_KEY');
const hf = new HfInference(HF_ACCESS_TOKEN);

async function analyzeMood(userId, text) {
  const emotionModel = 'j-hartmann/emotion-english-distilroberta-base';
  let emotionsArray = [];

  try {
    const result = await hf.textClassification({
      model: emotionModel,
      inputs: text,
    });
    
    const sortedEmotions = result.sort((a, b) => b.score - a.score);
    
    emotionsArray = sortedEmotions.slice(0, 3).map(e => ({
      label: e.label.toLowerCase(),
      score: (e.score * 100).toFixed(2)
    }));
    
  } catch (error) {
    console.error('Ошибка анализа настроения:', error);
    emotionsArray = [{ label: 'нейтрально', score: '100.00' }];
  }

  const mainEmotion = emotionsArray[0]?.label || 'нейтрально';
  const adviceModel = 'google/flan-t5-large';
  const advicePrompt = `Текст: "${text}", Основная эмоция: "${mainEmotion}". Дай короткий и практический совет, как справиться с этой эмоцией или улучшить настроение.`;
  let advice = "Не удалось сгенерировать совет.";

  try {
    const adviceResult = await hf.textGeneration({
      model: adviceModel,
      inputs: advicePrompt,
    });
    advice = adviceResult.generated_text.trim();
  } catch (error) {
    console.error('Ошибка генерации совета:', error);
    advice = "Не удалось сгенерировать совет. Попробуйте обратиться к психологу.";
  }

  const moodEntry = await Mood.create({ userId, text, emotions: emotionsArray, advice });

  return moodEntry;
}

module.exports = { analyzeMood };