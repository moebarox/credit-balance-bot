function execute() {
  console.log('Starting migration from MongoDB to Firestore...');

  try {
    // Get all billings with their members from MongoDB
    const billings = MongoDB.aggregate<Billing>('billings', [
      { $match: {} },
      {
        $lookup: {
          from: 'members',
          localField: '_id',
          foreignField: 'billingId',
          as: 'members',
        },
      },
    ]);

    console.log(`Found ${billings.length} billings to migrate`);

    // Migrate each billing and its members
    for (const billing of billings) {
      if (billing.members?.length === 0) {
        console.log(
          `Skipping billing ${billing._id}#${billing.key} as it has no members`
        );
        continue;
      }

      // Remove MongoDB specific fields and transform data for Firestore
      const billingForFirestore = {
        key: billing.key,
        billingDate: billing.billingDate,
        billingAmount: billing.billingAmount,
        adminId: billing.adminId,
        groupId: billing.groupId,
        members: billing.members?.map((member) => ({
          username: member.username,
          balance: member.balance,
        })),
      };

      // Create billing document in Firestore
      console.log(`Migrating billing: ${billing._id}#${billing.key}`);
      Firestore.createDocument('billings', billingForFirestore);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}
