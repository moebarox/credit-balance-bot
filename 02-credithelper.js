function listBillings_(groupId) {
  return dbFind("billings", { groupId });
}

function getBilling_(groupId, key) {
  return dbFindOne("billings", { groupId, key });
}

function listMembers_(billingId) {
  return dbFind("members", {
    billingId: { $oid: billingId },
  });
}

function generateUserBalance_(members) {
  return members.map((u) => {
    return `@${u.username}: ${toCurrency(Number(u.balance))}`;
  });
}

function generateCreditBalance_(billing, members) {
  const userBalance = generateUserBalance_(members);
  const billingAmountPerUser = Math.round(
    Number(billing.billingAmount) / members.length
  );
  return [
    `Saldo ${billing.key} ${toMonthYear(new Date())}`,
    "---",
    userBalance.join("\n"),
    "---",
    `saldo dipotong ${toCurrency(Number(billingAmountPerUser))} tiap tanggal ${
      billing.billingDate
    }`,
  ];
}

function updateBalance_(billing, users, amount) {
  const failed = [];
  const members = listMembers_(billing._id);
  const targetUser =
    users[0] === "all" ? members.map((c) => c.username) : users;
  const foundUsers = [];

  for (let i = 0; i < targetUser.length; i += 1) {
    const username = targetUser[i].replace("@", "");
    const row = members.find((c) => c.username === username);

    if (row) {
      foundUsers.push(username);
      dbUpdateOne(
        "members",
        {
          username,
          billingId: { $oid: billing._id },
        },
        {
          $set: {
            balance: Number(row.balance) + amount,
          },
        }
      );
    } else {
      failed.push({ username, code: "USER_NOT_FOUND" });
    }
  }

  const success = dbFind("members", {
    billingId: { $oid: billing._id },
    username: { $in: foundUsers },
  });

  return { success, failed };
}
