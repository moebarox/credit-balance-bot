function handle(data) {
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
}
