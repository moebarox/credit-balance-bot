function newBillingHandler(ctxMessage) {
  const groupId = ctxMessage.chat.id;
  const text = getMessage_(ctxMessage.text);
  const matcher = text.match(
    /^(?<key>\w+) (?<billingDate>\d+) (?<billingAmount>\d+)$/i
  );

  // Error invalid room
  if (!["group", "supergroup"].includes(ctxMessage.chat.type)) {
    sendMessage(groupId, "hanya bisa di group bosque :\\(", {
      parse_mode: "MarkdownV2",
    });
    return;
  }

  if (!matcher) {
    // Error invalid format
    sendMessage(groupId, COMMAND_HELP["newbilling"], {
      parse_mode: "MarkdownV2",
    });
    return;
  }

  const { key, billingDate, billingAmount } = matcher.groups;

  // Check if already created
  const billing = getBilling(groupId, key);
  if (billing) {
    sendMessage(
      groupId,
      `kata kunci \`${key}\` sudah ada bosque, jangan buat yang sama ya, da bageur :\\(`,
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  const id = dbInsertOne("billings", {
    key,
    billingDate: Number(billingDate),
    billingAmount: Number(billingAmount),
    adminId: ctxMessage.from.id,
    groupId: {
      $numberLong: String(groupId),
    },
  });

  dbInsertOne("members", {
    billingId: { $oid: id },
    username: ctxMessage.from.username,
    balance: 0,
  });

  sendMessage(
    groupId,
    [
      "sudah jadi mamangque :D",
      `yang mau gabung tinggal kirim command \`/join ${key}\``,
    ],
    { parse_mode: "MarkdownV2" }
  );
}
