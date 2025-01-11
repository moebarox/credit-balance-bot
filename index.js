function setWebhook() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}`;
  const result = UrlFetchApp.fetch(url).getContentText();
  console.log(result);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);

  if (!data.message || !data.message.text) {
    return;
  }

  try {
    switch (getCommand_(data.message.text)) {
      case "about":
        aboutHandler(data);
        break;
      case "newbilling":
        newBillingHandler(data.message);
        break;
      case "editbilling":
        editBillingHandler(data.message);
        break;
      case "deletebilling":
        deleteBillingHandler(data.message);
        break;
      case "join":
        joinHandler(data.message);
        break;
      case "showbalance":
        showBalanceHandler(data.message);
        break;
      case "editbalance":
        editBalanceHandler(data.message);
        break;
      case "addmember":
        addMemberHandler(data.message);
        break;
      case "removemember":
        removeMemberHandler(data.message);
        break;
      default:
    }
  } catch (err) {
    sendMessage(BOT_ADMIN_ID || data.message.chat.id, `Error: ${err}`);
  }
}

function debug() {
  const data = {
    message: {
      chat: {
        id: -256622337,
      },
      from: {
        id: BOT_ADMIN_ID,
      },
      text: "/showbalance",
    },
  };

  doPost({
    postData: {
      contents: JSON.stringify(data),
    },
  });
}
