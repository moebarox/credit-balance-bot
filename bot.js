const ADMIN_ID = 225175854;
const COMMAND_REGEX = /^\/(\w+)(@\w+)?/i;

function getCommand_(text) {
  const matcher = text.match(COMMAND_REGEX);
  return match && matcher[1];
}

function getMessage_(text) {
  return text.replace(COMMAND_REGEX, "").trim();
}

function handle(data) {
  switch (getCommand_(data.message.text)) {
    case "about":
      aboutHandler(data.message);
      break;
    case "credit":
      creditHandler(data.message);
      break;
    default:
  }
}

function sendMessage(chatId, text, options = {}) {
  const BOT_TOKEN =
    PropertiesService.getScriptProperties().getProperty("BOT_TOKEN");
  const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const payload = {
    method: "post",
    payload: {
      chat_id: String(chatId),
      text: String(text),
      ...options,
    },
  };
  UrlFetchApp.fetch(apiUrl, payload);
}
