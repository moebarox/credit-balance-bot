function joinHandler(ctxMessage) {
  const groupId = ctxMessage.chat.id;
  const username = ctxMessage.from.username;
  const text = getMessage_(ctxMessage.text);
  const matcher = text.match(/^(?<key>\w+)$/i);

  // Error invalid format
  if (!matcher) {
    sendMessage(
      groupId,
      ["format salah bosque, kuduna kieu", "`/join [key]`"],
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  const { key } = matcher.groups;

  const billing = getBilling(groupId, key);
  if (!billing) {
    sendMessage(
      groupId,
      `aku tidak manggih kata kunci \`${key}\` yang elu cari :\\(`,
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  // Check if already joined
  const member = dbFindOne("members", {
    billingId: { $oid: billing._id },
    username,
  });
  if (member) {
    sendMessage(groupId, "sudah join bosque :(");
    return;
  }

  try {
    dbInsertOne("members", {
      billingId: { $oid: billing._id },
      username,
      balance: 0,
    });
    sendMessage(groupId, "berhasil join mamangque :D");
  } catch (err) {
    console.error(err);
    sendMessage(groupId, "lieur otak aing :(");
  }
}
