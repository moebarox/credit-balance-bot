function showBalanceHandler(ctxMessage: TelegramMessage) {
  const groupId = ctxMessage.chat.id;
  const text = Bot.getMessage(ctxMessage.text);
  const matcher = text.match(/^(?<key>\w+)$/i);

  // Print all credit balance within the current group
  if (!text) {
    const billings = Billing.listBillingWithMembers({ groupId });
    billings.forEach((billing: Billing) => {
      const message = Billing.generateBalanceMessage(billing, billing.members!);
      Bot.sendMessage(groupId, message);
    });
    return;
  }

  // Error invalid format
  if (!matcher) {
    Bot.sendMessage(groupId, COMMAND_HELP['showbalance'], {
      parse_mode: 'MarkdownV2',
    });
    return;
  }

  const { key } = matcher.groups!;
  const billings = Billing.listBillingWithMembers({ groupId, key });

  // Error not found
  if (billings.length === 0) {
    Bot.sendMessage(
      groupId,
      `aku tidak manggih kata kunci \`${key}\` yang elu cari :\\(`,
      { parse_mode: 'MarkdownV2' }
    );
    return;
  }

  const message = Billing.generateBalanceMessage(
    billings[0],
    billings[0].members!
  );
  Bot.sendMessage(groupId, message);
}

globalThis.showBalanceHandler = showBalanceHandler;
