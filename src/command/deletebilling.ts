function deleteBillingHandler(ctxMessage: TelegramMessage) {
  const groupId = ctxMessage.chat.id;
  const text = Bot.getMessage_(ctxMessage.text);
  const matcher = text.match(/^(?<key>\w+)$/i);

  // Error invalid format
  if (!matcher) {
    Bot.sendMessage(groupId, COMMAND_HELP['deletebilling'], {
      parse_mode: 'MarkdownV2',
    });
    return;
  }

  const { key } = matcher.groups!;

  const billings = Credit.listBillingWithMembers({ groupId, key });
  if (billings.length === 0) {
    Bot.sendMessage(
      groupId,
      `aku tidak manggih kata kunci \`${key}\` yang elu cari :\\(`,
      { parse_mode: 'MarkdownV2' }
    );
    return;
  }

  const billing = billings[0];

  // Error permission denied
  if (String(ctxMessage.from.id) !== String(billing.adminId)) {
    Bot.sendMessage(groupId, 'punten ari didinya saha? dulur lain');
    return;
  }

  MongoDB.deleteMany('billings', {
    _id: { $oid: billing._id },
  });

  MongoDB.deleteMany('members', {
    billingId: { $oid: billing._id },
  });

  Bot.sendMessage(groupId, [
    'parantos dihapus mamangque :(',
    'tapi jang jaga-jaga, ieu saldo terakhir nya',
  ]);

  const message = Credit.generateCreditBalance(billing, billing.members!);
  Bot.sendMessage(groupId, message);
}

globalThis.deleteBillingHandler = deleteBillingHandler;
