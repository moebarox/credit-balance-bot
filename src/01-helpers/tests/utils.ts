export const createMockHandlers = () => {
  const mockSendMessage = jest.fn();
  const mockGetMessage = jest.fn();
  const mockGetCommand = jest.fn();
  const mockAboutHandler = jest.fn();
  const mockNewBillingHandler = jest.fn();
  const mockEditBillingHandler = jest.fn();
  const mockDeleteBillingHandler = jest.fn();
  const mockJoinHandler = jest.fn();
  const mockShowBalanceHandler = jest.fn();
  const mockEditBalanceHandler = jest.fn();
  const mockAddMemberHandler = jest.fn();
  const mockRemoveMemberHandler = jest.fn();
  const mockGetBilling = jest.fn();
  const mockListBillingWithMembers = jest.fn();
  const mockAddMembers = jest.fn();
  const mockUpdateBalance = jest.fn();
  const mockGenerateUserBalance = jest.fn();
  const mockGenerateCreditBalance = jest.fn();
  const mockAggregate = jest.fn();
  const mockInsertOne = jest.fn();
  const mockUpdateOne = jest.fn();
  const mockDeleteMany = jest.fn();
  const mockIsLeapYear = jest.fn();

  return {
    mockSendMessage,
    mockGetMessage,
    mockGetCommand,
    mockAboutHandler,
    mockNewBillingHandler,
    mockEditBillingHandler,
    mockDeleteBillingHandler,
    mockJoinHandler,
    mockShowBalanceHandler,
    mockEditBalanceHandler,
    mockAddMemberHandler,
    mockRemoveMemberHandler,
    mockGetBilling,
    mockListBillingWithMembers,
    mockAddMembers,
    mockUpdateBalance,
    mockGenerateUserBalance,
    mockGenerateCreditBalance,
    mockAggregate,
    mockInsertOne,
    mockUpdateOne,
    mockDeleteMany,
    mockIsLeapYear,
  };
};

export const setupGlobalMocks = (
  mocks: ReturnType<typeof createMockHandlers>
) => {
  (globalThis as any).Bot = {
    sendMessage: mocks.mockSendMessage,
    getCommand_: mocks.mockGetCommand,
    getMessage_: mocks.mockGetMessage,
  };
  (globalThis as any).Credit = {
    getBilling: mocks.mockGetBilling,
    listBillingWithMembers: mocks.mockListBillingWithMembers,
    addMembers: mocks.mockAddMembers,
    updateBalance: mocks.mockUpdateBalance,
    generateUserBalance: mocks.mockGenerateUserBalance,
    generateCreditBalance: mocks.mockGenerateCreditBalance,
  };
  (globalThis as any).MongoDB = {
    aggregate: mocks.mockAggregate,
    insertOne: mocks.mockInsertOne,
    updateOne: mocks.mockUpdateOne,
    deleteMany: mocks.mockDeleteMany,
  };
  (globalThis as any).DateHelper = {
    isLeapYear: mocks.mockIsLeapYear,
  };
  (globalThis as any).aboutHandler = mocks.mockAboutHandler;
  (globalThis as any).newBillingHandler = mocks.mockNewBillingHandler;
  (globalThis as any).editBillingHandler = mocks.mockEditBillingHandler;
  (globalThis as any).deleteBillingHandler = mocks.mockDeleteBillingHandler;
  (globalThis as any).joinHandler = mocks.mockJoinHandler;
  (globalThis as any).showBalanceHandler = mocks.mockShowBalanceHandler;
  (globalThis as any).editBalanceHandler = mocks.mockEditBalanceHandler;
  (globalThis as any).addMemberHandler = mocks.mockAddMemberHandler;
  (globalThis as any).removeMemberHandler = mocks.mockRemoveMemberHandler;
};

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
