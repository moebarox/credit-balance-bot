import './newbilling';
import { createTelegramMessage } from '../01-helpers/tests/utils';

describe('NewBilling command', () => {
  let mockSendMessage: jest.Mock;
  let mockGetMessage: jest.Mock;
  let mockGetBilling: jest.Mock;
  let mockCreateBilling: jest.Mock;

  beforeEach(() => {
    mockSendMessage = jest.fn();
    mockGetMessage = jest.fn();
    mockGetBilling = jest.fn();
    mockCreateBilling = jest.fn();

    (globalThis as any).Bot = {
      sendMessage: mockSendMessage,
      getMessage: mockGetMessage,
    };
    (globalThis as any).Billing = {
      getBilling: mockGetBilling,
      createBilling: mockCreateBilling,
    };
    (globalThis as any).COMMAND_HELP = {
      newbilling: 'Usage: /newbilling <key> <billingDate> <billingAmount>',
    };
  });

  describe('room validation', () => {
    it('should show error for private chat', () => {
      mockGetMessage.mockReturnValue('wifi 1 100000');
      globalThis.newBillingHandler(
        createTelegramMessage('/newbilling wifi 1 100000', {
          chat: { type: 'private' },
        })
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'hanya bisa di group bosque :\\(',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should allow supergroup chat', () => {
      mockGetMessage.mockReturnValue('wifi 1 100000');
      mockGetBilling.mockReturnValue(null);
      mockCreateBilling.mockReturnValue('new_billing_id');

      globalThis.newBillingHandler(
        createTelegramMessage('/newbilling wifi 1 100000', {
          chat: { type: 'supergroup' },
        })
      );

      expect(mockCreateBilling).toHaveBeenCalled();
    });
  });

  describe('input validation', () => {
    it('should show help message for empty command', () => {
      mockGetMessage.mockReturnValue('');
      globalThis.newBillingHandler(createTelegramMessage('/newbilling'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /newbilling <key> <billingDate> <billingAmount>',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show help message for missing amount', () => {
      mockGetMessage.mockReturnValue('wifi 1');
      globalThis.newBillingHandler(createTelegramMessage('/newbilling wifi 1'));

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /newbilling <key> <billingDate> <billingAmount>',
        { parse_mode: 'MarkdownV2' }
      );
    });

    it('should show help message for non-numeric values', () => {
      mockGetMessage.mockReturnValue('wifi abc def');
      globalThis.newBillingHandler(
        createTelegramMessage('/newbilling wifi abc def')
      );

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Usage: /newbilling <key> <billingDate> <billingAmount>',
        { parse_mode: 'MarkdownV2' }
      );
    });
  });

  describe('billing validation', () => {
    it('should show error when billing key already exists', () => {
      mockGetMessage.mockReturnValue('wifi 1 100000');
      mockGetBilling.mockReturnValue({ key: 'wifi' });

      globalThis.newBillingHandler(
        createTelegramMessage('/newbilling wifi 1 100000')
      );

      expect(mockGetBilling).toHaveBeenCalledWith(123456, 'wifi');
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'kata kunci `wifi` sudah ada bosque, jangan buat yang sama ya, da bageur :\\(',
        { parse_mode: 'MarkdownV2' }
      );
    });
  });

  describe('billing creation', () => {
    it('should handle successful billing creation', () => {
      mockGetMessage.mockReturnValue('wifi 15 150000');
      mockGetBilling.mockReturnValue(null);
      mockCreateBilling.mockReturnValue('new_billing_id');

      globalThis.newBillingHandler(
        createTelegramMessage('/newbilling wifi 15 150000')
      );

      expect(mockCreateBilling).toHaveBeenCalledWith({
        key: 'wifi',
        billingDate: 15,
        billingAmount: 150000,
        adminId: 789,
        groupId: 123456,
        members: [
          {
            username: 'testuser',
            balance: 0,
          },
        ],
      });

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        [
          'sudah jadi mamangque :D',
          'yang mau gabung tinggal kirim command `/join wifi`',
        ],
        { parse_mode: 'MarkdownV2' }
      );
    });
  });
});
