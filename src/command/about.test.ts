import './about';

describe('About command', () => {
  let mockSendMessage: jest.Mock;

  beforeEach(() => {
    mockSendMessage = jest.fn();
    (globalThis as any).Bot = {
      sendMessage: mockSendMessage,
    };
  });

  it('should send message with context information', () => {
    const mockContext: TelegramContext = {
      message: {
        chat: {
          id: 123456,
          type: 'group',
        },
        from: {
          id: 789,
          username: 'testuser',
        },
        text: '/about',
      },
    };

    globalThis.aboutHandler(mockContext);

    expect(mockSendMessage).toHaveBeenCalledWith(
      123456,
      '```json\n' + JSON.stringify(mockContext, null, 2) + '```',
      { parse_mode: 'MarkdownV2' }
    );
  });
});
