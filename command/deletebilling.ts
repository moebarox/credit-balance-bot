function deleteBillingHandler(ctxMessage: TelegramMessage) {
  const groupId = ctxMessage.chat.id;
  const text = getMessage_(ctxMessage.text);
  const matcher = text.match(/^(?<key>\w+)$/i);

  // Error invalid format
  if (!matcher) {
    sendMessage(groupId, COMMAND_HELP['deletebilling'], {
      parse_mode: 'MarkdownV2',
    });
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

  const billing = billings[0];

  // Error permission denied
  if (String(ctxMessage.from.id) !== String(billing.adminId)) {
    sendMessage(groupId, 'punten ari didinya saha? dulur lain');
    return;
  }

  dbDeleteMany('billings', {
    _id: { $oid: billing._id },
  });

  dbDeleteMany('members', {
    billingId: { $oid: billing._id },
  });

  sendMessage(groupId, [
    'parantos dihapus mamangque :(',
    'tapi jang jaga-jaga, ieu saldo terakhir nya',
  ]);

  const message = generateCreditBalance(billing, billing.members!);
  sendMessage(groupId, message);
}
