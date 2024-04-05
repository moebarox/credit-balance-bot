function aboutHandler(message) {
  sendMessage(
    message.chat.id,
    "ID: " +
      message.chat.id +
      "\nTitle: " +
      message.chat.title +
      "\nType: " +
      message.chat.type
  );
}
