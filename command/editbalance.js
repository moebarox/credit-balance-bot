function editBalanceHandler(ctxMessage) {
  const groupId = ctxMessage.chat.id;
  const text = getMessage_(ctxMessage.text);
  const matcher = text.match(
    /^(?<key>\w+) (?<users>.+) (?<amount>(?:\+|-)?\d+)$/i
  );

  // Error invalid format
  if (!matcher) {
    sendMessage(groupId, COMMAND_HELP["editbalance"], {
      parse_mode: "MarkdownV2",
    });
    return;
  }

  const { key, users, amount } = matcher.groups;
  const billing = getBilling(groupId, key);

  // Error not found
  if (!billing) {
    sendMessage(
      groupId,
      `aku tidak manggih kata kunci \`${key}\` yang elu cari :\\(`,
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  // Error permission denied
  if (String(ctxMessage.from.id) !== String(billing.adminId)) {
    sendMessage(groupId, "punten ari didinya saha? dulur lain");
    return;
  }

  const { success, failed } = updateBalance(
    billing,
    users.split(" ").filter(Boolean),
    Number(amount)
  );

  if (failed.length) {
    const usernames = failed.map((u) => u.username);
    sendMessage(groupId, `*${usernames.join(", ")}* saha aisia, teu kenal`, {
      parse_mode: "MarkdownV2",
    });
  }

  if (success.length) {
    const userBalance = generateUserBalance(success);
    sendMessage(groupId, [
      `saldo ${key} beres diubah`,
      "---",
      userBalance.join("\n"),
      "---",
      "mun saldona teu berubah jigana aya nu salah",
    ]);
  }
}
