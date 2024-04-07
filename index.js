function setWebhook() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}`;
  const result = UrlFetchApp.fetch(url).getContentText();
  Logger.log(result);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    switch (getCommand_(data.message.text)) {
      case "about":
        aboutHandler(data.message);
        break;
      case "showbalance":
        showBalanceHandler(data.message);
        break;
      case "newbilling":
        newBillingHandler(data.message);
        break;
      case "editbilling":
        editBillingHandler(data.message);
        break;
      case "join":
        joinHandler(data.message);
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
    console.log(err);
    sendMessage(data.message.chat.id, `Error: ${err}`);
  }
}

function debug() {
  const data = {
    message: {
      chat: {
        id: -256622337,
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
