import dotenv from 'dotenv';
dotenv.config();

export const config = {
  // Breaking changes below
  app_name: 'rw_socket',
  DB_NAME: process.env.DB_NAME,
  DB_URL: process.env.DB_URL,
  baseUrl: process.env.BASE_URL,
  ticketsEmail: 'scott@w2marketing.biz',
  emailService: 'smtp.office365.com',
  // End breaking changes

  // Custom changes below
  title: 'Royal World Socket Platform',
  headline: 'Welcome to our Test Platform!',
  footerMessage: 'config footer message',
  companyPaypal: process.env.PPAL_CID,
};

// Determine the db_uri based on the environment
const envName = process.env.NODE_ENV || 'development';
config.db_uri =
  envName === 'dev'
    ? `mongodb://${config.DB_URL}/${config.DB_NAME}?retryWrites=true&w=majority`
    : `mongodb+srv://${process.env.MONUSR}:${process.env.MONPASS}${config.DB_URL}?retryWrites=true&w=majority&appName=${process.env.DB_CLUSTER}`;
