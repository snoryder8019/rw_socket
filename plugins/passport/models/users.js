const newUser = {
  providerID: profile.id,
  provider: 'google',
  email: profile.emails[0].value,
  displayName: profile.displayName,
  firstName: profile.name.givenName,
  lastName: profile.name.familyName,
  password: '',
  isAdmin: false,
  cart: [],
  images: [
    {
      0: {
        thumbnailUrl:
          'https://royal-bucket.us-ord-1.linodeobjects.com/royal-world-assets/big-RST_Logo.png',
        avatarTag: true,
      },
    },
  ],
  clubs: [],
  subscription: 'free',
  permissions: {
    admin: false,
    users: false,
    games: false,
    videoLead: false,
    videoProduction: false,
    bingoLead: false,
    tickets: false,
    chat: false,
    travel: false,
    clubs: false,
    blogs: false,
    webapp: false,
  },
  wallet: {},
};
