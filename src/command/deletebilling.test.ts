import './deletebilling';

describe('DeleteBilling command', () => {
  let mockSendMessage: jest.Mock;
  let mockGetMessage: jest.Mock;
  let mockListBillingWithMembers: jest.Mock;
  let mockDeleteMany: jest.Mock;
  let mockGenerateCreditBalance: jest.Mock;

  beforeEach(() => {
    mockSendMessage = jest.fn();
    mockGetMessage = jest.fn();
    mockListBillingWithMembers = jest.fn();
    mockDeleteMany = jest.fn();
    mockGenerateCreditBalance = jest.fn();

    (globalThis as any).Bot = {
      sendMessage: mockSendMessage,
      getMessage_: mockGetMessage,
    };
    (globalThis as any).Credit = {
      listBillingWithMembers: mockListBillingWithMembers,
      generateCreditBalance: mockGenerateCreditBalance,
    };
    (globalThis as any).MongoDB = {
      deleteMany: mockDeleteMany,
    };
    (globalThis as any).COMMAND_HELP = {
      deletebilling: 'Usage: /deletebilling <key>',
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
      globalThis.deleteBillingHandler(createMessage('/deletebilling'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /deletebilling <key>',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show help message for invalid format', () => {
      mockGetMessage.mockReturnValue('wifi extra');
      globalThis.deleteBillingHandler(
        createMessage('/deletebilling wifi extra')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /deletebilling <key>',
        { parse_mode: 'MarkdownV2' }
      );
    });
  });

  describe('billing validation', () => {
    it('should show error when billing not found', () => {
      mockGetMessage.mockReturnValue('wifi');
      mockListBillingWithMembers.mockReturnValue([]);

      globalThis.deleteBillingHandler(createMessage('/deletebilling wifi'));

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

    it('should show error when user is not admin', () => {
      mockGetMessage.mockReturnValue('wifi');
      mockListBillingWithMembers.mockReturnValue([
        createBilling({ adminId: 999 }), // Different admin ID
      ]);

      globalThis.deleteBillingHandler(createMessage('/deletebilling wifi'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'punten ari didinya saha? dulur lain'
      );
    });
  });

  describe('billing deletion', () => {
    it('should delete billing and its members', () => {
      const mockMembers = [
        { username: 'user1', balance: 50000 },
        { username: 'user2', balance: 75000 },
      ];
      const mockBilling = createBilling({ members: mockMembers });

      mockGetMessage.mockReturnValue('wifi');
      mockListBillingWithMembers.mockReturnValue([mockBilling]);
      mockGenerateCreditBalance.mockReturnValue(['balance info']);

      globalThis.deleteBillingHandler(createMessage('/deletebilling wifi'));

      // Should delete billing
      expect(mockDeleteMany).toHaveBeenCalledWith('billings', {
        _id: { $oid: '123' },
      });

      // Should delete members
      expect(mockDeleteMany).toHaveBeenCalledWith('members', {
        billingId: { $oid: '123' },
      });

      // Should show success message
      expect(mockSendMessage).toHaveBeenCalledWith(123456, [
        'parantos dihapus mamangque :(',
        'tapi jang jaga-jaga, ieu saldo terakhir nya',
      ]);

      // Should show final balance
      expect(mockGenerateCreditBalance).toHaveBeenCalledWith(
        mockBilling,
        mockMembers
      );
      expect(mockSendMessage).toHaveBeenCalledWith(123456, ['balance info']);
    });

    it('should handle billing with no members', () => {
      const mockBilling = createBilling();

      mockGetMessage.mockReturnValue('wifi');
      mockListBillingWithMembers.mockReturnValue([mockBilling]);
      mockGenerateCreditBalance.mockReturnValue(['balance info']);

      globalThis.deleteBillingHandler(createMessage('/deletebilling wifi'));

      expect(mockDeleteMany).toHaveBeenCalledTimes(2);
      expect(mockGenerateCreditBalance).toHaveBeenCalledWith(mockBilling, []);
    });
  });
});
