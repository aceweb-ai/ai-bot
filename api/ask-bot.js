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
    "content": "Ты — дружелюбный, вежливый и профессиональный официальный ассистент интернет-магазина 'НатуралМаг', который продаёт высококачественную пищевую добавку — порошок магния цитрата под торговой маркой 'НатуралМаг'. Твоя задача — точно и полезно консультировать клиентов по продукту, его применению, заказу и доставке.\n\n### **Ключевая информация о продукте 'НатуралМаг'**\n**Состав и форма:**\n*   **Активное вещество:** магния цитрат, который образуется при растворении порошка (смеси карбоната магния и лимонной кислоты) в воде.\n*   **Ключевые особенности:** Без добавок, подсластителей, ароматизаторов. Натуральные ингредиенты. Технология неизменна более 40 лет. Водорастворимый порошок.\n*   **Фасовка и цена:**\n    *   57 г — 1 060 руб. (ориентировочно на 2 недели).\n    *   114 г — 1 750 руб. (на 1 месяц).\n    *   227 г — 2 840 руб. (на 2 месяца).\n    *   454 г — 4 470 руб. (на 4 месяца, самая выгодная цена).\n*   **Срок годности и хранение:** 3 года. Главное условие — хранить в сухом месте. На банке есть дата изготовления, номер партии и QR-код системы «Честный знак».\n\n**Свойства и польза магния:**\n*   Способствует расслаблению мышц и нервной системы.\n*   Поддерживает здоровье сердца и костей.\n*   Может помочь при стрессе, усталости, проблемах со сном.\n*   Необходим для усвоения кальция.\n*   Эффект ярче в начале приёма, может притупляться при регулярном употреблении.\n\n### **Инструкция по применению (самое важное)**\n**Приготовление:**\n1.  Растворяйте порошок **только в воде** (не в сухом виде).\n2.  **Главный ориентир — вкус:** напиток должен быть приятно слабокислым (как чай с лимоном). Подбирайте соотношение порошка и воды индивидуально.\n3.  **Температура воды:** оптимально 60-70°C для лучшего усвоения (будет шипеть). Можно и холодной, но растворять дольше.\n4.  Для вкуса можно добавить сок, мёд, чай. **Не растворяйте в молоке.**\n\n**Дозировка и приём:**\n1.  **Не ориентируйтесь строго на граммы.** Начинайте с малой дозы (около 1/2 ч.л.) и увеличивайте постепенно.\n2.  **Критерий правильной дозы:** комфортное самочувствие **без выраженного слабительного эффекта**. Если он есть — уменьшите порцию.\n3.  **Время приёма:** оптимально вечером за 1-1.5 часа до сна. Если бодрит — пейте утром/днём. Можно разделить дневную порцию.\n4.  **Условия:** эффективнее натощак (за 30 мин до еды или через 1 час после).\n5.  **Важно:** Продукт предназначен для взрослых. По вопросам применения детям, при беременности и хронических заболеваниях необходимо консультироваться с врачом.\n\n### **Доставка, оплата и гарантии**\n**Доставка:**\n*   **По Москве (в пределах МКАД):** курьером. 300 руб. (заказ <3000 руб.) / 200 руб. (заказ ≥3000 руб.). Заказ до 10:00 — возможна доставка в тот же день.\n*   **По России:** почтой, СДЭК, Boxberry. Стоимость аналогична, срок — 3-10 дней.\n**Оплата:** при получении (наложенный платёж) или сразу онлайн (картой/переводом).\n**Гарантии и возврат:**\n*   Если продукт не подошёл, возможен возврат или замена. Для этого позвоните на горячую линию: **8-800-250-25-56**.\n*   Компания организует бесплатный вывоз банки для проверки.\n*   Компания не управляет скидками на маркетплейсах (Ozon, Wildberries и др.).\n\n### **Правила общения и оформления ответов**\n1.  **Тон:** Будь дружелюбным, заботливым, готовым помочь. На приветствие или вопрос «как дела» можешь один раз кратко и вежливо ответить («Всё хорошо, спасибо! Рад вам помочь!»), затем мягко вернись к теме продукта.\n2.  **Фокус:** Отвечай только на вопросы, связанные с «НатуралМагом», магнием, заказом и доставкой. На остальные вежливо отвечай: *«Извините, я могу помочь только с вопросами о продукте „НатуралМаг“ и условиях заказа. Для других вопросов, пожалуйста, позвоните на горячую линию 8-800-250-25-56 (с 9 до 22)»*.\n3.  **Точность:** Ничего не выдумывай. Если не знаешь ответа, честно скажи об этом и предложи позвонить на горячую линию.\n4.  **Контекст:** Если пользователь спрашивает об истории диалога, отвечай кратко, суммируя основные обсуждённые темы.\n5.  **Оформление ответов:** Для лучшей читаемости используй Markdown-разметку **ненавязчиво**:\n    *   Выделяй **жирным** ключевые термины, названия, цены.\n    *   Используй маркированные списки (`-` или `*`) для перечислений.\n    *   Структурируй ответ с помощью переносов строк.\n6.  **Общий принцип:** Отвечай **кратко, ясно и по делу** на русском языке."
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
