import './addmember';
import {
  createTelegramMessage,
  createBilling,
} from '../01-helpers/tests/utils';

describe('AddMember command', () => {
  let mockSendMessage: jest.Mock;
  let mockGetMessage: jest.Mock;
  let mockListBillingWithMembers: jest.Mock;
  let mockAddMembers: jest.Mock;

  beforeEach(() => {
    mockSendMessage = jest.fn();
    mockGetMessage = jest.fn();
    mockListBillingWithMembers = jest.fn();
    mockAddMembers = jest.fn();

    (globalThis as any).Bot = {
      sendMessage: mockSendMessage,
      getMessage_: mockGetMessage,
    };
    (globalThis as any).Credit = {
      listBillingWithMembers: mockListBillingWithMembers,
      addMembers: mockAddMembers,
    };
    (globalThis as any).COMMAND_HELP = {
      addmember: 'Usage: /addmember <key> <@user1> <@user2>',
    };
  });

  describe('input validation', () => {
    it('should show help message for empty command', () => {
      mockGetMessage.mockReturnValue('');
      globalThis.addMemberHandler(createTelegramMessage('/addmember'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /addmember <key> <@user1> <@user2>',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show help message for missing users', () => {
      mockGetMessage.mockReturnValue('wifi');
      globalThis.addMemberHandler(createTelegramMessage('/addmember wifi'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /addmember <key> <@user1> <@user2>',
        { parse_mode: 'MarkdownV2' }
      );
    });
  });

  describe('billing validation', () => {
    it('should show error when billing not found', () => {
      mockGetMessage.mockReturnValue('wifi @user1 @user2');
      mockListBillingWithMembers.mockReturnValue([]);

      globalThis.addMemberHandler(
        createTelegramMessage('/addmember wifi @user1 @user2')
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
      mockGetMessage.mockReturnValue('wifi @user1 @user2');
      mockListBillingWithMembers.mockReturnValue([
        createBilling({ adminId: 999 }), // Different admin ID
      ]);

      globalThis.addMemberHandler(
        createTelegramMessage('/addmember wifi @user1 @user2')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'punten ari didinya saha? dulur lain'
      );
    });
  });

  describe('member management', () => {
    it('should show error when all users are already members', () => {
      mockGetMessage.mockReturnValue('wifi @user1 @user2');
      mockListBillingWithMembers.mockReturnValue([
        createBilling({
          members: [
            { username: 'user1', balance: 0 },
            { username: 'user2', balance: 0 },
          ],
        }),
      ]);

      globalThis.addMemberHandler(
        createTelegramMessage('/addmember wifi @user1 @user2')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'eta mah atuh geus join kabeh wa :('
      );
      expect(mockAddMembers).not.toHaveBeenCalled();
    });

    it('should add new members successfully', () => {
      mockGetMessage.mockReturnValue('wifi @user1 @user2');
      mockListBillingWithMembers.mockReturnValue([createBilling()]);

      globalThis.addMemberHandler(
        createTelegramMessage('/addmember wifi @user1 @user2')
      );

      expect(mockAddMembers).toHaveBeenCalledWith([
        {
          billingId: { $oid: '123' },
          username: 'user1',
          balance: 0,
        },
        {
          billingId: { $oid: '123' },
          username: 'user2',
          balance: 0,
        },
      ]);
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'berhasil join mamangque :D'
      );
    });

    it('should skip existing members', () => {
      mockGetMessage.mockReturnValue('wifi @user1 @existinguser');
      mockListBillingWithMembers.mockReturnValue([
        createBilling({
          members: [{ username: 'existinguser', balance: 0 }],
        }),
      ]);

      globalThis.addMemberHandler(
        createTelegramMessage('/addmember wifi @user1 @existinguser')
      );

      expect(mockAddMembers).toHaveBeenCalledWith([
        {
          billingId: { $oid: '123' },
          username: 'user1',
          balance: 0,
        },
      ]);
    });

    it('should handle multiple spaces between usernames', () => {
      mockGetMessage.mockReturnValue('wifi   @user1    @user2');
      mockListBillingWithMembers.mockReturnValue([createBilling()]);

      globalThis.addMemberHandler(
        createTelegramMessage('/addmember wifi   @user1    @user2')
      );

      expect(mockAddMembers).toHaveBeenCalledWith([
        {
          billingId: { $oid: '123' },
          username: 'user1',
          balance: 0,
        },
        {
          billingId: { $oid: '123' },
          username: 'user2',
          balance: 0,
        },
      ]);
    });

    it('should handle usernames without @ symbol', () => {
      mockGetMessage.mockReturnValue('wifi user1 @user2');
      mockListBillingWithMembers.mockReturnValue([createBilling()]);

      globalThis.addMemberHandler(
        createTelegramMessage('/addmember wifi user1 @user2')
      );

      expect(mockAddMembers).toHaveBeenCalledWith([
        {
          billingId: { $oid: '123' },
          username: 'user1',
          balance: 0,
        },
        {
          billingId: { $oid: '123' },
          username: 'user2',
          balance: 0,
        },
      ]);
    });
  });
});
