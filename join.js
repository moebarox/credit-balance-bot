function getCredit_(groupId, key) {
  return dbFindOne("credits", { groupId, key });
}

function joinHandler(message) {
  const groupId = message.chat.id;
  const username = message.from.username;
  const text = getMessage_(message.text);
  const matcher = text.match(/^(?<key>\w+)$/i);

  // Error invalid format
  if (!matcher) {
    sendMessage(
      groupId,
      "format salah bosque, kuduna kieu\n`/create [key] [billingDate] [billingAmount]`",
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  const { key } = matcher.groups;

  // Get credit config
  let credit;
  try {
    credit = getCredit_(groupId, key);
  } catch (err) {
    console.error(err);
    sendMessage(
      groupId,
      `aku tidak manggih kata kunci \`${key}\` yang elu cari :(`,
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  // Check if already joined
  try {
    const result = dbFindOne("members", {
      creditId: { $oid: credit._id },
      username,
    });
    if (result) {
      sendMessage(groupId, "sudah join bosque :(");
      return;
    }
  } catch (err) {}

  try {
    dbInsertOne("members", {
      creditId: { $oid: credit._id },
      username,
      name: [message.from.first_name, message.from.last_name].join(" "),
      userId: message.from.id,
      balance: 0,
    });
    sendMessage(groupId, "berhasil join mamangque :D");
  } catch (err) {
    console.error(err);
    sendMessage(groupId, "lieur otak aing :(");
  }
}
