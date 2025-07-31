const translations = {
  en: {
    // --- PAY ---
    pay_description: 'Transfer points to another user',
    pay_user_option: 'The user to transfer points to',
    pay_amount_option: 'Amount of points to transfer',
    error_bot: 'You cannot transfer points to bots.',
    error_self: 'You cannot transfer points to yourself.',
    error_amount: 'Enter a valid amount (greater than 0).',
    error_balance: 'You do not have enough points.',
    success: (amount, userId) => `You sent ${amount} points to <@${userId}>.`,

    // --- ADDPOINTS ---
    addpoints_error_negative: 'Cannot give a negative number of points.',
    addpoints_success: (amount, userId, total) => `You gave ${amount} points to <@${userId}>. They now have ${total} points.`,
    addpoints_error_unknown: 'An error occurred while trying to give points.',
  },

  ru: {
    // --- PAY ---
    pay_description: 'Передать поинты другому участнику',
    pay_user_option: 'Кому вы хотите передать поинты',
    pay_amount_option: 'Сколько поинтов передать',
    error_bot: 'Вы не можете передавать поинты ботам.',
    error_self: 'Нельзя передавать поинты самому себе.',
    error_amount: 'Введите корректное количество поинтов (больше 0).',
    error_balance: 'У вас недостаточно поинтов.',
    success: (amount, userId) => `Вы успешно передали ${amount} поинтов <@${userId}>.`,

    // --- ADDPOINTS ---
    addpoints_error_negative: 'Нельзя выдать отрицательное количество поинтов.',
    addpoints_success: (amount, userId, total) => `Вы успешно выдали ${amount} поинтов <@${userId}>. Теперь у него ${total} поинтов.`,
    addpoints_error_unknown: 'Произошла ошибка при попытке выдать поинты.',
  },
};

function t(locale, key, ...args) {
  // Если локаль с суффиксом, например 'en-US', берем только 'en'
  const baseLocale = locale.split('-')[0];

  // Выбираем локаль — если нет, то 'en' по умолчанию
  const lang = translations[locale]
    ? locale
    : translations[baseLocale]
    ? baseLocale
    : 'en';

  const value = translations[lang][key];
  return typeof value === 'function' ? value(...args) : value;
}

module.exports = { t };