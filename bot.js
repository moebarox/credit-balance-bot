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
    case "create":
      createHandler(data.message);
      break;
    case "join":
      joinHandler(data.message);
      break;
    case "credit":
      creditHandler(data.message);
      break;
    default:
  }
}

function sendMessage(chatId, text, payloadOptions = {}) {
  const apiUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  const options = {
    method: "post",
    payload: {
      chat_id: String(chatId),
      text: String(text),
      ...payloadOptions,
    },
  };
  UrlFetchApp.fetch(apiUrl, options);
}
