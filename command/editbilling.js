function editBillingHandler(ctxMessage) {
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
        "`/editbilling [key] [newBillingDate] [newBillingAmount]`",
      ],
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  const { key, billingDate, billingAmount } = matcher.groups;

  const billing = getBilling(groupId, key);
  if (!billing) {
    sendMessage(
      groupId,
      `aku tidak manggih kata kunci \`${key}\` yang elu cari :\\(`,
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  // Error permission denied
  if (String(ctxMessage.from.id) !== String(billing.adminId)) {
    sendMessage(groupId, "punten ari didinya saha? dulur lain");
    return;
  }

  dbUpdateOne(
    "billings",
    {
      groupId,
      key,
    },
    {
      billingDate: Number(billingDate),
      billingAmount: Number(billingAmount),
    }
  );

  sendMessage(groupId, "sudah diedit mamangque :D");
}
