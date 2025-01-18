const NEWBILLING_HELP = [
  "*Membuat Tagihan Baru*",
  "```",
  "/newbilling [key] [billingDate] [billingAmount]",
  "```",
  " ",
  "*keterangan:*",
  "`key` \\- Kata kunci tagihan\\.",
  "`billingDate` \\- Tanggal tagihan\\. Saldo akan dipotong pada tanggal ini\\.",
  "`billingAmount` \\- Nominal tagihan\\. Ini merupakan total tagihan dan akan dibagi rata pada semua anggota\\.",
  " ",
  "*contoh:*",
  "`/newbilling youtube 1 120000`",
];

const EDITBILLING_HELP = [
  "*Mengubah Detail Tagihan*",
  "```",
  "/editbilling [key] [newBillingDate] [newBillingAmount]",
  "```",
  " ",
  "*keterangan:*",
  "`key` \\- Kata kunci tagihan\\.",
  "`newBillingDate` \\- Tanggal tagihan\\. Saldo akan dipotong pada tanggal ini\\.",
  "`newBillingAmount` \\- Nominal tagihan\\. Ini merupakan total tagihan dan akan dibagi rata pada semua anggota\\.",
  " ",
  "*contoh:*",
  "`/editbilling youtube 8 149900`",
];

const DELETEBILLING_HELP = [
  "*Menghapus Tagihan \\(permanen\\)*",
  "```",
  "/deletebilling [key]",
  "```",
  " ",
  "*keterangan:*",
  "`key` \\- Kata kunci tagihan\\.",
  " ",
  "*contoh:*",
  "`/deletebilling youtube`",
];

const JOIN_HELP = [
  "*Bergabung Sebagai Anggota*",
  "```",
  "/join [key]",
  "```",
  " ",
  "*keterangan:*",
  "`key` \\- Kata kunci tagihan\\.",
  " ",
  "*contoh:*",
  "`/join youtube`",
];

const ADDMEMBER_HELP = [
  "*Menambahkan User sebagai Anggota*",
  "```",
  "/addmember [key] [username (bisa lebih dari satu)]",
  "```",
  " ",
  "*keterangan:*",
  "`key` \\- Kata kunci tagihan\\.",
  "`username` \\- Username anggota yang ingin ditambahkan ke billing\\. Bisa lebih dari satu, dipisahkan dengan spasi\\. Diperbolehkan menggunakan `@` di awal username\\.",
  " ",
  "*contoh:*",
  "`/addmember youtube johndoe`",
  "`/addmember youtube johndoe janedee`",
  "`/addmember youtube @johndoe @janedee`",
];

const REMOVEMEMBER_HELP = [
  "*Menghapus User dari Anggota*",
  "```",
  "/removemember [key] [username (bisa lebih dari satu)]",
  "```",
  " ",
  "*keterangan:*",
  "`key` \\- Kata kunci tagihan\\.",
  "`username` \\- Username anggota yang ingin dihapus dari billing\\. Bisa lebih dari satu, dipisahkan dengan spasi\\. Diperbolehkan menggunakan `@` di awal username\\.",
  " ",
  "*contoh:*",
  "`/removemember youtube johndoe`",
  "`/removemember youtube johndoe janedee`",
  "`/removemember youtube @johndoe @janedee`",
];

const SHOWBALANCE_HELP = [
  "*Menampilkan Saldo*",
  "```",
  "/showbalance [key (opsional)]",
  "```",
  " ",
  "*keterangan:*",
  "`key` \\- Kata kunci tagihan\\.",
  " ",
  "*contoh:*",
  "`/showbalance`",
  "`/showbalance youtube`",
];

const EDITBALANCE_HELP = [
  "*Mengubah Saldo*",
  "```",
  "/editbalance [key] [username (bisa lebih dari satu)] [nominal]",
  "```",
  " ",
  "*keterangan:*",
  "`key` \\- Kata kunci tagihan\\.",
  "`username` \\- Username anggota yang ingin diubah saldonya\\. Bisa lebih dari satu, dipisahkan dengan spasi\\. Diperbolehkan menggunakan `@` di awal username\\.",
  "`nominal` \\- Nominal yang ingin ditambahkan ke saldo\\. Bisa positif \\(tambah\\) atau negatif \\(kurang\\)\\.",
  " ",
  "*contoh:*",
  "`/editbalance youtube johndoe 1000`",
  "`/editbalance youtube johndoe +1000`",
  "`/editbalance youtube johndoe janedee -1000`",
  "`/editbalance youtube @johndoe @janedee 1000`",
  "`/editbalance youtube @johndoe @janedee -1000`",
];

const COMMAND_HELP = {
  newbilling: NEWBILLING_HELP,
  editbilling: EDITBILLING_HELP,
  deletebilling: DELETEBILLING_HELP,
  join: JOIN_HELP,
  addmember: ADDMEMBER_HELP,
  removemember: REMOVEMEMBER_HELP,
  showbalance: SHOWBALANCE_HELP,
  editbalance: EDITBALANCE_HELP,
};
