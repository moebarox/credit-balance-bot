function isLastDay_(date) {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return date.getDate() === lastDay.getDate();
}

function creditScheduler() {
  const date = new Date();
  const today = date.getDate();
  const configs = getCreditConfig_();
  const deduction = [];
  const reminder = [];

  for (let i = 0; i < configs.length; i += 1) {
    const config = configs[i];
    let actualDate = config.deductionDate;

    if (date.getMonth() === 1 && config.deductionDate > 28) {
      actualDate = date.getFullYear() % 4 === 0 ? 29 : 28;
    }

    if (actualDate === today) {
      deduction.push(config);
    } else if (
      actualDate - 1 === today ||
      (actualDate - 1 === 0 && isLastDay_(date))
    ) {
      reminder.push(config);
    }
  }

  for (let i = 0; i < deduction.length; i += 1) {
    const config = deduction[i];
    updateCredit_(config.key, config.groupId, ["all"], -config.deductAmount);

    const credits = dbFind("credits", { creditId: { $oid: config._id } });
    const creditByUser = generateUserBalance(credits);
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
    sendMessage(config.groupId, msg);
  }

  for (let i = 0; i < reminder.length; i += 1) {
    const config = reminder[i];
    const insufficientCredits = dbFind("credits", {
      creditId: { $oid: config._id },
      credit: { $lt: config.deductAmount },
    });

    if (insufficientCredits.length) {
      const creditByUser = generateUserBalance(insufficientCredits);
      sendMessage(
        config.groupId,
        "guys saldo antum kurang nih buat subscription bulan depan\n\n" +
          creditByUser.join("\n") +
          "\n\nmau ikut lagi ga?"
      );
    }
  }
}
