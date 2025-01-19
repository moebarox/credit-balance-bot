import './showbalance';
import {
  createTelegramMessage,
  createBilling,
} from '../01-helpers/tests/utils';

describe('ShowBalance command', () => {
  let mockSendMessage: jest.Mock;
  let mockGetMessage: jest.Mock;
  let mockListBillingWithMembers: jest.Mock;
  let mockGenerateCreditBalance: jest.Mock;

  beforeEach(() => {
    mockSendMessage = jest.fn();
    mockGetMessage = jest.fn();
    mockListBillingWithMembers = jest.fn();
    mockGenerateCreditBalance = jest.fn();

    (globalThis as any).Bot = {
      sendMessage: mockSendMessage,
      getMessage_: mockGetMessage,
    };
    (globalThis as any).Credit = {
      listBillingWithMembers: mockListBillingWithMembers,
      generateCreditBalance: mockGenerateCreditBalance,
    };
    (globalThis as any).COMMAND_HELP = {
      showbalance: 'Usage: /showbalance [key]',
    };
  });

  describe('show all balances', () => {
    it('should show all credit balances when no key provided', () => {
      const billings = [
        createBilling({
          key: 'wifi',
          members: [{ username: 'user1', balance: 1000 }],
        }),
        createBilling({
          key: 'listrik',
          members: [{ username: 'user2', balance: 2000 }],
        }),
      ];
      mockGetMessage.mockReturnValue('');
      mockListBillingWithMembers.mockReturnValue(billings);
      mockGenerateCreditBalance
        .mockReturnValueOnce('Wifi Balance Message')
        .mockReturnValueOnce('Listrik Balance Message');

      globalThis.showBalanceHandler(createTelegramMessage('/showbalance'));

      expect(mockListBillingWithMembers).toHaveBeenCalledWith({
        groupId: 123456,
      });
      expect(mockGenerateCreditBalance).toHaveBeenCalledTimes(2);
      expect(mockSendMessage).toHaveBeenCalledTimes(2);
      expect(mockSendMessage).toHaveBeenNthCalledWith(
        1,
        123456,
        'Wifi Balance Message'
      );
      expect(mockSendMessage).toHaveBeenNthCalledWith(
        2,
        123456,
        'Listrik Balance Message'
      );
    });

    it('should handle empty billing list', () => {
      mockGetMessage.mockReturnValue('');
      mockListBillingWithMembers.mockReturnValue([]);

      globalThis.showBalanceHandler(createTelegramMessage('/showbalance'));

      expect(mockListBillingWithMembers).toHaveBeenCalledWith({
        groupId: 123456,
      });
      expect(mockGenerateCreditBalance).not.toHaveBeenCalled();
      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('input validation', () => {
    it('should show help message for invalid format', () => {
      mockGetMessage.mockReturnValue('wifi test');
      globalThis.showBalanceHandler(
        createTelegramMessage('/showbalance wifi test')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /showbalance [key]',
        { parse_mode: 'MarkdownV2' }
      );
    });
  });

  describe('specific billing balance', () => {
    it('should show error when billing not found', () => {
      mockGetMessage.mockReturnValue('wifi');
      mockListBillingWithMembers.mockReturnValue([]);

      globalThis.showBalanceHandler(createTelegramMessage('/showbalance wifi'));

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

    it('should show specific billing balance', () => {
      const billing = createBilling({
        members: [
          { username: 'user1', balance: 1000 },
          { username: 'user2', balance: 2000 },
        ],
      });
      mockGetMessage.mockReturnValue('wifi');
      mockListBillingWithMembers.mockReturnValue([billing]);
      mockGenerateCreditBalance.mockReturnValue('Wifi Balance Message');

      globalThis.showBalanceHandler(createTelegramMessage('/showbalance wifi'));

      expect(mockListBillingWithMembers).toHaveBeenCalledWith({
        groupId: 123456,
        key: 'wifi',
      });
      expect(mockGenerateCreditBalance).toHaveBeenCalledWith(
        billing,
        billing.members
      );
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Wifi Balance Message'
      );
    });
  });
});
