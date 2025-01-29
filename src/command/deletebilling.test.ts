import './deletebilling';
import {
  createTelegramMessage,
  createBilling,
} from '../01-helpers/tests/utils';

describe('DeleteBilling command', () => {
  let mockSendMessage: jest.Mock;
  let mockGetMessage: jest.Mock;
  let mockListBillingWithMembers: jest.Mock;
  let mockDeleteBilling: jest.Mock;
  let mockGenerateUserBalance: jest.Mock;

  beforeEach(() => {
    mockSendMessage = jest.fn();
    mockGetMessage = jest.fn();
    mockListBillingWithMembers = jest.fn();
    mockDeleteBilling = jest.fn();
    mockGenerateUserBalance = jest.fn();

    (globalThis as any).Bot = {
      sendMessage: mockSendMessage,
      getMessage_: mockGetMessage,
    };
    (globalThis as any).Billing = {
      listBillingWithMembers: mockListBillingWithMembers,
      deleteBilling: mockDeleteBilling,
      generateUserBalance: mockGenerateUserBalance,
    };
    (globalThis as any).COMMAND_HELP = {
      deletebilling: 'Usage: /deletebilling <key>',
    };
  });

  describe('input validation', () => {
    it('should show help message for empty command', () => {
      mockGetMessage.mockReturnValue('');
      globalThis.deleteBillingHandler(createTelegramMessage('/deletebilling'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /deletebilling <key>',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show help message for invalid format', () => {
      mockGetMessage.mockReturnValue('wifi extra');
      globalThis.deleteBillingHandler(
        createTelegramMessage('/deletebilling wifi extra')
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

      globalThis.deleteBillingHandler(
        createTelegramMessage('/deletebilling wifi')
      );

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

      globalThis.deleteBillingHandler(
        createTelegramMessage('/deletebilling wifi')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'punten ari didinya saha? dulur lain'
      );
    });
  });

  describe('billing deletion', () => {
    it('should delete billing and show final balance', () => {
      const mockMembers = [
        { username: 'user1', balance: 50000 },
        { username: 'user2', balance: 75000 },
      ];
      const mockBilling = createBilling({ members: mockMembers });

      mockGetMessage.mockReturnValue('wifi');
      mockListBillingWithMembers.mockReturnValue([mockBilling]);
      mockGenerateUserBalance.mockReturnValue(['balance info']);

      globalThis.deleteBillingHandler(
        createTelegramMessage('/deletebilling wifi')
      );

      // Should delete billing
      expect(mockDeleteBilling).toHaveBeenCalledWith(String(mockBilling._id));

      // Should show success message
      expect(mockSendMessage).toHaveBeenCalledWith(123456, [
        `billing \`wifi\` parantos dihapus mamangque :\\(`,
        'tapi jang jaga-jaga, ieu saldo terakhir nya',
        '---',
        'balance info',
        '---',
      ]);
    });

    it('should handle billing with no members', () => {
      const mockBilling = createBilling();

      mockGetMessage.mockReturnValue('wifi');
      mockListBillingWithMembers.mockReturnValue([mockBilling]);
      mockGenerateUserBalance.mockReturnValue(['balance info']);

      globalThis.deleteBillingHandler(
        createTelegramMessage('/deletebilling wifi')
      );

      expect(mockDeleteBilling).toHaveBeenCalledWith(String(mockBilling._id));
      expect(mockGenerateUserBalance).toHaveBeenCalledWith([]);
    });
  });
});
