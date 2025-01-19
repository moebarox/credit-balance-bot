function removeMemberHandler(ctxMessage: TelegramMessage) {
  const groupId = ctxMessage.chat.id;
  const text = Bot.getMessage_(ctxMessage.text);
  const matcher = text.match(/^(?<key>\w+) (?<users>.+)$/i);

  // Error invalid format
  if (!matcher) {
    Bot.sendMessage(groupId, COMMAND_HELP['removemember'], {
      parse_mode: 'MarkdownV2',
    });
    return;
  }

  const { key, users } = matcher.groups!;

  const billings = Credit.listBillingWithMembers({ groupId, key });
  if (billings.length === 0) {
    Bot.sendMessage(
      groupId,
      `aku tidak manggih kata kunci \`${key}\` yang elu cari :\\(`,
      { parse_mode: 'MarkdownV2' }
    );
    return;
  }

  // Error permission denied
  const billing = billings[0];
  if (String(ctxMessage.from.id) !== String(billing.adminId)) {
    Bot.sendMessage(groupId, 'punten ari didinya saha? dulur lain');
    return;
  }

  const usernames = users
    .split(' ')
    .filter(Boolean)
    .map((u) => u.replace('@', ''));

  const members = billing.members!.filter((m: BillingMember) =>
    usernames.includes(m.username)
  );

  Credit.deleteMembers(members);

  const userBalance = Credit.generateUserBalance(members);
  Bot.sendMessage(groupId, [
    'berhasil ngahapus member dengan sisa saldo:',
    '---',
    userBalance.join('\n'),
  ]);
}

globalThis.removeMemberHandler = removeMemberHandler;
