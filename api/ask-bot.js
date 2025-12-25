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
            
            // Фиктивный ответ (позже замените на вызов Chutes)
            const mockAnswer = `[Ответ от Vercel] Я получил ваш вопрос: "${question}". Теперь JSON парсится корректно!`;
            
            return res.status(200).json({
                answer: mockAnswer,
                receivedQuestion: question,
                debug: 'Backend is working'
            });
            
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
