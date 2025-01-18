import './join';

describe('Join command', () => {
  let mockSendMessage: jest.Mock;
  let mockGetMessage: jest.Mock;
  let mockListBillingWithMembers: jest.Mock;
  let mockInsertOne: jest.Mock;

  beforeEach(() => {
    mockSendMessage = jest.fn();
    mockGetMessage = jest.fn();
    mockListBillingWithMembers = jest.fn();
    mockInsertOne = jest.fn();

    (globalThis as any).Bot = {
      sendMessage: mockSendMessage,
      getMessage_: mockGetMessage,
    };
    (globalThis as any).Credit = {
      listBillingWithMembers: mockListBillingWithMembers,
    };
    (globalThis as any).MongoDB = {
      insertOne: mockInsertOne,
    };
    (globalThis as any).COMMAND_HELP = {
      join: 'Usage: /join <key>',
    };
  });

  const createMessage = (text: string): TelegramMessage => ({
    chat: {
      id: 123456,
      type: 'group',
    },
    from: {
      id: 789,
      username: 'testuser',
    },
    text,
  });

  const createBilling = (overrides = {}): Billing => ({
    _id: '123',
    key: 'wifi',
    billingAmount: 100000,
    billingDate: 1,
    adminId: 789,
    groupId: 123456,
    members: [],
    ...overrides,
  });

  describe('input validation', () => {
    it('should show help message for empty command', () => {
      mockGetMessage.mockReturnValue('');
      globalThis.joinHandler(createMessage('/join'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /join <key>',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show help message for invalid format', () => {
      mockGetMessage.mockReturnValue('wifi test');
      globalThis.joinHandler(createMessage('/join wifi test'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /join <key>',
        { parse_mode: 'MarkdownV2' }
      );
    });
  });

  describe('billing validation', () => {
    it('should show error when billing not found', () => {
      mockGetMessage.mockReturnValue('wifi');
      mockListBillingWithMembers.mockReturnValue([]);

      globalThis.joinHandler(createMessage('/join wifi'));

      expect(mockListBillingWithMembers).toHaveBeenCalledWith({
        groupId: 123456,
        key: 'wifi',
      });
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'aku tidak manggih kata kunci `wifi` yang elu cari :\\(',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show error when user is already a member', () => {
      mockGetMessage.mockReturnValue('wifi');
      mockListBillingWithMembers.mockReturnValue([
        createBilling({
          members: [{ username: 'testuser', balance: 0 }],
        }),
      ]);

      globalThis.joinHandler(createMessage('/join wifi'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'didinya sudah pernah join bosque :('
      );
    });
  });

  describe('join operations', () => {
    it('should handle successful join', () => {
      mockGetMessage.mockReturnValue('wifi');
      mockListBillingWithMembers.mockReturnValue([createBilling()]);

      globalThis.joinHandler(createMessage('/join wifi'));

      expect(mockInsertOne).toHaveBeenCalledWith('members', {
        billingId: { $oid: '123' },
        username: 'testuser',
        balance: 0,
      });
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'berhasil join mamangque :D'
      );
    });
  });
});
