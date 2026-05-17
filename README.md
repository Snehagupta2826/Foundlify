# Foundify 🔍

**Foundify** is a modern, full-stack web application designed to help communities easily report, track, and recover lost and found items. Built with a focus on user experience and smart automation, the platform connects people who have lost belongings with those who have found them.

## 🚀 Features

### 1. Smart Matching Algorithm
The core of Foundify is an automated matching engine. When a user reports a new lost or found item, the system instantly cross-references the database and scores potential matches based on:
- Category & Color similarities
- Location proximity
- Keyword analysis
- Date proximity

### 2. Peer-to-Peer (P2P) Claim System
We eliminated the need for a central administrator bottleneck:
- **Direct Claims:** Users can file a claim directly on a found item, submitting proof of ownership (images, descriptions, or unique identifiers).
- **Claim Management:** The finder of the item can review incoming claims directly on their dashboard and choose to **Accept** or **Reject** the claim.
- **Secure Handovers:** Once a claim is accepted, both parties are notified to arrange the physical handover.

### 3. Real-Time Notification System
Users never have to manually check for updates. The platform features an integrated notification bell that alerts users when:
- A high-probability match is detected for their item.
- Someone submits a claim on an item they found.
- Their own claim is accepted or rejected by another user.

### 4. Modern & Interactive UI/UX
The front-end was heavily customized to provide a premium user experience:
- **Responsive Design:** Fully responsive layouts that look great on desktop and mobile.
- **Interactive Elements:** Smooth hover animations, scale effects, and custom transitions on buttons and feature cards.
- **Solid Aesthetic:** A clean, professional `Indigo` and `Slate` color palette that emphasizes readability and trust.

### 5. Profile Management & File Uploads
- **Custom Avatars:** Users can upload their own profile pictures via an interactive hover-overlay. 
- **Image Processing:** Profile pictures and item images are safely handled and served via the backend using `multer`.

---

## 🛠️ Technology Stack

**Frontend:**
- **React.js** - UI framework
- **Tailwind CSS** - Rapid, utility-first styling and animations
- **React Router (v6)** - Client-side routing
- **Lucide React** - Modern SVG iconography
- **Axios** - HTTP client for API requests
- **React Hot Toast** - Elegant, non-blocking popup notifications

**Backend:**
- **Node.js & Express.js** - Server environment and API routing
- **MongoDB & Mongoose** - NoSQL database and schema modeling
- **JSON Web Tokens (JWT)** - Secure, stateless user authentication
- **Bcrypt.js** - Password hashing
- **Multer** - Middleware for handling `multipart/form-data` (image uploads)

---

## ⚙️ Installation & Setup

If you want to run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/foundify.git
cd foundify
```

### 2. Setup the Backend
Open a terminal and navigate to the backend directory:
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory and add the following variables:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
```
Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```
Start the frontend development server:
```bash
npm run dev
```

### 4. Access the Application
Open your browser and navigate to `http://localhost:5173/`

---

## 📄 License
This project is licensed under the MIT License.
