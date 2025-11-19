const Mood = require('../models/mood-model');
const { getEnvVar } = require('../utils/getEnvVar');
const axios = require('axios');

const API_KEY = getEnvVar("AZURE_OPENAI_API_KEY");
const ENDPOINT = getEnvVar("AZURE_OPENAI_ENDPOINT");
const DEPLOYMENT = getEnvVar("AZURE_OPENAI_DEPLOYMENT_NAME");
const API_VERSION = getEnvVar("AZURE_OPENAI_API_VERSION");

async function azureChat(messages) {
  const url = `${ENDPOINT}openai/deployments/${DEPLOYMENT}/chat/completions?api-version=${API_VERSION}`;

  const response = await axios.post(
    url,
    {
      messages,
      max_tokens: 200,
      temperature: 0.4
    },
    {
      headers: {
        "api-key": API_KEY,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data.choices[0].message.content;
}

async function analyzeMood(userId, text) {
  const emotionPrompt = [
    {
      role: "system",
      content:
        "You are an emotion classification model. Return ONLY a JSON array of objects [{label,score}], with three most likely emotions. Emotions allowed: happy, sad, angry, stressed, anxious, neutral."
    },
    {
      role: "user",
      content: `Analyze the text and return top 3 emotions with scores (0-100). Text: "${text}"`
    }
  ];

  let emotionsArray = [];

  try {
    const raw = await azureChat(emotionPrompt);
    emotionsArray = JSON.parse(raw);
  } catch (err) {
    console.error("Emotion analysis failed:", err);
    emotionsArray = [{ label: "neutral", score: "100.00" }];
  }

  const mainEmotion = emotionsArray[0]?.label || "neutral";
  const advicePrompt = [
    {
      role: "system",
      content: "You are a practical psychologist. Give short, specific, useful advice in English."
    },
    {
      role: "user",
      content: `Main emotion: ${mainEmotion}.  
Text: "${text}".  
Give a concise advice.`
    }
  ];

  let advice = "AI unavailable right now";

  try {
    advice = await azureChat(advicePrompt);
  } catch (err) {
    console.error("AI advice generation failed:", err);
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
