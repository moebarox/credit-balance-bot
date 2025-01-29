import './removemember';
import {
  createTelegramMessage,
  createBilling,
} from '../01-helpers/tests/utils';

describe('RemoveMember command', () => {
  let mockSendMessage: jest.Mock;
  let mockGetMessage: jest.Mock;
  let mockListBillingWithMembers: jest.Mock;
  let mockDeleteMembers: jest.Mock;
  let mockGenerateUserBalance: jest.Mock;

  beforeEach(() => {
    mockSendMessage = jest.fn();
    mockGetMessage = jest.fn();
    mockListBillingWithMembers = jest.fn();
    mockDeleteMembers = jest.fn();
    mockGenerateUserBalance = jest.fn();

    (globalThis as any).Bot = {
      sendMessage: mockSendMessage,
      getMessage: mockGetMessage,
    };
    (globalThis as any).Billing = {
      listBillingWithMembers: mockListBillingWithMembers,
      deleteMembers: mockDeleteMembers,
      generateUserBalance: mockGenerateUserBalance,
    };
    (globalThis as any).COMMAND_HELP = {
      removemember: 'Usage: /removemember <key> <@user1 @user2>',
    };
  });

  describe('input validation', () => {
    it('should show help message for empty command', () => {
      mockGetMessage.mockReturnValue('');
      globalThis.removeMemberHandler(createTelegramMessage('/removemember'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /removemember <key> <@user1 @user2>',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show help message for missing users', () => {
      mockGetMessage.mockReturnValue('wifi');
      globalThis.removeMemberHandler(
        createTelegramMessage('/removemember wifi')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /removemember <key> <@user1 @user2>',
        { parse_mode: 'MarkdownV2' }
      );
    });
  });

  describe('billing validation', () => {
    it('should show error when billing not found', () => {
      mockGetMessage.mockReturnValue('wifi @user1');
      mockListBillingWithMembers.mockReturnValue([]);

      globalThis.removeMemberHandler(
        createTelegramMessage('/removemember wifi @user1')
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
      mockGetMessage.mockReturnValue('wifi @user1');
      mockListBillingWithMembers.mockReturnValue([
        createBilling({ adminId: 999 }), // Different admin ID
      ]);

      globalThis.removeMemberHandler(
        createTelegramMessage('/removemember wifi @user1')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'punten ari didinya saha? dulur lain'
      );
    });
  });

  describe('member removal', () => {
    it('should handle successful member removal', () => {
      const members = [
        { username: 'user1', balance: 1000 },
        { username: 'user2', balance: 2000 },
      ];
      mockGetMessage.mockReturnValue('wifi @user1 @user2');
      mockListBillingWithMembers.mockReturnValue([createBilling({ members })]);
      mockGenerateUserBalance.mockReturnValue([
        '@user1: Rp 1.000',
        '@user2: Rp 2.000',
      ]);

      globalThis.removeMemberHandler(
        createTelegramMessage('/removemember wifi @user1 @user2')
      );

      expect(mockDeleteMembers).toHaveBeenCalledWith('123', members);
      expect(mockSendMessage).toHaveBeenCalledWith(123456, [
        'berhasil ngahapus member dengan sisa saldo:',
        '---',
        '@user1: Rp 1.000\n@user2: Rp 2.000',
      ]);
    });

    it('should handle usernames without @ symbol', () => {
      const members = [{ username: 'user1', balance: 1000 }];
      mockGetMessage.mockReturnValue('wifi user1');
      mockListBillingWithMembers.mockReturnValue([createBilling({ members })]);
      mockGenerateUserBalance.mockReturnValue(['@user1: Rp 1.000']);

      globalThis.removeMemberHandler(
        createTelegramMessage('/removemember wifi user1')
      );

      expect(mockDeleteMembers).toHaveBeenCalledWith('123', members);
    });

    it('should handle multiple spaces between usernames', () => {
      const members = [
        { username: 'user1', balance: 1000 },
        { username: 'user2', balance: 2000 },
      ];
      mockGetMessage.mockReturnValue('wifi user1   user2');
      mockListBillingWithMembers.mockReturnValue([createBilling({ members })]);
      mockGenerateUserBalance.mockReturnValue([
        '@user1: Rp 1.000',
        '@user2: Rp 2.000',
      ]);

      globalThis.removeMemberHandler(
        createTelegramMessage('/removemember wifi user1   user2')
      );

      expect(mockDeleteMembers).toHaveBeenCalledWith('123', members);
    });
  });
});
