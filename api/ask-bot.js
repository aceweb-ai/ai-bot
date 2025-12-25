// Файл: api/ask-bot.js
export default async function handler(request, response) {
  // 1. Настраиваем CORS (Critical!). Разрешаем запросы с любых доменов (*).
  // Позже можно заменить на домен вашего сайта.
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 2. Если метод OPTIONS (пре-запрос браузера), сразу отвечаем "ОК"
  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  // 3. Работаем только с POST-запросами
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Используйте метод POST' });
  }

  try {
    // 4. Парсим JSON из тела запроса, который пришел с фронтенда
    const { question } = await request.json();
    console.log('Бэкенд получил вопрос:', question); // Для отладки в логах Vercel

    // 5. ИСКУССТВЕННЫЙ ОТВЕТ. Позже здесь будет запрос к Chutes.
    const mockAnswer = `[Это тестовый ответ от бэкенда на Vercel]. Я получил ваш вопрос: "${question}". Когда вы подключите AI-модель, я дам содержательный ответ.`;

    // 6. Отправляем JSON-ответ обратно на фронтенд
    return response.status(200).json({
      answer: mockAnswer,
      receivedQuestion: question // Отправляем назад для наглядности
    });

  } catch (error) {
    console.error('Ошибка в бэкенде:', error);
    return response.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}
