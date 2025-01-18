function addMemberHandler(ctxMessage: TelegramMessage) {
  const groupId = ctxMessage.chat.id;
  const text = getMessage_(ctxMessage.text);
  const matcher = text.match(/^(?<key>\w+) (?<users>.+)$/i);

  // Error invalid format
  if (!matcher) {
    sendMessage(groupId, COMMAND_HELP["addmember"], {
      parse_mode: "MarkdownV2",
    });
    return;
  }

  const { key, users } = matcher.groups;

  const billings = listBillingWithMembers({ groupId, key });
  if (billings.length === 0) {
    sendMessage(
      groupId,
      `aku tidak manggih kata kunci \`${key}\` yang elu cari :\\(`,
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  // Error permission denied
  const billing = billings[0];
  if (String(ctxMessage.from.id) !== String(billing.adminId)) {
    sendMessage(groupId, "punten ari didinya saha? dulur lain");
    return;
  }

  const usernames = users
    .split(" ")
    .filter(Boolean)
    .map((u) => u.replace("@", ""));

  const members = billing.billingMembers.filter((m) =>
    usernames.includes(m.username)
  );

  const payload = usernames.reduce((acc, username) => {
    const isMember = members.some((m) => m.username === username);
    if (isMember) {
      return acc;
    }

    return [
      ...acc,
      {
        billingId: { $oid: billing._id },
        username,
        balance: 0,
      },
    ];
  }, []);

  dbInsertMany("members", payload);
  sendMessage(groupId, "berhasil join mamangque :D");
}
