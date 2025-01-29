import './bot';

describe('Bot library', () => {
  describe('getCommand', () => {
    it('should extract command from text', () => {
      expect(globalThis.Bot.getCommand('/start')).toBe('start');
      expect(globalThis.Bot.getCommand('/help')).toBe('help');
      expect(globalThis.Bot.getCommand('/balance')).toBe('balance');
    });

    it('should handle commands with bot username', () => {
      expect(globalThis.Bot.getCommand('/start@mybot')).toBe('start');
      expect(globalThis.Bot.getCommand('/help@testbot')).toBe('help');
    });

    it('should handle commands with arguments', () => {
      expect(globalThis.Bot.getCommand('/start argument')).toBe('start');
      expect(globalThis.Bot.getCommand('/help with some args')).toBe('help');
    });

    it('should return empty string for invalid commands', () => {
      expect(globalThis.Bot.getCommand('not a command')).toBe('');
      expect(globalThis.Bot.getCommand('')).toBe('');
    });
  });

  describe('getMessage', () => {
    it('should extract message from command text', () => {
      expect(globalThis.Bot.getMessage('/start hello')).toBe('hello');
      expect(globalThis.Bot.getMessage('/help world')).toBe('world');
    });

    it('should handle commands with bot username', () => {
      expect(globalThis.Bot.getMessage('/start@mybot hello')).toBe('hello');
      expect(globalThis.Bot.getMessage('/help@testbot world')).toBe('world');
    });

    it('should handle empty messages', () => {
      expect(globalThis.Bot.getMessage('/start')).toBe('');
      expect(globalThis.Bot.getMessage('/help@testbot')).toBe('');
    });

    it('should handle messages with multiple spaces', () => {
      expect(globalThis.Bot.getMessage('/start  hello  world ')).toBe(
        'hello  world'
      );
      expect(globalThis.Bot.getMessage('/help   test   message')).toBe(
        'test   message'
      );
    });
  });

  describe('sendMessage', () => {
    let mockFetch: jest.Mock;

    beforeEach(() => {
      mockFetch = jest.fn();
      (globalThis as any).UrlFetchApp = {
        fetch: mockFetch,
      };
      (globalThis as any).BOT_TOKEN = 'test_token';
    });

    it('should send text message', () => {
      globalThis.Bot.sendMessage(123456, 'test message');

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.telegram.org/bottest_token/sendMessage',
        {
          method: 'post',
          payload: {
            chat_id: '123456',
            text: 'test message',
          },
        }
      );
    });

    it('should join array messages with newline', () => {
      globalThis.Bot.sendMessage(123456, ['line 1', 'line 2']);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.telegram.org/bottest_token/sendMessage',
        {
          method: 'post',
          payload: {
            chat_id: '123456',
            text: 'line 1\nline 2',
          },
        }
      );
    });

    it('should include additional payload options', () => {
      globalThis.Bot.sendMessage(123456, 'test', { parse_mode: 'HTML' });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.telegram.org/bottest_token/sendMessage',
        {
          method: 'post',
          payload: {
            chat_id: '123456',
            text: 'test',
            parse_mode: 'HTML',
          },
        }
      );
    });

    it('should send error message to admin if request fails', () => {
      const error = new Error('Test error');
      mockFetch.mockImplementationOnce(() => {
        throw error;
      });
      (globalThis as any).BOT_ADMIN_ID = '789';

      globalThis.Bot.sendMessage(123456, 'test');

      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://api.telegram.org/bottest_token/sendMessage',
        {
          method: 'post',
          payload: {
            chat_id: '789',
            text: 'Test error',
          },
        }
      );
    });

    it('should not send error message if admin ID is not set', () => {
      const error = new Error('Test error');
      mockFetch.mockImplementationOnce(() => {
        throw error;
      });
      (globalThis as any).BOT_ADMIN_ID = '';

      globalThis.Bot.sendMessage(123456, 'test');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
