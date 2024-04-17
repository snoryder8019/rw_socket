1. **Clone GitHub Repository**
   - `git clone https://github.com/snoryder8019/rw_socket.git`
   - `cd rw_socket`

2. **Generate Google Auth Keys**
   - Access Google Cloud Console.
   - Create a project.
   - Enable Google+ API.
   - Generate OAuth client ID.

3. **MongoDB Atlas Setup**
   - Sign up or log into MongoDB Atlas.
   - Create a cluster.
   - Define database and collections, initializing with model documents.

4. **Nodemailer and Gmail Configuration**
   - Configure a Gmail account for sending emails.
   - `npm install nodemailer`
   - Update Gmail details in `/config/config.js`.

5. **Environment Variables (.env)**
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `MONGO_DB_URI`
   - `GMAIL_USER`
   - `GMAIL_PASS`
   - Additional keys as required.

6. **Development and Testing**
   - `npm install`
   - `npm start`
   - Check all connections.
