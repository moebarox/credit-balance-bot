function getCreditConfig_(groupId) {
  const config = dbFindOne("configs", { key: "credit" });
  return groupId
    ? config.value.filter((c) => c.groupId === groupId)
    : config.value;
}

function updateCredit_(key, groupId, users, amount) {
  const failed = [];
  const configs = getCreditConfig_(groupId);
  const config = configs.find((c) => c.key === key);
  const credits = dbFind("credits", { creditId: { $oid: config._id } });
  const targetUser =
    users[0] === "all" ? credits.map((c) => c.username) : users;
  const foundUsers = [];

  for (let i = 0; i < targetUser.length; i += 1) {
    const username = targetUser[i].replace("@", "");
    const row = credits.find((c) => c.username === username);

    if (row) {
      foundUsers.push(username);
      dbUpdateOne(
        "credits",
        { username, creditId: { $oid: config._id } },
        { $set: { credit: Number(row.credit) + amount } }
      );
    } else {
      failed.push({ username, message: "user not found" });
    }
  }

  const success = dbFind("credits", {
    creditId: { $oid: config._id },
    username: { $in: foundUsers },
  });

  return { success, failed };
}

function generateCreditByUser_(credits) {
  return credits.map((c) => {
    return (
      "@" +
      c.username +
      ": " +
      Number(c.credit).toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      })
    );
  });
}

function creditHandler(message) {
  const groupId = message.chat.id;
  const text = getMessage_(message.text);
  const matcher = text.match(
    /^(?<key>\w+) (?<users>.+) (?<amount>(?:\+|-)?\d+)$/i
  );

  // Print all credits within the current group
  if (!text) {
    const configs = getCreditConfig_(groupId);
    configs.forEach((config) => {
      const credits = dbFind("credits", { creditId: { $oid: config._id } });
      const creditByUser = generateCreditByUser_(credits);
      const msg =
        "Saldo " +
        config.key +
        " " +
        Utilities.formatDate(new Date(), "WIB", "MMMM yyyy") +
        "\n---\n" +
        creditByUser.join("\n") +
        "\n---\nsaldo dipotong " +
        Number(config.deductAmount).toLocaleString("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }) +
        " tiap tanggal " +
        config.deductionDate;
      sendMessage(message.chat.id, msg);
    });
    return;
  }

  // Error permission denied
  if (String(message.from.id) !== String(ADMIN_ID)) {
    sendMessage(message.chat.id, "punten ari didinya saha? dulur lain");
    return;
  }

  // Error invalid format
  if (!matcher) {
    sendMessage(
      message.chat.id,
      "format salah bosque, kuduna kieu\n`/credit [key] [username (bisa lebih dari satu)] [nominal]`",
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  let { key, users, amount } = matcher.groups;
  const { success, failed } = updateCredit_(
    key,
    groupId,
    users.split(" ").filter(Boolean),
    Number(amount)
  );

  try {
    if (failed.length) {
      const usernames = failed.map((u) => u.username);
      sendMessage(
        message.chat.id,
        "*" + usernames.join(", ") + "* saha aisia, teu kenal",
        { parse_mode: "MarkdownV2" }
      );
    }

    if (success.length) {
      const creditByUser = generateCreditByUser_(success);
      sendMessage(
        message.chat.id,
        "saldo " +
          key +
          " beres diubah\n---\n" +
          creditByUser.join("\n") +
          "\n---\nmun saldona teu berubah jigana aya nu salah"
      );
    }
  } catch (err) {
    console.error(err);
    sendMessage(message.chat.id, "lieur otak aing :(");
  }
}
