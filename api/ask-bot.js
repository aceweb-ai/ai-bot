// Файл: /api/ask-bot.js
export default async function handler(req, res) {
    // 1. НАСТРОЙКА CORS
    const allowedOrigin = "https://aceweb-ai.github.io";
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. ОБРАБОТКА OPTIONS-ЗАПРОСА (Preflight)
    if (req.method === 'OPTIONS') {
        console.log('Preflight OPTIONS request passed');
        return res.status(200).end();
    }

    // 3. ОБРАБОТКА POST-ЗАПРОСА
    if (req.method === 'POST') {
        try {
            console.log('POST request received');
            
            // КРИТИЧНОЕ ИСПРАВЛЕНИЕ: Vercel предоставляет тело запроса в req.body
            let body;
            try {
                body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
            } catch (parseError) {
                console.error('Failed to parse request body:', parseError);
                return res.status(400).json({ error: 'Invalid JSON in request body' });
            }
            
            const { question } = body;
            
            if (!question) {
                return res.status(400).json({ error: 'Missing "question" field in request' });
            }
            
            console.log('Question received:', question);
            
// ===== НАЧАЛО БЛОКА ДЛЯ ЗАМЕНЫ =====
console.log('Sending request to Chutes LLM API...');

// 1. Получаем API-токен из переменных окружения Vercel
const CHUTES_API_TOKEN = process.env.CHUTES_API_TOKEN;
const CHUTES_API_URL = "https://llm.chutes.ai/v1/chat/completions";

// 2. Формируем промпт (system message задает роль бота)
const messages = [
    {
        "role": "system",
        "content": "Ты - полезный, вежливый и профессиональный AI-ассистент компании. Отвечай на вопросы клиентов кратко, по делу и дружелюбно. Если не знаешь ответа, вежливо предложи обратиться к менеджеру."
    },
    {
        "role": "user",
        "content": question // Вопрос от посетителя сайта
    }
];

try {
    const chutesResponse = await fetch(CHUTES_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${CHUTES_API_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "NousResearch/Hermes-4-14B", // Вы можете сменить модель
            "messages": messages,
            "stream": false, // Для начала используем false, чтобы получить сразу весь ответ
            "max_tokens": 500,  // Ограничим длину ответа для экономии токенов
            "temperature": 0.7
        })
    });

    if (!chutesResponse.ok) {
        const errorText = await chutesResponse.text();
        console.error(`Chutes API error (${chutesResponse.status}):`, errorText);
        throw new Error(`Ошибка AI-сервиса: ${chutesResponse.status}`);
    }

    const chutesData = await chutesResponse.json();
    console.log('Chutes API response received.');

    // 3. Извлекаем текст ответа из структуры API (стандартный формат OpenAI)
    // Ответ содержится в chutesData.choices[0].message.content
    const aiAnswer = chutesData.choices?.[0]?.message?.content || "Не удалось получить ответ от AI.";

    // 4. Возвращаем ответ на фронтенд
    return res.status(200).json({
        answer: aiAnswer,
        receivedQuestion: question,
        source: 'chutes-llm-api'
    });

} catch (chutesError) {
    console.error('Error calling Chutes LLM API:', chutesError);
    // Fallback-ответ
    return res.status(200).json({
        answer: `Извините, в данный момент я не могу обработать ваш вопрос. Пожалуйста, свяжитесь с нами напрямую. (Ваш вопрос: "${question}")`,
        receivedQuestion: question,
        error: true
    });
}
// ===== КОНЕЦ БЛОКА ДЛЯ ЗАМЕНЫ =====
            
        } catch (error) {
            console.error('Unexpected error in POST handler:', error);
            return res.status(500).json({ 
                error: 'Internal Server Error',
                details: error.message 
            });
        }
    }

    // 4. Все остальные методы (GET и т.д.)
    console.warn(`Method ${req.method} not allowed`);
    return res.status(405).json({ error: 'Method Not Allowed. Use POST or OPTIONS.' });
}
