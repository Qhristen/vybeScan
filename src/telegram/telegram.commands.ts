export const COMMANDS = [
  {
    command: '/start',
    description: 'Show all commands',
  },
  {
    command: '/showportfolio',
    description: 'Get provided walet portfolio',
  },
  {
    command: '/checknftowner',
    description: 'Check if address owns NFT from a collection',
  },

  {
    command: '/trackwallet',
    description: 'Receive alerts for transactions on wallet address (wSol)',
  },
  {
    command: '/token_holders',
    description: 'Retrieves the top 10 token holders. Data is updated every three hours',
  },
  {
    command: '/token_detail',
    description: `Useful for overview of a token's past 24 hours' activity.`,
  },
  {
    command: '/whalealert',
    description: 'Sends notifications for large transactions',
  },
  {
    command: '/subscriptions',
    description: 'Show all subscriptions',
  },
  {
    command: '/unsubscribe',
    description: 'Unsubscribe from notifications',
  },
];
