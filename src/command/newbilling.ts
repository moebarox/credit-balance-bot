function newBillingHandler(ctxMessage: TelegramMessage) {
  const groupId = ctxMessage.chat.id;
  const text = Bot.getMessage_(ctxMessage.text);
  const matcher = text.match(
    /^(?<key>\w+) (?<billingDate>\d+) (?<billingAmount>\d+)$/i
  );

  // Error invalid room
  if (!['group', 'supergroup'].includes(ctxMessage.chat.type)) {
    Bot.sendMessage(groupId, 'hanya bisa di group bosque :\\(', {
      parse_mode: 'MarkdownV2',
    });
    return;
  }

  if (!matcher) {
    // Error invalid format
    Bot.sendMessage(groupId, COMMAND_HELP['newbilling'], {
      parse_mode: 'MarkdownV2',
    });
    return;
  }

  const { key, billingDate, billingAmount } = matcher.groups!;

  // Check if already created
  const billing = Billing.getBilling(groupId, key);
  if (billing) {
    Bot.sendMessage(
      groupId,
      `kata kunci \`${key}\` sudah ada bosque, jangan buat yang sama ya, da bageur :\\(`,
      { parse_mode: 'MarkdownV2' }
    );
    return;
  }

  Billing.createBilling({
    key,
    groupId,
    billingDate: Number(billingDate),
    billingAmount: Number(billingAmount),
    adminId: ctxMessage.from.id,
    members: [
      {
        username: ctxMessage.from.username,
        balance: 0,
      },
    ],
  });

  Bot.sendMessage(
    groupId,
    [
      'sudah jadi mamangque :D',
      `yang mau gabung tinggal kirim command \`/join ${key}\``,
    ],
    { parse_mode: 'MarkdownV2' }
  );
}

globalThis.newBillingHandler = newBillingHandler;
