# Telegram bot to visit all streets in Che

## Steps to run

### 1. Setup telegram bot
https://core.telegram.org/bots

### 2. Setup Trello token and key
Folow this guide - https://trello.com/app-key

### 3. Setup Trello board with 3 columns (list) and get List's ID by adding '.json' to the board URL

### 4. Setup configs

In **config** folder setup files:

config.json:

**trelloKey** - Trello key;

**trelloToken** - Trello token;

**allStreetsListID** - Trello List ID with all streets

**toRideListID** - Trello List ID with current streets to ride

**finishedListID** - Trello List ID with finished streets

**telegramToken** - Telegram token

**adminTelegramID** - Telegram admin user ID

## To parse map.cn.ua site with all streets names run:

```bash
npm run parseStreets
```

## To create Trello cards for each street run:

```bash
npm run createCards
```

## To run Telegram bot:

```bash
npm run start
```
