type TelegramMessage = {
  chat: {
    id: number;
    type: 'group' | 'supergroup' | 'private';
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

type TelegramMessageOption = {
  parse_mode?: 'HTML' | 'MarkdownV2';
};
