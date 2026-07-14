const express = require('express');
const { auth } = require('../middleware/auth');
const https = require('https');

const router = express.Router();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = 'api.deepseek.com';

// Агент с отключённой проверкой сертификата (для GigaChat)
const gigaAgent = new https.Agent({ rejectUnauthorized: false });

// ---------- GigaChat ----------
let gigachatTokenCache = null;
let gigachatTokenExpiry = 0;

/**
 * Получить access token для GigaChat через client_id:client_secret
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getGigaChatToken() {
  return new Promise((resolve, reject) => {
    if (gigachatTokenCache && gigachatTokenExpiry > Date.now()) {
      return resolve(gigachatTokenCache);
    }

    const clientId = process.env.GIGACHAT_CLIENT_ID;
    const clientSecret = process.env.GIGACHAT_CLIENT_SECRET;
    const scope = process.env.GIGACHAT_SCOPE || 'GIGACHAT_API_PERS';

    if (!clientId || !clientSecret) {
      return reject(new Error('GIGACHAT_CLIENT_ID или GIGACHAT_CLIENT_SECRET не заданы'));
    }

    const authStr = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const body = `scope=${encodeURIComponent(scope)}`;

    const options = {
      hostname: 'ngw.devices.sberbank.ru',
      port: 9443,
      path: '/api/v2/oauth',
      method: 'POST',
      agent: gigaAgent,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
        'Authorization': `Basic ${authStr}`,
        'RqUID': generateUUID(),
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) {
            gigachatTokenCache = parsed.access_token;
            gigachatTokenExpiry = Date.now() + 25 * 60 * 1000; // 25 мин
            resolve(parsed.access_token);
          } else {
            reject(new Error(`GigaChat token error: ${JSON.stringify(parsed)}`));
          }
        } catch (e) {
          reject(new Error(`GigaChat token parse error: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * Вызвать GigaChat API (chat completions, поддерживает vision)
 */
function callGigaChat(messages, maxTokens = 512) {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await getGigaChatToken();
      const data = JSON.stringify({
        model: 'GigaChat',
        messages,
        temperature: 0.3,
        max_tokens: maxTokens,
      });

      const options = {
        hostname: 'gigachat.devices.sberbank.ru',
        path: '/api/v1/chat/completions',
        method: 'POST',
        agent: gigaAgent,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
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
              return reject(new Error(`GigaChat API: ${parsed.error.message || JSON.stringify(parsed.error)}`));
            }
            resolve(parsed);
          } catch (e) {
            reject(new Error(`GigaChat parse error: ${body.slice(0, 300)}`));
          }
        });
      });

      req.on('error', reject);
      req.write(data);
      req.end();
    } catch (err) {
      reject(err);
    }
  });
}

// ---------- DeepSeek (text only) ----------
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
            return reject(new Error(`DeepSeek API: ${parsed.error.message || JSON.stringify(parsed.error)}`));
          }
          resolve(parsed);
        } catch (e) {
          reject(new Error(`DeepSeek parse error: ${body.slice(0, 300)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ---------- Парсинг ответа ----------
function parseFoodResponse(content) {
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

  const numbers = content.match(/(\d+[.,]?\d*)/g);
  return {
    name: 'AI: ' + content.split('\n')[0].slice(0, 60),
    caloriesPer100: numbers ? Number(numbers[0]) || 0 : 0,
    proteinsPer100: numbers && numbers[1] ? Number(numbers[1]) : 0,
    fatsPer100: numbers && numbers[2] ? Number(numbers[2]) : 0,
    carbsPer100: numbers && numbers[3] ? Number(numbers[3]) : 0,
  };
}

// ---------- Анализ фото (GigaChat Vision) ----------
router.post('/analyze-photo', auth, async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: 'Изображение обязательно' });
    }

    console.log('[Vision] Sending to GigaChat Vision...');
    console.log('[Vision] Image base64 length:', image.length, 'bytes');

    // Если изображение слишком большое — ошибка сразу
    if (image.length > 500000) {
      return res.status(400).json({ error: 'Изображение слишком большое, сделайте фото с меньшим разрешением' });
    }

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Определи блюдо/продукт на фото и верни ТОЛЬКО JSON строго в формате: {"name": "Название блюда", "caloriesPer100": число, "proteinsPer100": число, "fatsPer100": число, "carbsPer100": число}. Если не уверен — дай приблизительные значения. Никакого лишнего текста, только JSON.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } },
        ],
      },
    ];

    const response = await callGigaChat(messages, 512);
    const content = response.choices?.[0]?.message?.content || '';
    console.log('[Vision] GigaChat response:', content.slice(0, 300));

    const result = parseFoodResponse(content);
    res.json(result);
  } catch (err) {
    console.error('[Vision] Photo error:', err.message);
    res.status(500).json({ error: 'Ошибка анализа фото: ' + (err.message || 'неизвестная ошибка') });
  }
});

// ---------- Анализ текста (DeepSeek) ----------
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
