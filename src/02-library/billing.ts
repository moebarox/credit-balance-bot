namespace Billing {
  function firestoreListBillingWithMembers(
    $match: Record<string, any>
  ): Billing[] {
    const query = Firestore.query<Billing>('billings');
    for (const key in $match) {
      query.Where(key, '==', $match[key]);
    }
    const docs = query.Execute();

    return docs.map((doc) => ({
      ...doc.obj,
      _id: doc.path,
    }));
  }

  function mongoListBillingWithMembers($match: Record<string, any>): Billing[] {
    if ($match.groupId) {
      $match.groupId = {
        $numberLong: String($match.groupId),
      };
    }

    return MongoDB.aggregate<Billing>('billings', [
      { $match },
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

  export function listBillingWithMembers(
    $match: Record<string, any>
  ): Billing[] {
    switch (DB_CONNECTION) {
      case DBConnection.MongoDB:
        return mongoListBillingWithMembers($match);
      default:
        return firestoreListBillingWithMembers($match);
    }
  }

  function firestoreGetBilling(
    groupId: number,
    key: string
  ): Billing | undefined {
    const query = Firestore.query<Billing>('billings');
    query.Where('groupId', '==', groupId);
    query.Where('key', '==', key);
    const docs = query.Execute();
    return docs[0]?.obj && { ...docs[0]?.obj, _id: docs[0]?.path };
  }

  function mongoGetBilling(groupId: number, key: string): Billing | undefined {
    return MongoDB.findOne('billings', {
      key,
      groupId: {
        $numberLong: String(groupId),
      },
    });
  }

  export function getBilling(
    groupId: number,
    key: string
  ): Billing | undefined {
    switch (DB_CONNECTION) {
      case DBConnection.MongoDB:
        return mongoGetBilling(groupId, key);
      default:
        return firestoreGetBilling(groupId, key);
    }
  }

  export function generateUserBalance(members: BillingMember[]): string[] {
    return members.map((member: BillingMember) => {
      return `@${member.username}: ${NumberHelper.toCurrency(Number(member.balance))}`;
    });
  }

  export function generateBalanceMessage(
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

  function firestoreUpdateBalance(
    billing: Billing,
    users: string[],
    amount: number
  ): BillingUpdateResult {
    // Initialize arrays to track failed and successful updates
    const failed: BillingUpdateFailed[] = [];
    const foundUsers: string[] = [];

    // Get all members for this billing
    const members = billing.members!;

    // Determine target users - either all members or specified users
    const targetUser =
      users[0] === 'all'
        ? members.map((c: BillingMember) => c.username)
        : users;

    // Process each target user
    for (let i = 0; i < targetUser.length; i += 1) {
      // Remove @ symbol if present in username
      const username = targetUser[i].replace('@', '');

      // Find the member record for this user
      const row = members.find((c: BillingMember) => c.username === username);

      if (row) {
        // User found - update their balance
        foundUsers.push(username);
        row.balance = Number(row.balance) + amount;
      } else {
        // User not found - add to failed array
        failed.push({ username, code: 'USER_NOT_FOUND' });
      }
    }

    Firestore.updateDocument(
      billing._id as string,
      {
        members,
      },
      true
    );

    // Get updated records for successful updates
    const updatedBilling = Firestore.getDocument<Billing>(
      billing._id as string
    );
    const success = updatedBilling.obj.members!.filter((m) =>
      foundUsers.includes(m.username)
    );

    return { success, failed };
  }

  function mongoUpdateBalance(
    billing: Billing,
    users: string[],
    amount: number
  ): BillingUpdateResult {
    // Initialize arrays to track failed and successful updates
    const failed: BillingUpdateFailed[] = [];
    const foundUsers: string[] = [];

    // Get all members for this billing
    const members = MongoDB.find<BillingMember>('members', {
      billingId: { $oid: billing._id },
    });

    // Determine target users - either all members or specified users
    const targetUser =
      users[0] === 'all'
        ? members.map((c: BillingMember) => c.username)
        : users;

    // Process each target user
    for (let i = 0; i < targetUser.length; i += 1) {
      // Remove @ symbol if present in username
      const username = targetUser[i].replace('@', '');

      // Find the member record for this user
      const row = members.find((c: BillingMember) => c.username === username);

      if (row) {
        // User found - update their balance
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
        // User not found - add to failed array
        failed.push({ username, code: 'USER_NOT_FOUND' });
      }
    }

    // Get updated records for successful updates
    const success = MongoDB.find<BillingMember>('members', {
      billingId: { $oid: billing._id },
      username: { $in: foundUsers },
    });

    return { success, failed };
  }

  export function updateBalance(
    billing: Billing,
    users: string[],
    amount: number
  ): BillingUpdateResult {
    switch (DB_CONNECTION) {
      case DBConnection.MongoDB:
        return mongoUpdateBalance(billing, users, amount);
      default:
        return firestoreUpdateBalance(billing, users, amount);
    }
  }

  function firestoreAddMembers(billingId: string, members: BillingMember[]) {
    const billing = Firestore.getDocument<Billing>(billingId);

    Firestore.updateDocument(
      billingId,
      {
        members: [...billing.obj.members!, ...members],
      },
      true
    );
  }

  function mongoAddMembers(billingId: string, members: BillingMember[]) {
    const payload = members.map((member: BillingMember) => ({
      billingId: { $oid: billingId },
      username: member.username,
      balance: member.balance,
    }));
    MongoDB.insertMany('members', payload);
  }

  export function addMembers(billingId: string, members: BillingMember[]) {
    switch (DB_CONNECTION) {
      case DBConnection.MongoDB:
        return mongoAddMembers(billingId, members);
      default:
        return firestoreAddMembers(billingId, members);
    }
  }

  function firestoreDeleteMembers(billingId: string, members: BillingMember[]) {
    const billing = Firestore.getDocument<Billing>(billingId as string);
    Firestore.updateDocument(
      billingId as string,
      {
        members: billing.obj.members!.filter(
          (m) => !members.map((m) => m.username).includes(m.username)
        ),
      },
      true
    );
  }

  function mongoDeleteMembers(billingId: string, members: BillingMember[]) {
    MongoDB.deleteMany('members', {
      billingId: {
        $oid: billingId,
      },
      username: {
        $in: members.map((m) => m.username),
      },
    });
  }

  export function deleteMembers(billingId: string, members: BillingMember[]) {
    switch (DB_CONNECTION) {
      case DBConnection.MongoDB:
        return mongoDeleteMembers(billingId, members);
      default:
        return firestoreDeleteMembers(billingId, members);
    }
  }

  function firestoreCreateBilling(billing: Billing) {
    Firestore.createDocument('billings', {
      key: billing.key,
      billingDate: billing.billingDate,
      billingAmount: billing.billingAmount,
      adminId: billing.adminId,
      groupId: billing.groupId,
      members: billing.members,
    });
  }

  function mongoCreateBilling(billing: Billing) {
    const id = MongoDB.insertOne('billings', {
      key: billing.key,
      billingDate: billing.billingDate,
      billingAmount: billing.billingAmount,
      adminId: billing.adminId,
      groupId: {
        $numberLong: String(billing.groupId),
      },
    });

    MongoDB.insertMany('members', [
      {
        billingId: { $oid: id },
        username: billing.members![0].username,
        balance: 0,
      },
    ]);
  }

  export function createBilling(billing: Billing) {
    switch (DB_CONNECTION) {
      case DBConnection.MongoDB:
        return mongoCreateBilling(billing);
      default:
        return firestoreCreateBilling(billing);
    }
  }

  function firestoreUpdateBilling(billing: Billing) {
    Firestore.updateDocument(
      billing._id as string,
      {
        key: billing.key,
        billingDate: billing.billingDate,
        billingAmount: billing.billingAmount,
        adminId: billing.adminId,
        groupId: billing.groupId,
      },
      true
    );
  }

  function mongoUpdateBilling(billing: Billing) {
    MongoDB.updateOne(
      'billings',
      {
        _id: { $oid: billing._id },
      },
      {
        key: billing.key,
        billingDate: billing.billingDate,
        billingAmount: billing.billingAmount,
        adminId: billing.adminId,
        groupId: {
          $numberLong: String(billing.groupId),
        },
      }
    );
  }

  export function updateBilling(billing: Billing) {
    switch (DB_CONNECTION) {
      case DBConnection.MongoDB:
        return mongoUpdateBilling(billing);
      default:
        return firestoreUpdateBilling(billing);
    }
  }

  function firestoreDeleteBilling(billingId: string) {
    Firestore.deleteDocument(billingId);
  }

  function mongoDeleteBilling(billingId: string) {
    MongoDB.deleteMany('billings', { _id: { $oid: billingId } });
    MongoDB.deleteMany('members', { billingId: { $oid: billingId } });
  }

  export function deleteBilling(billingId: string) {
    switch (DB_CONNECTION) {
      case DBConnection.MongoDB:
        return mongoDeleteBilling(billingId);
      default:
        return firestoreDeleteBilling(billingId);
    }
  }
}

(globalThis as any).Billing = Billing;
