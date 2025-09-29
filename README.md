# Dynamic QR Code Redirector

A web application built with Node.js and Express that provides a dashboard to manage a dynamic redirect link. This allows a single, permanent QR code to point to different destination URLs, which can be updated in real-time by an administrator.

This project is maintained by the **CICR Robotics Hub of JIIT-128**.


## ✨ Features

-   **Admin Authentication**: Secure login for the management dashboard.
-   **Dynamic Link Management**: Create new redirect links, set one as "active," and delete old ones directly from the UI.
-   **Visit Tracking**: Automatically counts how many times the public redirect link is visited.
-   **Dashboard Analytics**: At-a-glance statistics for Total Links, Total Submissions (visits), Active Submissions, and New Links Created This Week.
-   **Single Redirect Route**: A single, fixed URL (`/go`) that always redirects to the currently active link, perfect for use with a static QR code.
-   **User-Friendly Interface**: A clean and functional dashboard for managing links and viewing stats.

## 🛠️ Tech Stack

-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB with Mongoose
-   **Frontend**: EJS (Embedded JavaScript templating)
-   **Authentication**: Express Session, Bcrypt.js
-   **Middleware & Libraries**: `method-override`, `dotenv`, `morgan`

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16 or later)
-   [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account or a local MongoDB instance

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/CICR-The-Robotics-Hub-of-JIIT-128/dynamicQR.git](https://github.com/CICR-The-Robotics-Hub-of-JIIT-128/dynamicQR.git)
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd dynamicQR
    ```

3.  **Install NPM packages:**
    ```bash
    npm install
    ```

4.  **Create an environment file:**
    Create a new file named `.env` in the root of the project. You can copy the `.env.example` file if one is present.

5.  **Start the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:3001` (or your specified port).

## ⚙️ Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file:

```
# MongoDB connection string
DB_URI="your_mongodb_connection_string"

# Port for the server to run on (e.g., 3001)
PORT=3001

# Secret for session management
SESSION_SECRET="a_long_random_secret_string"
```

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
