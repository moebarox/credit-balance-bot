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

  const billings = Billing.listBillingWithMembers({ groupId, key });
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

  Billing.deleteBilling(billing._id as string);

  const userBalance = Billing.generateUserBalance(billing.members!);
  Bot.sendMessage(groupId, [
    `billing \`${key}\` parantos dihapus mamangque :\\(`,
    'tapi jang jaga-jaga, ieu saldo terakhir nya',
    '---',
    userBalance.join('\n'),
    '---',
  ]);
}

globalThis.deleteBillingHandler = deleteBillingHandler;
