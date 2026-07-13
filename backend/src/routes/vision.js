const express = require('express');
const { auth } = require('../middleware/auth');
const https = require('https');

const router = express.Router();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = 'api.deepseek.com';

/**
 * Вызвать DeepSeek API (chat completions)
 */
function callDeepSeek(messages, maxTokens = 1024) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model: 'deepseek-chat',
      messages,
      max_tokens: maxTokens,
      temperature: 0.3,
    });

    const options = {
      hostname: DEEPSEEK_API_URL,
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.error) {
            return reject(new Error(parsed.error.message || 'DeepSeek API error'));
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse DeepSeek response: ${body.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * Распарсить ответ DeepSeek в структуру { name, caloriesPer100, proteinsPer100, fatsPer100, carbsPer100 }
 */
function parseFoodResponse(content) {
  // Ищем JSON в ответе
  const jsonMatch = content.match(/\{[\s\S]*"name"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: parsed.name || parsed.Название || 'Неизвестно',
        caloriesPer100: Number(parsed.caloriesPer100) || Number(parsed.калории) || 0,
        proteinsPer100: Number(parsed.proteinsPer100) || Number(parsed.белки) || 0,
        fatsPer100: Number(parsed.fatsPer100) || Number(parsed.жиры) || 0,
        carbsPer100: Number(parsed.carbsPer100) || Number(parsed.углеводы) || 0,
      };
    } catch {}
  }

  // Fallback: пытаемся извлечь числа из текста
  const numbers = content.match(/(\d+[.,]?\d*)/g);
  return {
    name: 'AI: ' + content.split('\n')[0].slice(0, 60),
    caloriesPer100: numbers ? Number(numbers[0]) || 0 : 0,
    proteinsPer100: numbers && numbers[1] ? Number(numbers[1]) : 0,
    fatsPer100: numbers && numbers[2] ? Number(numbers[2]) : 0,
    carbsPer100: numbers && numbers[3] ? Number(numbers[3]) : 0,
  };
}

// Анализ фото (base64)
router.post('/analyze-photo', auth, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Изображение обязательно' });
    }

    const systemPrompt = `Ты — эксперт по нутрициологии. Определи блюдо/продукт на фото и верни JSON строго в формате:
{"name": "Название блюда", "caloriesPer100": число, "proteinsPer100": число, "fatsPer100": число, "carbsPer100": число}
Если не уверен — дай приблизительные значения. Только JSON, без лишнего текста.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Что это за блюдо? Верни JSON с КБЖУ на 100г.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } },
        ],
      },
    ];

    const response = await callDeepSeek(messages, 512);
    const content = response.choices?.[0]?.message?.content || '';
    const result = parseFoodResponse(content);

    res.json(result);
  } catch (err) {
    console.error('[Vision] Photo error:', err.message);
    res.status(500).json({ error: 'Ошибка анализа фото' });
  }
});

// Анализ текстового описания
router.post('/analyze-text', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Описание обязательно' });
    }

    const systemPrompt = `Ты — эксперт по нутрициологии. Определи КБЖУ на 100г продукта/блюда по описанию.
Верни JSON строго в формате:
{"name": "Название", "caloriesPer100": число, "proteinsPer100": число, "fatsPer100": число, "carbsPer100": число}
Только JSON, без лишнего текста.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: text },
    ];

    const response = await callDeepSeek(messages, 512);
    const content = response.choices?.[0]?.message?.content || '';
    const result = parseFoodResponse(content);

    res.json(result);
  } catch (err) {
    console.error('[Vision] Text error:', err.message);
    res.status(500).json({ error: 'Ошибка анализа текста' });
  }
});

module.exports = router;
