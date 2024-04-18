


# Installation and Setup Guide for rw_socket

This document provides a comprehensive guide for setting up the rw_socket web application for development, testing, and production environments.

## 1. Clone GitHub Repository

Begin by cloning the repository to your local machine:

```bash
git clone https://github.com/snoryder8019/rw_socket.git
cd rw_socket
```

## 2. Install Dependencies

After cloning the repository, install all required dependencies:

```bash
npm install
```

## 3. Configuration Model Required for Development

Set up the necessary configuration for the application. Modify the following template as required:

```javascript
const env = require('dotenv').config();
const config = {
    env: "dev", // Options: dev, test, prod
    app_name: "rw_socket",
    DB_NAME: "rw_socket",
    baseUrl: process.env.BASE_URL_DEV,
    ticketsEmail: "youremail@yourbusiness.biz",
    emailService: "smtp.office365.com",
    title: "Royal World Socket Platform",
    headline: "Now Testing Chat, Views, and Dashboard",
    footerMessage: "config footer message",
    companyPaypal: process.env.PPAL_CID,
    baseShipping: "9.00",
    baseTransaction: "1.00"
};
module.exports = config;
```

## 4. Environment Variables Setup

Configure your `.env` file with the following environment variables:

```plaintext
# Development Environment
BASE_URL_DEV=http://localhost:3000/
PORT=3000

# Test Environment
BASE_URL_TEST=

# Production Environment
BASE_URL_PROD=

# Additional configurations as needed
```

## 5. Log Setup

Ensure that log files are not blank and include the following files with initial empty JSON object arrays:

- `/logs/errors.json`
- `/logs/regEmails.json`
- `/logs/passReset.json`

Each file should initially contain:

```json
{"data": []}
```

This setup will facilitate future debugging and functionality enhancements.

## 6. Run the Server

Finally, start your server to ensure all configurations are working correctly:

```bash
npm start
```

Verify that the server is running and all connections are established without errors.

## Future Releases

Additional documentation for debugging and deployment will be created and updated in future release notes.


```

## Additional Considerations
To test locally you will need to setup an Atlas Cluster and adjust your mongo connect strings in the configurations of /plugins/mongo and whitelist your ip address in the network configurations @ mongoDB
