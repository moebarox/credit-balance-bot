function showBalanceHandler(ctxMessage) {
  const groupId = ctxMessage.chat.id;
  const text = getMessage_(ctxMessage.text);
  const matcher = text.match(/^(?<key>\w+)$/i);

  // Print all credit balance within the current group
  if (!text) {
    const billings = listBillings_(groupId);
    billings.forEach((billing) => {
      const members = listMembers_(billing._id);
      const message = generateCreditBalance_(billing, members);

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
  const billing = getBilling_(groupId, key);

  // Error not found
  if (!billing) {
    sendMessage(
      groupId,
      `aku tidak manggih kata kunci \`${key}\` yang elu cari :\\(`,
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  const members = listMembers_(billing._id);
  const message = generateCreditBalance_(billing, members);
  sendMessage(groupId, message);
}
