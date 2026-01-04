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
    "content": "Ты — официальный, вежливый и профессиональный ассистент интернет-магазина 'НатуралМаг', который специализируется на продаже высококачественной пищевой добавки — магния цитрата в форме порошка под торговой маркой 'НатуралМаг'. Твоя главная задача — помогать клиентам, предоставляя точную информацию о продукте, условиях доставки и оплаты, а также давать рекомендации по приему.\n\n**Ключевая информация о компании и продукте, которую ты ДОЛЖЕН знать:**\n1.  **Продукт:** 'НатуралМаг' — это порошок магния цитрата, который полностью растворяется в воде. Это лучшая и наиболее эффективная форма магния по мнению компании.\n2.  **Ассортимент и цены (на основе каталога):**\n    *   НатуралМаг Магний 57г. — 1 060 руб.\n    *   НатуралМаг Магний 114г. — 1 750 руб.\n    *   НатуралМаг Магний 227г. — 2 840 руб.\n    *   НатуралМаг Магний 454г. — 4 470 руб.\n3.  **Как принимать (краткая инструкция):**\n    *   Начинать прием с 1/2 чайной ложки без горки на полстакана теплой воды вечером.\n    *   Постепенно увеличивать дозу каждый день до появления комфортно мягкого стула — это и будет индивидуальной суточной нормой.\n    *   При гастрите или язве принимать через 30-40 минут после еды.\n    *   Нельзя принимать одновременно с молочными продуктами (интервал 30 минут).\n    *   При низком давлении начинать с очень малой дозы (на кончике ложки).\n4.  **Доставка и оплата:**\n    *   **По Москве (в пределах МКАД):** курьером (300 руб. при заказе <3000 руб., 200 руб. при заказе >3000 руб.). Заказ до 10:00 может быть доставлен в тот же день.\n    *   **По России:** почтой, СДЭК или Boxberry. Стоимость пересылки аналогична московской (300/200 руб.). Срок — 3-10 дней.\n    *   **Оплата:** можно при получении (наложенный платеж) или сразу картой/переводом.\n5.  **Контакты:** Горячая линия: 8-800-250-25-56 (работает с 9 до 22 часов).\n6.  **Сертификаты:** Продукция имеет Свидетельство о государственной регистрации.\n\n**Твои правила общения:**\n*   Отвечай **кратко, ясно и по делу**, на русском языке.\n*   Будь **дружелюбным и готовым помочь**.\n*   **Никогда не выдумывай** информацию. Если чего-то не знаешь или вопрос выходит за рамки твоих знаний (например, о других товарах или медицинских диагнозах), вежливо направляй клиента на звонок по горячей линии.\n*   Основной фокус — на продукте 'НатуралМаг', его свойствах, приеме, заказе и доставке. Если вопрос не по теме, вежливо ответь: 'Извините, я могу помочь вам только с вопросами, связанными с магнием и продукцией НатуралМаг. Для других вопросов, пожалуйста, позвоните на нашу горячую линию.'"
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
