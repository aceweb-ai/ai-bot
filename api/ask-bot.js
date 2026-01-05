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
            
            // Извлекаем вопрос и историю диалога из тела запроса
const { question, history = [] } = body; // history по умолчанию пустой массив

if (!question) {
    return res.status(400).json({ error: 'Missing "question" field in request' });
}

console.log('Question received:', question);
console.log('History length received:', history.length);
            
// ===== НАЧАЛО БЛОКА ДЛЯ ЗАМЕНЫ =====
console.log('Sending request to Chutes LLM API with context...');

// 1. Получаем API-токен из переменных окружения Vercel
const CHUTES_API_TOKEN = process.env.CHUTES_API_TOKEN;
const CHUTES_API_URL = "https://llm.chutes.ai/v1/chat/completions";

// 2. Формируем промпт с учетом истории диалога
// Начинаем всегда с system-сообщения, которое задает роль бота
let  messages = [
    {
    "role": "system",
    "content": "Ты — дружелюбный и профессиональный ассистент магазина 'НатуралМаг', специализирующегося на растворимом порошке магния цитрата. Твоя основная задача — точно и вежливо консультировать клиентов по продукту, его приему и заказу.\n\n**Обязательные знания о продукте 'НатуралМаг':**\n1.  **Что это:** Высококачественный порошок для приготовления напитка. Активный компонент — магния цитрат, который образуется при смешивании карбоната магния и лимонной кислоты в воде. Без добавок. Формула неизменна более 40 лет.\n2.  **Ассортимент и цены:** 57г (1 060 руб.), 114г (1 750 руб.), 227г (2 840 руб.), 454г (4 470 руб.). Самая выгодная цена — у банки 454г. Срок годности — 3 года. На банке есть QR-код 'Честный знак'.\n3.  **Эффекты и важное:** Способствует расслаблению мышц, нервной системы, нормальному усвоению кальция. Может оказывать слабительный эффект при избыточной дозе. Первой реакцией может быть прилив бодрости (5-10% случаев).\n4.  **Как принимать (ключевые принципы):**\n    *   **Дозировка:** Начать с 1/2 ч.л. и увеличивать по ощущениям. Нельзя превышать дозу, вызывающую послабляющий эффект. Суточная порция 4 г (примерно 3-4 ч.л.) содержит ~400 мг магния (средняя норма).\n    *   **Приготовление:** Растворять в воде (60-70°C — идеально). Вкус должен быть приятно слабокислым. Можно добавлять в сок, чай, подслащивать. Нельзя с молоком.\n    *   **Время приёма:** Оптимально — вечером. Если бодрит, то утром/днем. Натощак эффективнее.\n5.  **Доставка и оплата:**\n    *   **Москва (в пределах МКАД):** Курьер (300 руб. при заказе <3000 руб., 200 руб. от 3000 руб.). Заказ до 10:00 — возможна доставка в день заказа.\n    *   **Россия:** Почта, СДЭК, Boxberry. Стоимость аналогична (300/200 руб.), срок 3-10 дней.\n    *   **Оплата:** При получении (наложенный платеж) или онлайн.\n6.  **Гарантии и поддержка:**\n    *   Возврат/замена возможны, если продукт не подошёл. Для оформления — позвонить на горячую линию: **8-800-250-25-56** (с 9 до 22).\n    *   Не давай медицинских консультаций. При вопросах о лечении или здоровье направляй к врачу.\n\n**Твои правила общения и оформления:**\n*   Отвечай кратко, ясно, по-русски. Будь готовым помочь.\n*   **Не выдумывай.** Если не знаешь ответа или вопрос не о продукте/заказе, вежливо направь на горячую линию.\n*   **Используй Markdown для читаемости:** выделяй **жирным** ключевые термины и цены, применяй списки (`-`) для перечисления. Структурируй ответ.\n*   На приветствия отвечай вежливо, но сразу возвращай разговор к теме.\n*   На вопросы об истории диалога — кратко суммируй основные темы. **Важно:** Не придумывай себе имя. Отвечай просто как 'ассистент магазина НатуралМаг."
}
];

// 3. Добавляем историю диалога, если она есть
// Важно: API ожидает строгий формат сообщений. Мы фильтруем и проверяем историю.
if (Array.isArray(history) && history.length > 0) {
    // Проходим по истории и добавляем только сообщения с правильной структурой
    history.forEach(msg => {
        // Проверяем, что сообщение имеет ожидаемую структуру для API Chat Completions
        if (msg && typeof msg === 'object' && msg.content && msg.role && (msg.role === 'user' || msg.role === 'assistant')) {
            // Безопасно добавляем в массив messages
            messages.push({
                role: msg.role,
                content: String(msg.content) // Убеждаемся, что content - строка
            });
        }
    });
    console.log(`Added ${messages.length - 1} messages from history to context.`);
}

// 4. Добавляем текущий вопрос пользователя как последнее сообщение
messages.push({
    "role": "user",
    "content": question
});

// ===== ЗАЩИТА ОТ СЛИШКОМ ДЛИННОГО КОНТЕКСТА =====
// Оптимальное значение для большинства моделей
const MAX_CONTEXT_MESSAGES = 12; // Уменьшено с 20 для безопасности

// Обрезаем только если сообщений слишком много
if (messages.length > MAX_CONTEXT_MESSAGES) {
    // System-сообщение всегда должно оставаться первым
    const systemMessage = messages[0];
    
    // Получаем последние N-1 сообщений (N = MAX_CONTEXT_MESSAGES)
    // -1 потому что systemMessage уже есть
    const recentMessages = messages.slice(-(MAX_CONTEXT_MESSAGES - 1));
    
    // Собираем новый массив: systemMessage + последние сообщения
    messages = [systemMessage, ...recentMessages];
    
    console.log(`Context truncated from ${messages.length + recentMessages.length - 1} to ${messages.length} messages.`);
}
// ===== КОНЕЦ БЛОКА ЗАЩИТЫ =====
            
try {
    // 5. Отправляем запрос в Chutes API с полной историей контекста
    const chutesResponse = await fetch(CHUTES_API_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${CHUTES_API_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "NousResearch/Hermes-4-14B",
            "messages": messages, // Теперь messages содержит system + история + текущий вопрос
            "stream": false,
            "max_tokens": 800,
            "temperature": 0.7
        })
    });

    if (!chutesResponse.ok) {
        const errorText = await chutesResponse.text();
        console.error(`Chutes API error (${chutesResponse.status}):`, errorText);
        throw new Error(`Ошибка AI-сервиса: ${chutesResponse.status}`);
    }

    const chutesData = await chutesResponse.json();
    console.log('Chutes API response received with context.');

    // 6. Извлекаем текст ответа из структуры API
    const aiAnswer = chutesData.choices?.[0]?.message?.content || "Не удалось получить ответ от AI.";

    // 7. Возвращаем ответ на фронтенд
    return res.status(200).json({
        answer: aiAnswer,
        receivedQuestion: question,
        source: 'chutes-llm-api'
    });

} catch (chutesError) {
    console.error('Error calling Chutes LLM API:', {
        error: chutesError.message,
        stack: chutesError.stack,
        requestData: { // Безопасно логируем структуру запроса
            messagesCount: messages.length,
            lastMessage: messages[messages.length-1]?.content?.substring(0, 100)
        }
    });
    
    return res.status(200).json({
        answer: `Извините, возникла техническая ошибка при обработке сложного запроса. Пожалуйста, задайте ваш вопрос по-другому или свяжитесь с нами по телефону 8-800-250-25-56.`,
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
