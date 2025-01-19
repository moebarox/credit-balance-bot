import './credit';

describe('Credit library', () => {
  beforeEach(() => {
    // Mock MongoDB functions
    (globalThis as any).MongoDB = {
      aggregate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
      insertMany: jest.fn(),
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
        },
      ];
      (globalThis.MongoDB.aggregate as jest.Mock).mockReturnValue(mockBillings);

      const result = globalThis.Credit.listBillingWithMembers({ groupId: 123 });

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

      const result = globalThis.Credit.getBilling(123, 'wifi');

      expect(globalThis.MongoDB.findOne).toHaveBeenCalledWith('billings', {
        key: 'wifi',
        groupId: {
          $numberLong: '123',
        },
      });
      expect(result).toEqual(mockBilling);
    });
  });

  describe('listMembers', () => {
    it('should fetch members by billing ID', () => {
      const mockMembers = [
        { username: 'user1', balance: 50000 },
        { username: 'user2', balance: 75000 },
      ];
      (globalThis.MongoDB.find as jest.Mock).mockReturnValue(mockMembers);

      const result = globalThis.Credit.listMembers('123');

      expect(globalThis.MongoDB.find).toHaveBeenCalledWith('members', {
        billingId: { $oid: '123' },
      });
      expect(result).toEqual(mockMembers);
    });
  });

  describe('generateUserBalance', () => {
    it('should format member balances', () => {
      const members = [
        { username: 'user1', balance: 50000 },
        { username: 'user2', balance: 75000 },
      ];

      const result = globalThis.Credit.generateUserBalance(members);

      expect(result).toEqual(['@user1: Rp 50000', '@user2: Rp 75000']);
      expect(globalThis.NumberHelper.toCurrency).toHaveBeenCalledWith(50000);
      expect(globalThis.NumberHelper.toCurrency).toHaveBeenCalledWith(75000);
    });
  });

  describe('generateCreditBalance', () => {
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

      const result = globalThis.Credit.generateCreditBalance(billing, members);

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

      const result = globalThis.Credit.updateBalance(
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

      const result = globalThis.Credit.updateBalance(billing, ['all'], 50000);

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

      const result = globalThis.Credit.updateBalance(
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
          billingId: { $oid: '123' },
          username: 'user1',
          balance: 0,
        },
        {
          billingId: { $oid: '123' },
          username: 'user2',
          balance: 0,
        },
      ];

      globalThis.Credit.addMembers(mockMembers);

      expect(globalThis.MongoDB.insertMany).toHaveBeenCalledWith(
        'members',
        mockMembers
      );
    });

    it('should handle empty members array', () => {
      globalThis.Credit.addMembers([]);

      expect(globalThis.MongoDB.insertMany).toHaveBeenCalledWith('members', []);
    });
  });
});
