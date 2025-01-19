export const createTelegramMessage = (
  text: string,
  overrides: {
    chat?: Partial<TelegramMessage['chat']>;
    from?: Partial<TelegramMessage['from']>;
    text?: string;
  } = {}
): TelegramMessage => ({
  chat: {
    id: 123456,
    type: 'group',
    ...(overrides.chat || {}),
  },
  from: {
    id: 789,
    username: 'testuser',
    ...(overrides.from || {}),
  },
  text,
});

export const createBilling = (overrides = {}): Billing => ({
  _id: '123',
  key: 'wifi',
  billingAmount: 100000,
  billingDate: 1,
  adminId: 789,
  groupId: 123456,
  members: [],
  ...overrides,
});
