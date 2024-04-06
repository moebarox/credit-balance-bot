function setWebhook() {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${WEBHOOK_URL}`;
  const result = UrlFetchApp.fetch(url).getContentText();
  Logger.log(result);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    handle(data);
  } catch (err) {
    console.log(err);
    sendMessage(data.message.chat.id, `Error: ${err}`);
  }
}

function debug() {
  var data = {
    message: {
      chat: {
        id: -256622337,
      },
      text: "/credit",
    },
  };

  doPost({
    postData: {
      contents: JSON.stringify(data),
    },
  });
}
