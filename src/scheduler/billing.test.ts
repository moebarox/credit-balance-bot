import './billing';
import { createBilling } from '../01-helpers/tests/utils';

describe('Billing Scheduler', () => {
  let mockSendMessage: jest.Mock;
  let mockListBillingWithMembers: jest.Mock;
  let mockUpdateBalance: jest.Mock;
  let mockGenerateUserBalance: jest.Mock;
  let mockGenerateCreditBalance: jest.Mock;
  let mockIsLeapYear: jest.Mock;
  let originalDate: DateConstructor;

  beforeEach(() => {
    mockSendMessage = jest.fn();
    mockListBillingWithMembers = jest.fn();
    mockUpdateBalance = jest.fn();
    mockGenerateUserBalance = jest.fn();
    mockGenerateCreditBalance = jest.fn();
    mockIsLeapYear = jest.fn();

    (globalThis as any).Bot = {
      sendMessage: mockSendMessage,
    };
    (globalThis as any).Credit = {
      listBillingWithMembers: mockListBillingWithMembers,
      updateBalance: mockUpdateBalance,
      generateUserBalance: mockGenerateUserBalance,
      generateCreditBalance: mockGenerateCreditBalance,
    };
    (globalThis as any).DateHelper = {
      isLeapYear: mockIsLeapYear,
    };

    // Store original Date
    originalDate = globalThis.Date;
  });

  afterEach(() => {
    // Restore original Date
    globalThis.Date = originalDate;
    jest.useRealTimers();
  });

  describe('date matching', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should handle billing on current date', () => {
      jest.setSystemTime(new Date('2023-02-15T01:00:00Z'));

      const billing = createBilling({
        billingDate: 15,
        members: [
          { username: 'user1', balance: 50000 },
          { username: 'user2', balance: 50000 },
        ],
      });
      mockListBillingWithMembers.mockReturnValue([billing]);
      mockGenerateCreditBalance.mockReturnValue('Credit Balance Message');

      globalThis.billingScheduler();

      expect(mockListBillingWithMembers).toHaveBeenCalledWith({
        billingDate: { $in: [15, 16] },
      });
      expect(mockUpdateBalance).toHaveBeenCalledWith(billing, ['all'], -50000);
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Credit Balance Message'
      );
    });

    it('should handle February billing dates in non-leap year', () => {
      jest.setSystemTime(new Date('2023-02-28T01:00:00Z'));

      const billing = createBilling({
        billingDate: 30, // Will be adjusted to 28
        members: [{ username: 'user1', balance: 100000 }],
      });
      mockListBillingWithMembers.mockReturnValue([billing]);
      mockIsLeapYear.mockReturnValue(false);

      globalThis.billingScheduler();

      expect(mockUpdateBalance).toHaveBeenCalledWith(billing, ['all'], -100000);
    });

    it('should handle February billing dates in leap year', () => {
      jest.setSystemTime(new Date('2024-02-29T01:00:00Z'));

      const billing = createBilling({
        billingDate: 30, // Will be adjusted to 29
        members: [{ username: 'user1', balance: 100000 }],
      });
      mockListBillingWithMembers.mockReturnValue([billing]);
      mockIsLeapYear.mockReturnValue(true);

      globalThis.billingScheduler();

      expect(mockUpdateBalance).toHaveBeenCalledWith(billing, ['all'], -100000);
    });
  });

  describe('reminders', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should send reminder for insufficient balance', () => {
      jest.setSystemTime(new Date('2024-02-15T01:00:00Z'));

      const billing = createBilling({
        billingDate: 16, // Tomorrow
        members: [
          { username: 'user1', balance: 10000 }, // Insufficient
          { username: 'user2', balance: 100000 }, // Sufficient
        ],
      });
      mockListBillingWithMembers.mockReturnValue([billing]);
      mockGenerateUserBalance.mockReturnValue(['@user1: Rp 10.000']);

      globalThis.billingScheduler();

      expect(mockSendMessage).toHaveBeenCalledWith(123456, [
        'saldo mamang jigana kurang yeuh buat tagihan besok :(',
        '---',
        '@user1: Rp 10.000',
        '---',
        'rada di topup atuh ya ditunggu sebelum besok',
      ]);
    });

    it('should not send reminder when all balances are sufficient', () => {
      jest.setSystemTime(new Date('2024-02-15T01:00:00Z'));

      const billing = createBilling({
        billingDate: 16,
        billingAmount: 100000,
        members: [
          { username: 'user1', balance: 100000 },
          { username: 'user2', balance: 100000 },
        ],
      });
      mockListBillingWithMembers.mockReturnValue([billing]);

      globalThis.billingScheduler();

      expect(mockGenerateUserBalance).not.toHaveBeenCalled();
      expect(mockSendMessage).not.toHaveBeenCalled();
    });
  });

  describe('balance deduction', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should deduct balance equally among members', () => {
      jest.setSystemTime(new Date('2024-02-15T01:00:00Z'));

      const billing = createBilling({
        billingDate: 15,
        billingAmount: 100000,
        members: [
          { username: 'user1', balance: 60000 },
          { username: 'user2', balance: 60000 },
        ],
      });
      mockListBillingWithMembers.mockReturnValue([billing]);
      mockGenerateCreditBalance.mockReturnValue('Credit Balance Message');

      globalThis.billingScheduler();

      expect(mockUpdateBalance).toHaveBeenCalledWith(billing, ['all'], -50000); // 100000 / 2
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Credit Balance Message'
      );
    });

    it('should handle multiple billings on the same day', () => {
      jest.setSystemTime(new Date('2024-02-15T01:00:00Z'));

      const billing1 = createBilling({
        billingDate: 15,
        billingAmount: 100000,
        members: [{ username: 'user1', balance: 100000 }],
      });
      const billing2 = createBilling({
        _id: '456',
        key: 'internet',
        billingDate: 15,
        billingAmount: 200000,
        members: [{ username: 'user1', balance: 200000 }],
      });
      mockListBillingWithMembers.mockReturnValue([billing1, billing2]);
      mockGenerateCreditBalance
        .mockReturnValueOnce('Credit Balance Message 1')
        .mockReturnValueOnce('Credit Balance Message 2');

      globalThis.billingScheduler();

      expect(mockUpdateBalance).toHaveBeenCalledWith(
        billing1,
        ['all'],
        -100000
      );
      expect(mockUpdateBalance).toHaveBeenCalledWith(
        billing2,
        ['all'],
        -200000
      );
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Credit Balance Message 1'
      );
      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Credit Balance Message 2'
      );
    });
  });
});
