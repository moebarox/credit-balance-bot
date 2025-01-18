function billingScheduler() {
  const today = new Date();
  const currentDate = today.getDate();
  const tomorrow = new Date();
  tomorrow.setDate(currentDate + 1);
  const nextDate = tomorrow.getDate();

  const deduction = [];
  const reminder = [];

  const billings: Billing[] = dbAggregate('billings', [
    {
      $match: {
        billingDate: {
          $in: [currentDate, nextDate],
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

  for (let i = 0; i < billings.length; i += 1) {
    const billing = billings[i];
    let actualDate = billing.billingDate;

    if (today.getMonth() === 1 && billing.billingDate > 28) {
      actualDate = DateHelper.isLeapYear(today) ? 29 : 28;
    }

    if (actualDate === currentDate) {
      deduction.push(billing);
    } else {
      reminder.push(billing);
    }
  }

  // Send reminder message for insufficient balance
  for (let i = 0; i < reminder.length; i += 1) {
    const billing = reminder[i];
    const billingAmount = Math.round(
      billing.billingAmount / billing.members!.length
    );
    const insufficientBalanceMembers = billing.members!.filter(
      (m: BillingMember) => m.balance < billingAmount
    );

    if (insufficientBalanceMembers.length) {
      const userBalance = generateUserBalance(insufficientBalanceMembers);
      sendMessage(billing.groupId as number, [
        'saldo mamang jigana kurang yeuh buat tagihan besok :(',
        '---',
        userBalance.join('\n'),
        '---',
        'rada di topup atuh ya ditunggu sebelum besok',
      ]);
    }
  }

  // Update balance
  for (let i = 0; i < deduction.length; i += 1) {
    const billing = deduction[i];
    const billingAmount = Math.round(
      billing.billingAmount / billing.members!.length
    );
    updateBalance(billing, ['all'], -billingAmount);
  }

  if (deduction.length > 0) {
    const updatedBillings: Billing[] = dbAggregate('billings', [
      {
        $match: {
          _id: {
            $in: deduction.map((c) => ({
              $oid: c._id,
            })),
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

    for (let i = 0; i < updatedBillings.length; i += 1) {
      const billing = updatedBillings[i];
      const message = generateCreditBalance(billing, billing.members!);
      sendMessage(billing.groupId as number, message);
    }
  }
}
