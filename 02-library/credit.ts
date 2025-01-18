function listBillingWithMembers($match: Record<string, any>): Billing[] {
  return dbAggregate('billings', [
    {
      $match: {
        ...$match,
        groupId: {
          $numberLong: String($match.groupId),
        },
      },
    },
    {
      $lookup: {
        from: 'members',
        localField: '_id',
        foreignField: 'billingId',
        as: 'members',
      },
    },
  ]);
}

function getBilling(groupId: number, key: string) {
  return dbFindOne('billings', {
    key,
    groupId: {
      $numberLong: String(groupId),
    },
  });
}

function listMembers(billingId: string) {
  return dbFind('members', {
    billingId: { $oid: billingId },
  });
}

function generateUserBalance(members: BillingMember[]) {
  return members.map((member: BillingMember) => {
    return `@${member.username}: ${toCurrency(Number(member.balance))}`;
  });
}

function generateCreditBalance(billing: Billing, members: BillingMember[]) {
  const userBalance = generateUserBalance(members);
  const billingAmountPerUser = Math.round(
    Number(billing.billingAmount) / members.length
  );
  return [
    `saldo ${billing.key} ${toMonthYear(new Date())}`,
    '---',
    userBalance.join('\n'),
    '---',
    `tagihan ${toCurrency(Number(billing.billingAmount))} (${toCurrency(
      Number(billingAmountPerUser)
    )} / orang) tiap tanggal ${billing.billingDate}`,
  ];
}

function updateBalance(billing: Billing, users: string[], amount: number) {
  const failed = [];
  const members = listMembers(billing._id as string);
  const targetUser =
    users[0] === 'all' ? members.map((c: BillingMember) => c.username) : users;
  const foundUsers = [];

  for (let i = 0; i < targetUser.length; i += 1) {
    const username = targetUser[i].replace('@', '');
    const row = members.find((c: BillingMember) => c.username === username);

    if (row) {
      foundUsers.push(username);
      dbUpdateOne(
        'members',
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
      failed.push({ username, code: 'USER_NOT_FOUND' });
    }
  }

  const success = dbFind('members', {
    billingId: { $oid: billing._id },
    username: { $in: foundUsers },
  });

  return { success, failed };
}
