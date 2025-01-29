import './billing';
import '../00-constants/db';

describe('Billing library', () => {
  beforeEach(() => {
    // Mock ENV variables
    (globalThis as any).DB_CONNECTION = 'mongodb';

    // Mock MongoDB functions
    (globalThis as any).MongoDB = {
      aggregate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
      insertMany: jest.fn(),
      deleteMany: jest.fn(),
      insertOne: jest.fn(),
    };

    // Mock NumberHelper
    (globalThis as any).NumberHelper = {
      toCurrency: jest.fn((num) => `Rp ${num}`),
    };

    // Mock DateHelper
    (globalThis as any).DateHelper = {
      toMonthYear: jest.fn(() => 'Maret 2024'),
    };
  });

  describe('listBillingWithMembers', () => {
    it('should fetch billings with members using aggregation', () => {
      const mockBillings = [
        {
          _id: '1',
          key: 'wifi',
          billingAmount: 100000,
          billingDate: 1,
          adminId: 123,
          groupId: 123,
          members: [],
        },
      ];
      (globalThis.MongoDB.aggregate as jest.Mock).mockReturnValue(mockBillings);

      const result = globalThis.Billing.listBillingWithMembers({
        groupId: 123,
      });

      expect(globalThis.MongoDB.aggregate).toHaveBeenCalledWith('billings', [
        {
          $match: {
            groupId: {
              $numberLong: '123',
            },
          },
        },
        {
          $lookup: {
            from: 'members',
            localField: '_id',
            foreignField: 'billingId',
            as: 'members',
          },
        },
      ]);
      expect(result).toEqual(mockBillings);
    });

    it('should handle query without groupId', () => {
      const mockBillings = [
        {
          _id: '1',
          key: 'wifi',
          billingAmount: 100000,
          billingDate: 1,
          adminId: 123,
          groupId: 123,
          members: [],
        },
      ];
      (globalThis.MongoDB.aggregate as jest.Mock).mockReturnValue(mockBillings);

      const result = globalThis.Billing.listBillingWithMembers({
        billingDate: { $in: [1, 2] },
      });

      expect(globalThis.MongoDB.aggregate).toHaveBeenCalledWith('billings', [
        {
          $match: {
            billingDate: { $in: [1, 2] },
          },
        },
        {
          $lookup: {
            from: 'members',
            localField: '_id',
            foreignField: 'billingId',
            as: 'members',
          },
        },
      ]);
      expect(result).toEqual(mockBillings);
    });
  });

  describe('getBilling', () => {
    it('should fetch a single billing by group ID and key', () => {
      const mockBilling = {
        _id: '1',
        key: 'wifi',
        billingAmount: 100000,
        billingDate: 1,
        adminId: 123,
        groupId: 123,
      };
      (globalThis.MongoDB.findOne as jest.Mock).mockReturnValue(mockBilling);

      const result = globalThis.Billing.getBilling(123, 'wifi');

      expect(globalThis.MongoDB.findOne).toHaveBeenCalledWith('billings', {
        key: 'wifi',
        groupId: {
          $numberLong: '123',
        },
      });
      expect(result).toEqual(mockBilling);
    });
  });

  describe('generateUserBalance', () => {
    it('should format member balances', () => {
      const members = [
        { username: 'user1', balance: 50000 },
        { username: 'user2', balance: 75000 },
      ];

      const result = globalThis.Billing.generateUserBalance(members);

      expect(result).toEqual(['@user1: Rp 50000', '@user2: Rp 75000']);
      expect(globalThis.NumberHelper.toCurrency).toHaveBeenCalledWith(50000);
      expect(globalThis.NumberHelper.toCurrency).toHaveBeenCalledWith(75000);
    });
  });

  describe('generateBalanceMessage', () => {
    it('should generate credit balance message', () => {
      const billing = {
        key: 'wifi',
        billingAmount: 100000,
        billingDate: 1,
        adminId: 123,
        groupId: 123,
      };
      const members = [
        { username: 'user1', balance: 50000 },
        { username: 'user2', balance: 75000 },
      ];

      const result = globalThis.Billing.generateBalanceMessage(
        billing,
        members
      );

      expect(result).toEqual([
        'saldo wifi Maret 2024',
        '---',
        '@user1: Rp 50000\n@user2: Rp 75000',
        '---',
        'tagihan Rp 100000 (Rp 50000 / orang) tiap tanggal 1',
      ]);
    });
  });

  describe('updateBalance', () => {
    it('should update balance for specified users', () => {
      const billing = {
        _id: '123',
        key: 'wifi',
        billingAmount: 100000,
        billingDate: 1,
        adminId: 123,
        groupId: 123,
      };
      const members = [
        { username: 'user1', balance: 50000 },
        { username: 'user2', balance: 75000 },
      ];
      (globalThis.MongoDB.find as jest.Mock)
        .mockReturnValueOnce(members) // First call for listMembers
        .mockReturnValueOnce([{ username: 'user1', balance: 100000 }]); // Second call for success result

      const result = globalThis.Billing.updateBalance(
        billing,
        ['@user1'],
        50000
      );

      expect(globalThis.MongoDB.updateOne).toHaveBeenCalledWith(
        'members',
        {
          username: 'user1',
          billingId: { $oid: '123' },
        },
        {
          $set: {
            balance: 100000,
          },
        }
      );
      expect(result).toEqual({
        success: [{ username: 'user1', balance: 100000 }],
        failed: [],
      });
    });

    it('should handle "all" users update', () => {
      const billing = {
        _id: '123',
        key: 'wifi',
        billingAmount: 100000,
        billingDate: 1,
        adminId: 123,
        groupId: 123,
      };
      const members = [
        { username: 'user1', balance: 50000 },
        { username: 'user2', balance: 75000 },
      ];
      (globalThis.MongoDB.find as jest.Mock)
        .mockReturnValueOnce(members) // First call for listMembers
        .mockReturnValueOnce(
          members.map((m) => ({ ...m, balance: m.balance + 50000 }))
        ); // Second call for success result

      const result = globalThis.Billing.updateBalance(billing, ['all'], 50000);

      expect(globalThis.MongoDB.updateOne).toHaveBeenCalledTimes(2);
      expect(result.success).toHaveLength(2);
      expect(result.failed).toHaveLength(0);
    });

    it('should handle non-existent users', () => {
      const billing = {
        _id: '123',
        key: 'wifi',
        billingAmount: 100000,
        billingDate: 1,
        adminId: 123,
        groupId: 123,
      };
      const members = [{ username: 'user1', balance: 50000 }];
      (globalThis.MongoDB.find as jest.Mock)
        .mockReturnValueOnce(members) // First call for listMembers
        .mockReturnValueOnce([{ username: 'user1', balance: 100000 }]); // Second call for success result

      const result = globalThis.Billing.updateBalance(
        billing,
        ['@user1', '@nonexistent'],
        50000
      );

      expect(result).toEqual({
        success: [{ username: 'user1', balance: 100000 }],
        failed: [{ username: 'nonexistent', code: 'USER_NOT_FOUND' }],
      });
    });
  });

  describe('addMembers', () => {
    it('should insert multiple members into the database', () => {
      const mockMembers = [
        {
          username: 'user1',
          balance: 0,
        },
        {
          username: 'user2',
          balance: 0,
        },
      ];

      globalThis.Billing.addMembers('123', mockMembers);

      expect(globalThis.MongoDB.insertMany).toHaveBeenCalledWith(
        'members',
        mockMembers.map((m) => ({
          ...m,
          billingId: { $oid: '123' },
        }))
      );
    });

    it('should handle empty members array', () => {
      globalThis.Billing.addMembers('123', []);

      expect(globalThis.MongoDB.insertMany).toHaveBeenCalledWith('members', []);
    });
  });

  describe('deleteBilling', () => {
    it('should delete billing and its members', () => {
      const billingId = '123';
      (globalThis.MongoDB.deleteMany as jest.Mock).mockReturnValue({
        deletedCount: 1,
      });

      globalThis.Billing.deleteBilling(billingId);

      expect(globalThis.MongoDB.deleteMany).toHaveBeenCalledWith('billings', {
        _id: { $oid: billingId },
      });
      expect(globalThis.MongoDB.deleteMany).toHaveBeenCalledWith('members', {
        billingId: { $oid: billingId },
      });
    });
  });

  describe('deleteMembers', () => {
    it('should delete specified members from a billing', () => {
      const members = [
        {
          billingId: '123',
          username: 'user1',
          balance: 0,
        },
        {
          billingId: '123',
          username: 'user2',
          balance: 0,
        },
      ];

      globalThis.Billing.deleteMembers('123', members);

      expect(globalThis.MongoDB.deleteMany).toHaveBeenCalledWith('members', {
        billingId: {
          $oid: '123',
        },
        username: {
          $in: ['user1', 'user2'],
        },
      });
    });

    it('should handle single member deletion', () => {
      const members = [
        {
          billingId: '123',
          username: 'user1',
          balance: 0,
        },
      ];

      globalThis.Billing.deleteMembers('123', members);

      expect(globalThis.MongoDB.deleteMany).toHaveBeenCalledWith('members', {
        billingId: {
          $oid: '123',
        },
        username: {
          $in: ['user1'],
        },
      });
    });
  });

  describe('createBilling', () => {
    it('should create a new billing', () => {
      const billing = {
        key: 'wifi',
        billingDate: 15,
        billingAmount: 100000,
        adminId: 123,
        groupId: 456,
        members: [
          {
            username: 'testuser',
            balance: 0,
          },
        ],
      };
      (globalThis.MongoDB.insertOne as jest.Mock).mockReturnValue('new_id');

      globalThis.Billing.createBilling(billing);

      expect(globalThis.MongoDB.insertOne).toHaveBeenCalledWith('billings', {
        key: 'wifi',
        billingDate: 15,
        billingAmount: 100000,
        adminId: 123,
        groupId: {
          $numberLong: '456',
        },
      });

      expect(globalThis.MongoDB.insertMany).toHaveBeenCalledWith('members', [
        {
          billingId: { $oid: 'new_id' },
          username: 'testuser',
          balance: 0,
        },
      ]);
    });
  });

  describe('updateBilling', () => {
    it('should update an existing billing', () => {
      const billing = {
        _id: '123',
        key: 'wifi',
        billingDate: 15,
        billingAmount: 100000,
        adminId: 123,
        groupId: 456,
      };

      globalThis.Billing.updateBilling(billing);

      expect(globalThis.MongoDB.updateOne).toHaveBeenCalledWith(
        'billings',
        {
          _id: { $oid: '123' },
        },
        {
          key: 'wifi',
          billingDate: 15,
          billingAmount: 100000,
          adminId: 123,
          groupId: {
            $numberLong: '456',
          },
        }
      );
    });

    it('should handle billing update with different values', () => {
      const billing = {
        _id: '123',
        key: 'internet',
        billingDate: 1,
        billingAmount: 200000,
        adminId: 789,
        groupId: 999,
      };

      globalThis.Billing.updateBilling(billing);

      expect(globalThis.MongoDB.updateOne).toHaveBeenCalledWith(
        'billings',
        {
          _id: { $oid: '123' },
        },
        {
          key: 'internet',
          billingDate: 1,
          billingAmount: 200000,
          adminId: 789,
          groupId: {
            $numberLong: '999',
          },
        }
      );
    });
  });
});
