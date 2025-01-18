type TelegramMessage = {
  chat: {
    id: number;
    type: "group" | "supergroup";
  };
  text: string;
  from: {
    id: number;
    username: string;
  };
};

type TelegramContext = {
  message: TelegramMessage;
};
