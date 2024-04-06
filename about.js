function aboutHandler(message) {
  sendMessage(message.chat.id, [
    "About this room:"`ID: ${message.chat.id}`,
    `Title: ${message.chat.title}`,
    `Type: ${message.chat.type}`,
    "---",
    "About user:",
    `ID: ${message.from.id}`,
    `Name: ${[message.from.first_name, message.from.last_name]
      .filter(Boolean)
      .join(" ")}`,
    `Username: ${message.from.username}`,
  ]);
}
