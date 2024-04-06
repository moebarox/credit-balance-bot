function createHandler(message) {
  const groupId = message.chat.id;
  const text = getMessage_(message.text);
  const matcher = text.match(
    /^(?<key>\w+) (?<billingDate>\d+) (?<billingAmount>\d+)$/i
  );

  // Error invalid format
  if (!matcher) {
    sendMessage(
      groupId,
      "format salah bosque, kuduna kieu\n`/create [key] [billingDate] [billingAmount]`",
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  const { key, billingDate, billingAmount } = matcher.groups;

  // Check if already created
  try {
    const result = dbFindOne("credits", { key, groupId });
    if (result) {
      sendMessage(
        groupId,
        `kata kunci \`${key}\` sudah ada bosque, jangan buat yang sama ya, da bageur :(`,
        { parse_mode: "MarkdownV2" }
      );
      return;
    }
  } catch (err) {}

  try {
    dbInsertOne("credits", {
      groupId,
      key,
      billingDate,
      billingAmount,
    });
    sendMessage(groupId, "sudah jadi mamangque :D");
  } catch (err) {
    console.error(err);
    sendMessage(groupId, "lieur otak aing :(");
  }
}
