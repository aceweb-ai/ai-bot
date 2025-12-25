// Файл: /api/ask-bot.js
export default async function handler(req, res) {
    // 1. НАСТРОЙКА CORS - РАЗРЕШАЕМ ТОЛЬКО ВАШ ФРОНТЕНД
    const allowedOrigin = "https://aceweb-ai.github.io";
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // 2. ОБРАБОТКА ПРЕДВАРИТЕЛЬНОГО ЗАПРОСА OPTIONS (Preflight)
    if (req.method === 'OPTIONS') {
        console.log('Preflight OPTIONS request received');
        return res.status(200).end(); // Отвечаем "OK" на предзапрос
    }

    // 3. ОСНОВНАЯ ЛОГИКА ТОЛЬКО ДЛЯ POST
    if (req.method === 'POST') {
        try {
            console.log('POST request received');
            const { question } = await req.json();
            
            // Ваш фиктивный ответ (позже замените на вызов Chutes)
            const mockAnswer = `[Ответ от Vercel] Я получил ваш вопрос: "${question}". Всё работает, CORS настроен!`;
            
            return res.status(200).json({
                answer: mockAnswer,
                receivedQuestion: question
            });
        } catch (error) {
            console.error('Error in POST handler:', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    // 4. Если метод не OPTIONS и не POST
    return res.status(405).json({ error: 'Method Not Allowed' });
}
