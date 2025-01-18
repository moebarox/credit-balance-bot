function editBalanceHandler(ctxMessage: TelegramMessage) {
  const groupId = ctxMessage.chat.id;
  const text = Bot.getMessage_(ctxMessage.text);
  const matcher = text.match(
    /^(?<key>\w+) (?<users>.+) (?<amount>(?:\+|-)?\d+)$/i
  );

  // Error invalid format
  if (!matcher) {
    Bot.sendMessage(groupId, COMMAND_HELP['editbalance'], {
      parse_mode: 'MarkdownV2',
    });
    return;
  }

  const { key, users, amount } = matcher.groups!;
  const billing = Credit.getBilling(groupId, key);

  // Error not found
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

  const { success, failed } = Credit.updateBalance(
    billing,
    users.split(' ').filter(Boolean),
    Number(amount)
  );

  if (failed.length) {
    const usernames = failed.map((u) => u.username);
    Bot.sendMessage(
      groupId,
      `*${usernames.join(', ')}* saha aisia, teu kenal`,
      {
        parse_mode: 'MarkdownV2',
      }
    );
  }

  if (success.length) {
    const userBalance = Credit.generateUserBalance(success);
    Bot.sendMessage(groupId, [
      `saldo ${key} beres diubah`,
      '---',
      userBalance.join('\n'),
      '---',
      'mun saldona teu berubah jigana aya nu salah',
    ]);
  }
}

globalThis.editBalanceHandler = editBalanceHandler;
