function removeMemberHandler(ctxMessage) {
  const groupId = ctxMessage.chat.id;
  const text = getMessage_(ctxMessage.text);
  const matcher = text.match(/^(?<key>\w+) (?<users>.+)$/i);

  // Error invalid format
  if (!matcher) {
    sendMessage(
      groupId,
      [
        "format salah bosque, kuduna kieu",
        "`/removemember [key] [username (bisa lebih dari satu)]`",
      ],
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  const { key, users } = matcher.groups;

  const billing = getBilling(groupId, key);
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

  const usernames = users
    .split(" ")
    .filter(Boolean)
    .map((u) => u.replace("@", ""));

  const members = dbFind("members", {
    billingId: { $oid: billing._id },
    username: { $in: usernames },
  });

  try {
    dbDeleteMany("members", {
      username: { $in: members.map((m) => m.username) },
    });

    const userBalance = generateUserBalance(members);
    sendMessage(groupId, [
      "berhasil ngahapus member dengan sisa saldo:",
      "---",
      userBalance.join("\n"),
    ]);
  } catch (err) {
    console.error(err);
    sendMessage(groupId, "lieur otak aing :(");
  }
}
