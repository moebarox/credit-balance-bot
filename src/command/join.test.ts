import './join';
import {
  createTelegramMessage,
  createBilling,
} from '../01-helpers/tests/utils';

describe('Join command', () => {
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
    (globalThis as any).Billing = {
      listBillingWithMembers: mockListBillingWithMembers,
      addMembers: mockAddMembers,
    };
    (globalThis as any).COMMAND_HELP = {
      join: 'Usage: /join <key>',
    };
  });

  describe('input validation', () => {
    it('should show help message for empty command', () => {
      mockGetMessage.mockReturnValue('');
      globalThis.joinHandler(createTelegramMessage('/join'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /join <key>',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show help message for invalid format', () => {
      mockGetMessage.mockReturnValue('wifi test');
      globalThis.joinHandler(createTelegramMessage('/join wifi test'));

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

      globalThis.joinHandler(createTelegramMessage('/join wifi'));

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

      globalThis.joinHandler(createTelegramMessage('/join wifi'));

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

      globalThis.joinHandler(createTelegramMessage('/join wifi'));

      expect(mockAddMembers).toHaveBeenCalledWith('123', [
        {
          username: 'testuser',
          balance: 0,
        },
      ]);
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'berhasil join mamangque :D'
      );
    });
  });
});
