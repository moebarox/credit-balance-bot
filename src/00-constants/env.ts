// Get your telegram bot token from @BotFather
const BOT_TOKEN =
  PropertiesService.getScriptProperties().getProperty('BOT_TOKEN');

// If set, the unexpected error will be sent to the bot admin
const BOT_ADMIN_ID =
  PropertiesService.getScriptProperties().getProperty('BOT_ADMIN_ID');

// You have to deploy your first app and then set WEBHOOK_URL from Deploy > Manage deployments > Copy Web app URL
const WEBHOOK_URL =
  PropertiesService.getScriptProperties().getProperty('WEBHOOK_URL');

// Read this article to enable Atlas Data API: https://www.mongodb.com/developer/products/atlas/atlas-data-api-introduction/
const MONGO_HOST =
  PropertiesService.getScriptProperties().getProperty('MONGO_HOST');
const MONGO_DATABASE =
  PropertiesService.getScriptProperties().getProperty('MONGO_DATABASE');
const MONGO_DATA_SOURCE =
  PropertiesService.getScriptProperties().getProperty('MONGO_DATA_SOURCE');
const MONGO_API_KEY =
  PropertiesService.getScriptProperties().getProperty('MONGO_API_KEY');

const SA_EMAIL =
  PropertiesService.getScriptProperties().getProperty('SA_EMAIL');
const SA_PROJECT_ID =
  PropertiesService.getScriptProperties().getProperty('SA_PROJECT_ID');
const SA_PRIVATE_KEY = PropertiesService.getScriptProperties()
  .getProperty('SA_PRIVATE_KEY')
  ?.replace(/\\n/g, '\n');

const DB_CONNECTION =
  PropertiesService.getScriptProperties().getProperty('DB_CONNECTION');
