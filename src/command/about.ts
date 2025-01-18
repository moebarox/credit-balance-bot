function aboutHandler(ctx: TelegramContext) {
  Bot.sendMessage(
    ctx.message.chat.id,
    `\`\`\`json\n${JSON.stringify(ctx, null, 2)}\`\`\``,
    { parse_mode: 'MarkdownV2' }
  );
}

globalThis.aboutHandler = aboutHandler;
