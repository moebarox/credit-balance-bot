namespace Credit {
  export function listBillingWithMembers(
    $match: Record<string, any>
  ): Billing[] {
    return MongoDB.aggregate<Billing>('billings', [
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

  export function getBilling(
    groupId: number,
    key: string
  ): Billing | undefined {
    return MongoDB.findOne('billings', {
      key,
      groupId: {
        $numberLong: String(groupId),
      },
    });
  }

  export function listMembers(billingId: string): BillingMember[] {
    return MongoDB.find('members', {
      billingId: { $oid: billingId },
    });
  }

  export function generateUserBalance(members: BillingMember[]): string[] {
    return members.map((member: BillingMember) => {
      return `@${member.username}: ${NumberHelper.toCurrency(Number(member.balance))}`;
    });
  }

  export function generateCreditBalance(
    billing: Billing,
    members: BillingMember[]
  ): string[] {
    const userBalance = generateUserBalance(members);
    const billingAmountPerUser = Math.round(
      Number(billing.billingAmount) / members.length
    );
    return [
      `saldo ${billing.key} ${DateHelper.toMonthYear(new Date())}`,
      '---',
      userBalance.join('\n'),
      '---',
      `tagihan ${NumberHelper.toCurrency(Number(billing.billingAmount))} (${NumberHelper.toCurrency(
        Number(billingAmountPerUser)
      )} / orang) tiap tanggal ${billing.billingDate}`,
    ];
  }

  export function updateBalance(
    billing: Billing,
    users: string[],
    amount: number
  ): BillingUpdateResult {
    const failed = [];
    const members = listMembers(billing._id as string);
    const targetUser =
      users[0] === 'all'
        ? members.map((c: BillingMember) => c.username)
        : users;
    const foundUsers = [];

    for (let i = 0; i < targetUser.length; i += 1) {
      const username = targetUser[i].replace('@', '');
      const row = members.find((c: BillingMember) => c.username === username);

      if (row) {
        foundUsers.push(username);
        MongoDB.updateOne(
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

    const success = MongoDB.find<BillingMember>('members', {
      billingId: { $oid: billing._id },
      username: { $in: foundUsers },
    });

    return { success, failed };
  }

  export function addMembers(members: BillingMember[]) {
    MongoDB.insertMany('members', members);
  }
}

(globalThis as any).Credit = Credit;
