function showBalanceHandler(ctxMessage) {
  const groupId = ctxMessage.chat.id;
  const text = getMessage_(ctxMessage.text);
  const matcher = text.match(/^(?<key>\w+)$/i);

  // Print all credit balance within the current group
  if (!text) {
    const billings = listBillingWithMembers({ groupId });
    billings.forEach((billing) => {
      const message = generateCreditBalance(billing, billing.billingMembers);
      sendMessage(groupId, message);
    });
    return;
  }

  // Error invalid format
  if (!matcher) {
    sendMessage(
      groupId,
      ["format salah bosque, kuduna kieu", "`/showbalance [key]`"],
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  const { key } = matcher.groups;
  const billings = listBillingWithMembers({ groupId, key });

  // Error not found
  if (billings.length === 0) {
    sendMessage(
      groupId,
      `aku tidak manggih kata kunci \`${key}\` yang elu cari :\\(`,
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  const message = generateCreditBalance(
    billings[0],
    billings[0].billingMembers
  );
  sendMessage(groupId, message);
}
