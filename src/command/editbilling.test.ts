import './editbilling';
import {
  createTelegramMessage,
  createBilling,
} from '../01-helpers/tests/utils';

describe('EditBilling command', () => {
  let mockSendMessage: jest.Mock;
  let mockGetMessage: jest.Mock;
  let mockGetBilling: jest.Mock;
  let mockUpdateBilling: jest.Mock;

  beforeEach(() => {
    mockSendMessage = jest.fn();
    mockGetMessage = jest.fn();
    mockGetBilling = jest.fn();
    mockUpdateBilling = jest.fn();

    (globalThis as any).Bot = {
      sendMessage: mockSendMessage,
      getMessage: mockGetMessage,
    };
    (globalThis as any).Billing = {
      getBilling: mockGetBilling,
      updateBilling: mockUpdateBilling,
    };
    (globalThis as any).COMMAND_HELP = {
      editbilling: 'Usage: /editbilling <key> <billingDate> <billingAmount>',
    };
  });

  describe('input validation', () => {
    it('should show help message for invalid format', () => {
      mockGetMessage.mockReturnValue('wifi');
      globalThis.editBillingHandler(createTelegramMessage('/editbilling wifi'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /editbilling <key> <billingDate> <billingAmount>',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show help message for missing amount', () => {
      mockGetMessage.mockReturnValue('wifi 1');
      globalThis.editBillingHandler(
        createTelegramMessage('/editbilling wifi 1')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /editbilling <key> <billingDate> <billingAmount>',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show help message for non-numeric values', () => {
      mockGetMessage.mockReturnValue('wifi abc def');
      globalThis.editBillingHandler(
        createTelegramMessage('/editbilling wifi abc def')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /editbilling <key> <billingDate> <billingAmount>',
        { parse_mode: 'MarkdownV2' }
      );
    });
  });

  describe('billing validation', () => {
    it('should show error when billing not found', () => {
      mockGetMessage.mockReturnValue('wifi 1 100000');
      mockGetBilling.mockReturnValue(null);

      globalThis.editBillingHandler(
        createTelegramMessage('/editbilling wifi 1 100000')
      );

      expect(mockGetBilling).toHaveBeenCalledWith(123456, 'wifi');
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'aku tidak manggih kata kunci `wifi` yang elu cari :\\(',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show error when user is not admin', () => {
      mockGetMessage.mockReturnValue('wifi 1 100000');
      mockGetBilling.mockReturnValue(createBilling({ adminId: 999 })); // Different admin ID

      globalThis.editBillingHandler(
        createTelegramMessage('/editbilling wifi 1 100000')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'punten ari didinya saha? dulur lain'
      );
    });
  });

  describe('billing updates', () => {
    it('should handle successful billing update', () => {
      mockGetMessage.mockReturnValue('wifi 15 150000');
      mockGetBilling.mockReturnValue(createBilling());

      globalThis.editBillingHandler(
        createTelegramMessage('/editbilling wifi 15 150000')
      );

      expect(mockUpdateBilling).toHaveBeenCalledWith({
        _id: '123',
        key: 'wifi',
        groupId: 123456,
        billingDate: 15,
        billingAmount: 150000,
        adminId: 789,
      });
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'sudah diedit mamangque :D'
      );
    });
  });
});
