function aboutHandler(ctx: TelegramContext) {
  sendMessage(
    ctx.message.chat.id,
    `\`\`\`json\n${JSON.stringify(ctx, null, 2)}\`\`\``,
    { parse_mode: 'MarkdownV2' }
  );
}
