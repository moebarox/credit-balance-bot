function newBillingHandler(ctxMessage) {
  const groupId = ctxMessage.chat.id;
  const text = getMessage_(ctxMessage.text);
  const matcher = text.match(
    /^(?<key>\w+) (?<billingDate>\d+) (?<billingAmount>\d+)$/i
  );

  // Error invalid format
  if (!matcher) {
    sendMessage(
      groupId,
      [
        "format salah bosque, kuduna kieu",
        "`/newbilling [key] [billingDate] [billingAmount]`",
      ],
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  const { key, billingDate, billingAmount } = matcher.groups;

  // Check if already created
  const result = dbFindOne("billings", { key, groupId });
  if (result) {
    sendMessage(
      groupId,
      `kata kunci \`${key}\` sudah ada bosque, jangan buat yang sama ya, da bageur :\\(`,
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  try {
    const id = dbInsertOne("billings", {
      groupId,
      key,
      billingDate: Number(billingDate),
      billingAmount: Number(billingAmount),
      adminId: ctxMessage.from.id,
    });

    dbInsertOne("members", {
      billingId: { $oid: id },
      username: ctxMessage.from.username,
      balance: 0,
    });

    sendMessage(groupId, "sudah jadi mamangque :D");
  } catch (err) {
    console.error(err);
    sendMessage(groupId, "lieur otak aing :(");
  }
}
