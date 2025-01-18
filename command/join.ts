function joinHandler(ctxMessage: TelegramMessage) {
  const groupId = ctxMessage.chat.id;
  const username = ctxMessage.from.username;
  const text = getMessage_(ctxMessage.text);
  const matcher = text.match(/^(?<key>\w+)$/i);

  // Error invalid format
  if (!matcher) {
    sendMessage(groupId, COMMAND_HELP['join'], { parse_mode: 'MarkdownV2' });
    return;
  }

  const { key } = matcher.groups!;

  const billings = listBillingWithMembers({ groupId, key });
  if (billings.length === 0) {
    sendMessage(
      groupId,
      `aku tidak manggih kata kunci \`${key}\` yang elu cari :\\(`,
      { parse_mode: 'MarkdownV2' }
    );
    return;
  }

  // Check if already joined
  const billing = billings[0];
  const isMember = billing.members!.some(
    (m: BillingMember) => m.username === username
  );
  if (isMember) {
    sendMessage(groupId, 'didinya sudah pernah join bosque :(');
    return;
  }

  dbInsertOne('members', {
    billingId: { $oid: billing._id },
    username,
    balance: 0,
  });
  sendMessage(groupId, 'berhasil join mamangque :D');
}
