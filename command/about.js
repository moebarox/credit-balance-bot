function aboutHandler(ctxMessage) {
  sendMessage(ctxMessage.chat.id, [
    "About this room:",
    `ID: ${ctxMessage.chat.id}`,
    `Title: ${ctxMessage.chat.title}`,
    `Type: ${ctxMessage.chat.type}`,
    "---",
    "About user:",
    `ID: ${ctxMessage.from.id}`,
    `Name: ${[ctxMessage.from.first_name, ctxMessage.from.last_name]
      .filter(Boolean)
      .join(" ")}`,
    `Username: ${ctxMessage.from.username}`,
  ]);
}
