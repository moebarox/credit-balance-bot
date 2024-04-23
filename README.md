## Description

This Telegram Bot is designed to simplify the process of managing credit balances in a group. It uses Google App Script to deploy a serverless application that can automatically deduct credit balances each month and provide reminders for insufficient balance. The bot is flexible and can be used for various purposes, such as tracking monthly bills like Spotify, YouTube, or any other service's credit balance. It's an excellent tool for group management and can be customized to suit your needs.

## Prerequisites

- [Create Telegram Bot](https://telegram.me/BotFather)
- [Install Clasp](https://github.com/google/clasp)
- [Setup MongoDB](https://www.mongodb.com) and enable [Atlas Data API](https://www.mongodb.com/developer/products/atlas/atlas-data-api-introduction/)

## Installation

- Clone this repository

  ```bash
  git clone git@github.com:moebarox/credit-balance-bot.git && cd credit-balance-bot
  ```

- Create a new Google Apps Script project

  ```bash
  clasp create --title "Credit Balance Bot" --type webapp
  ```

- Push this repository to the new Google Apps Script project

  ```bash
  clasp push
  ```

- Deploy the new Google Apps Script project

  - Open the new Google Apps Script project
  - Click **Deploy** and select **New deployment**.
  - Click gear icon on the right of **Select type** and select **Web app**.
  - Fill in the following information:

    - **New description**: "Credit Balance Bot"
    - **Execute as**: "Me"
    - **Who has access**: "Anyone"

  - Click **Deploy**.
  - Click **Authorize access** and complete the process.
  - Copy the Web app URL.

- Add Script Properties

  - On the Google Apps Script project, go to **Project Settings**
  - On the **Script Properties** section and add the following properties:

    - `WEBHOOK_URL` - Web app URL from the previous step
    - `BOT_TOKEN` - Your bot token from @BotFather
    - `BOT_ADMIN_ID` - Your telegram ID (for debugging purposes)
    - `MONGO_HOST` - MongoDB host
    - `MONGO_DATABASE` - MongoDB database
    - `MONGO_DATA_SOURCE` - MongoDB data source
    - `MONGO_API_KEY` - MongoDB Atlas API key

- Set Webhook

  Do the following steps. This is required only once.

  - On the Google Apps Script project, go to **Editor**
  - Select `index.gs` file
  - On the toolbar, select `setWebhook` function
  - Click **Run**

- Test the bot

  Try to send `/about` command to the bot.

## Setup Scheduler

- On the Google Apps Script project, go to **Triggers**
- Click **Add Trigger**
- Fill in the following information:

  - **Choose which function to run**: "billingScheduler"
  - **Choose which deployment should run**: (Select your deployment version)
  - **Select event source**: "Time-driven"
  - **Select type of time based trigger**: "Day timer"
  - **Select time of day**: "8am to 9am"

- Click **Save**.

## Updating the bot

Everytime you make changes, you need to deploy the new version. Do the following steps.

- On the Google Apps Script project, click **Deploy** and select **Manage deployment**.
- Click **Edit** (pen icon).
- Fill in the following information:

  - **Version**: "New version"
  - **Description**: Fill with the new description (optional)

- Click **Deploy**.
