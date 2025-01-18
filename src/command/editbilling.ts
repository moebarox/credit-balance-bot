function editBillingHandler(ctxMessage: TelegramMessage) {
  const groupId = ctxMessage.chat.id;
  const text = Bot.getMessage_(ctxMessage.text);
  const matcher = text.match(
    /^(?<key>\w+) (?<billingDate>\d+) (?<billingAmount>\d+)$/i
  );

  // Error invalid format
  if (!matcher) {
    Bot.sendMessage(groupId, COMMAND_HELP['editbilling'], {
      parse_mode: 'MarkdownV2',
    });
    return;
  }

  const { key, billingDate, billingAmount } = matcher.groups!;

  const billing = Credit.getBilling(groupId, key);
  if (!billing) {
    Bot.sendMessage(
      groupId,
      `aku tidak manggih kata kunci \`${key}\` yang elu cari :\\(`,
      { parse_mode: 'MarkdownV2' }
    );
    return;
  }

  // Error permission denied
  if (String(ctxMessage.from.id) !== String(billing.adminId)) {
    Bot.sendMessage(groupId, 'punten ari didinya saha? dulur lain');
    return;
  }

  MongoDB.updateOne(
    'billings',
    {
      key,
      groupId: {
        $numberLong: String(groupId),
      },
    },
    {
      key,
      billingDate: Number(billingDate),
      billingAmount: Number(billingAmount),
      adminId: ctxMessage.from.id,
      groupId: {
        $numberLong: String(groupId),
      },
    }
  );

  Bot.sendMessage(groupId, 'sudah diedit mamangque :D');
}

globalThis.editBillingHandler = editBillingHandler;
