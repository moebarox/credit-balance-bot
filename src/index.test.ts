import './index';

describe('Telegram Bot Webhook', () => {
  let mockSendMessage: jest.Mock;
  let mockGetCommand: jest.Mock;
  let mockAboutHandler: jest.Mock;
  let mockNewBillingHandler: jest.Mock;
  let mockEditBillingHandler: jest.Mock;
  let mockDeleteBillingHandler: jest.Mock;
  let mockJoinHandler: jest.Mock;
  let mockShowBalanceHandler: jest.Mock;
  let mockEditBalanceHandler: jest.Mock;
  let mockAddMemberHandler: jest.Mock;
  let mockRemoveMemberHandler: jest.Mock;

  beforeEach(() => {
    mockSendMessage = jest.fn();
    mockGetCommand = jest.fn();
    mockAboutHandler = jest.fn();
    mockNewBillingHandler = jest.fn();
    mockEditBillingHandler = jest.fn();
    mockDeleteBillingHandler = jest.fn();
    mockJoinHandler = jest.fn();
    mockShowBalanceHandler = jest.fn();
    mockEditBalanceHandler = jest.fn();
    mockAddMemberHandler = jest.fn();
    mockRemoveMemberHandler = jest.fn();

    (globalThis as any).Bot = {
      sendMessage: mockSendMessage,
      getCommand_: mockGetCommand,
    };
    (globalThis as any).aboutHandler = mockAboutHandler;
    (globalThis as any).newBillingHandler = mockNewBillingHandler;
    (globalThis as any).editBillingHandler = mockEditBillingHandler;
    (globalThis as any).deleteBillingHandler = mockDeleteBillingHandler;
    (globalThis as any).joinHandler = mockJoinHandler;
    (globalThis as any).showBalanceHandler = mockShowBalanceHandler;
    (globalThis as any).editBalanceHandler = mockEditBalanceHandler;
    (globalThis as any).addMemberHandler = mockAddMemberHandler;
    (globalThis as any).removeMemberHandler = mockRemoveMemberHandler;
    (globalThis as any).BOT_ADMIN_ID = 123456;
  });

  describe('doPost', () => {
    it('should ignore requests without message text', () => {
      const event = {
        postData: {
          contents: JSON.stringify({ message: {} }),
        },
      } as GoogleAppsScript.Events.DoPost;

      globalThis.doPost(event);

      expect(mockGetCommand).not.toHaveBeenCalled();
    });

    it('should handle about command', () => {
      const data = {
        message: {
          chat: { id: 789 },
          text: '/about',
        },
      };
      const event = {
        postData: {
          contents: JSON.stringify(data),
        },
      } as GoogleAppsScript.Events.DoPost;

      mockGetCommand.mockReturnValue('about');

      globalThis.doPost(event);

      expect(mockAboutHandler).toHaveBeenCalledWith(data);
    });

    it('should handle newbilling command', () => {
      const message = {
        chat: { id: 789 },
        text: '/newbilling wifi 15 100000',
      };
      const event = {
        postData: {
          contents: JSON.stringify({ message }),
        },
      } as GoogleAppsScript.Events.DoPost;

      mockGetCommand.mockReturnValue('newbilling');

      globalThis.doPost(event);

      expect(mockNewBillingHandler).toHaveBeenCalledWith(message);
    });

    it('should handle error and notify admin', () => {
      const message = {
        chat: { id: 789 },
        text: '/about',
      };
      const event = {
        postData: {
          contents: JSON.stringify({ message }),
        },
      } as GoogleAppsScript.Events.DoPost;

      mockGetCommand.mockReturnValue('about');
      mockAboutHandler.mockImplementation(() => {
        throw new Error('Test error');
      });

      globalThis.doPost(event);

      expect(mockSendMessage).toHaveBeenCalledWith(
        123456,
        'Error: Error: Test error'
      );
    });

    it('should ignore unknown commands', () => {
      const message = {
        chat: { id: 789 },
        text: '/unknown',
      };
      const event = {
        postData: {
          contents: JSON.stringify({ message }),
        },
      } as GoogleAppsScript.Events.DoPost;

      mockGetCommand.mockReturnValue('unknown');

      globalThis.doPost(event);

      expect(mockAboutHandler).not.toHaveBeenCalled();
      expect(mockNewBillingHandler).not.toHaveBeenCalled();
      expect(mockEditBillingHandler).not.toHaveBeenCalled();
      expect(mockDeleteBillingHandler).not.toHaveBeenCalled();
      expect(mockJoinHandler).not.toHaveBeenCalled();
      expect(mockShowBalanceHandler).not.toHaveBeenCalled();
      expect(mockEditBalanceHandler).not.toHaveBeenCalled();
      expect(mockAddMemberHandler).not.toHaveBeenCalled();
      expect(mockRemoveMemberHandler).not.toHaveBeenCalled();
    });
  });

  describe('debug', () => {
    it('should simulate a showbalance command', () => {
      mockGetCommand.mockReturnValue('showbalance');

      globalThis.debug();

      expect(mockShowBalanceHandler).toHaveBeenCalledWith({
        chat: {
          id: -256622337,
          type: 'group',
        },
        from: {
          id: 123456,
        },
        text: '/showbalance',
      });
    });
  });
});
