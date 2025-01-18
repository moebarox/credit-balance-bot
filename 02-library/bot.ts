const COMMAND_REGEX = /^\/(\w+)(@\w+)?/i;

function getCommand_(text: string): string {
  const matcher = text.match(COMMAND_REGEX);
  return matcher?.[1] ?? '';
}

function getMessage_(text: string): string {
  return text.replace(COMMAND_REGEX, "").trim();
}

function sendMessage(chatId, message, payloadOptions = {}) {
  const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  try {
    let text = message;
    if (Array.isArray(message)) {
      text = message.join("\n");
    }

    const options = {
      method: "post" as GoogleAppsScript.URL_Fetch.HttpMethod,
      payload: {
        chat_id: String(chatId),
        text: String(text),
        ...payloadOptions,
      },
    };
    UrlFetchApp.fetch(apiUrl, options);
  } catch (err) {
    if (!BOT_ADMIN_ID) {
      return;
    }

    UrlFetchApp.fetch(apiUrl, {
      method: "post",
      payload: {
        chat_id: BOT_ADMIN_ID,
        text: err.message,
      },
    });
  }
}
