import './editbalance';
import {
  createTelegramMessage,
  createBilling,
} from '../01-helpers/tests/utils';

describe('EditBalance command', () => {
  let mockSendMessage: jest.Mock;
  let mockGetMessage: jest.Mock;
  let mockGetBilling: jest.Mock;
  let mockUpdateBalance: jest.Mock;
  let mockGenerateUserBalance: jest.Mock;

  beforeEach(() => {
    mockSendMessage = jest.fn();
    mockGetMessage = jest.fn();
    mockGetBilling = jest.fn();
    mockUpdateBalance = jest.fn();
    mockGenerateUserBalance = jest.fn();

    (globalThis as any).Bot = {
      sendMessage: mockSendMessage,
      getMessage_: mockGetMessage,
    };
    (globalThis as any).Credit = {
      getBilling: mockGetBilling,
      updateBalance: mockUpdateBalance,
      generateUserBalance: mockGenerateUserBalance,
    };
    (globalThis as any).COMMAND_HELP = {
      editbalance: 'Usage: /editbalance <key> <@user1 @user2|all> <amount>',
    };
  });

  describe('input validation', () => {
    it('should show help message for empty command', () => {
      mockGetMessage.mockReturnValue('');
      globalThis.editBalanceHandler(createTelegramMessage('/editbalance'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /editbalance <key> <@user1 @user2|all> <amount>',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show help message for missing amount', () => {
      mockGetMessage.mockReturnValue('wifi @user1');
      globalThis.editBalanceHandler(
        createTelegramMessage('/editbalance wifi @user1')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /editbalance <key> <@user1 @user2|all> <amount>',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show help message for invalid amount format', () => {
      mockGetMessage.mockReturnValue('wifi @user1 abc');
      globalThis.editBalanceHandler(
        createTelegramMessage('/editbalance wifi @user1 abc')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /editbalance <key> <@user1 @user2|all> <amount>',
        { parse_mode: 'MarkdownV2' }
      );
    });
  });

  describe('billing validation', () => {
    it('should show error when billing not found', () => {
      mockGetMessage.mockReturnValue('wifi @user1 1000');
      mockGetBilling.mockReturnValue(null);

      globalThis.editBalanceHandler(
        createTelegramMessage('/editbalance wifi @user1 1000')
      );

      expect(mockGetBilling).toHaveBeenCalledWith(123456, 'wifi');
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'aku tidak manggih kata kunci `wifi` yang elu cari :\\(',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show error when user is not admin', () => {
      mockGetMessage.mockReturnValue('wifi @user1 1000');
      mockGetBilling.mockReturnValue(createBilling({ adminId: 999 })); // Different admin ID

      globalThis.editBalanceHandler(
        createTelegramMessage('/editbalance wifi @user1 1000')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'punten ari didinya saha? dulur lain'
      );
    });
  });

  describe('balance updates', () => {
    it('should handle successful balance update', () => {
      mockGetMessage.mockReturnValue('wifi @user1 1000');
      mockGetBilling.mockReturnValue(createBilling());
      mockUpdateBalance.mockReturnValue({
        success: [{ username: 'user1', balance: 1000 }],
        failed: [],
      });
      mockGenerateUserBalance.mockReturnValue(['@user1: Rp 1.000']);

      globalThis.editBalanceHandler(
        createTelegramMessage('/editbalance wifi @user1 1000')
      );

      expect(mockUpdateBalance).toHaveBeenCalledWith(
        expect.any(Object),
        ['@user1'],
        1000
      );
      expect(mockSendMessage).toHaveBeenCalledWith(123456, [
        'saldo wifi beres diubah',
        '---',
        '@user1: Rp 1.000',
        '---',
        'mun saldona teu berubah jigana aya nu salah',
      ]);
    });

    it('should handle non-existent users', () => {
      mockGetMessage.mockReturnValue('wifi @user1 @nonexistent 1000');
      mockGetBilling.mockReturnValue(createBilling());
      mockUpdateBalance.mockReturnValue({
        success: [{ username: 'user1', balance: 1000 }],
        failed: [{ username: 'nonexistent', code: 'USER_NOT_FOUND' }],
      });
      mockGenerateUserBalance.mockReturnValue(['@user1: Rp 1.000']);

      globalThis.editBalanceHandler(
        createTelegramMessage('/editbalance wifi @user1 @nonexistent 1000')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        '*nonexistent* saha aisia, teu kenal',
        { parse_mode: 'MarkdownV2' }
      );
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        expect.arrayContaining(['saldo wifi beres diubah'])
      );
    });

    it('should handle negative amounts', () => {
      mockGetMessage.mockReturnValue('wifi @user1 -1000');
      mockGetBilling.mockReturnValue(createBilling());
      mockUpdateBalance.mockReturnValue({
        success: [{ username: 'user1', balance: -1000 }],
        failed: [],
      });
      mockGenerateUserBalance.mockReturnValue(['@user1: -Rp 1.000']);

      globalThis.editBalanceHandler(
        createTelegramMessage('/editbalance wifi @user1 -1000')
      );

      expect(mockUpdateBalance).toHaveBeenCalledWith(
        expect.any(Object),
        ['@user1'],
        -1000
      );
    });

    it('should handle multiple users', () => {
      mockGetMessage.mockReturnValue('wifi @user1 @user2 1000');
      mockGetBilling.mockReturnValue(createBilling());
      mockUpdateBalance.mockReturnValue({
        success: [
          { username: 'user1', balance: 1000 },
          { username: 'user2', balance: 1000 },
        ],
        failed: [],
      });
      mockGenerateUserBalance.mockReturnValue([
        '@user1: Rp 1.000',
        '@user2: Rp 1.000',
      ]);

      globalThis.editBalanceHandler(
        createTelegramMessage('/editbalance wifi @user1 @user2 1000')
      );

      expect(mockUpdateBalance).toHaveBeenCalledWith(
        expect.any(Object),
        ['@user1', '@user2'],
        1000
      );
    });
  });
});
