# Smart Collaboration Dashboard Backend

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```

2. Create a `.env` file in the `backend` directory with the following content:
   ```env
   MONGO_URI=mongodb://localhost:27017/smart-collab
   JWT_SECRET=your_jwt_secret_here
   PORT=5000
   ```

3. Start the development server:
   ```sh
   npx nodemon src/server.js
   ```

The server will run on `http://localhost:5000` by default.

## Health Check
Visit `http://localhost:5000/api/health` to verify the backend is running. 