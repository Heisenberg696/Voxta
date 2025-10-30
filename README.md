Voxta is a MERN-stack application enabling authenticated poll creation, category-based organization, and real-time vote tracking, built with a modular and maintainable architecture.

🔗 Live Site: [voxta.vercel.app](https://voxta.vercel.app)

🔗 Video Demo on Youtube: https://youtu.be/obATx2SI1aA?si=lcHomfG3CIrzHSIo


 ✨ Features

- 🔐 Authentication System: Secure user registration and login
- 📊 Poll Creation: Create custom polls with multiple options
- 🏷️ Category Organization: Organize polls by categories for better management
- ⚡ Real-time Vote Tracking: Live updates of voting results
- 📱 Responsive Design: Works seamlessly across all devices
- 🎯 User Dashboard: Manage your polls and view analytics

 📸 Screenshots
<img width="1247" height="697" alt="Screenshot 2025-09-19 232224" src="https://github.com/user-attachments/assets/05994a12-7242-4d5c-9638-5dead8c385e2" />
<img width="1919" height="832" alt="Screenshot 2025-09-19 232314" src="https://github.com/user-attachments/assets/74d0c316-fb25-4dc1-a080-ac7ab78031d5" />
<img width="566" height="681" alt="Screenshot 2025-09-19 232505" src="https://github.com/user-attachments/assets/47d19334-5801-409c-8f9b-1e3e435a4b00" />
<img width="1333" height="732" alt="Screenshot 2025-09-19 232627" src="https://github.com/user-attachments/assets/b62b52f2-0b2d-43d2-97d2-444ec916f817" />
<img width="1238" height="590" alt="Screenshot 2025-09-19 232721" src="https://github.com/user-attachments/assets/e487cf5a-e0b0-4813-8c3b-1d990f64dd58" />
<img width="1732" height="935" alt="Screenshot 2025-09-19 232732" src="https://github.com/user-attachments/assets/2e079dc8-95eb-4ee2-97cd-8090dc9d653e" />
<img width="1306" height="926" alt="Screenshot 2025-09-19 232743" src="https://github.com/user-attachments/assets/30f3e99c-4236-44be-b5ef-68f4182c6d4f" />
## 🛠️ Tech Stack

Frontend:
- React.js ⚛️
- JavaScript
- CSS3/Styled Components
- Axios for API calls

Backend:
- Node.js 🟢
- Express.js
- MongoDB 🍃
- Mongoose ODM

Authentication:
- JWT (JSON Web Tokens)
- bcrypt for password hashing

Deployment:
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

 🚀 Getting Started
 Prerequisites

Make sure you have the following installed:
- Node.js (v14 or higher) 📦
- npm or yarn package manager
- MongoDB (local or Atlas connection)
- Git

**Installation**

 Clone the repository
bash
   git clone https://github.com/Heisenberg696/voxta.git
   cd voxta

Install Backend Dependencies

cd backend
npm install

Install Frontend Dependencies
cd ../frontend
   npm install

Environment Setup
Create a .env file in the backend directory:
NODE_ENV=development
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=30d

Create a .env file in the frontend directory:
REACT_APP_API_URL=http://localhost:5000/api

Start the Development Servers
Backend (Terminal 1):
cd backend
npm run dev

Frontend (Terminal 2):
cd frontend
npm start

Open your browser
Navigate to http://localhost:3000 to see the application running!

🐛 Issues
Found a bug? Have a feature request?

Open an issue here
Check existing issues before creating a new one
Provide detailed information about the bug or feature


Thanks to all contributors who helped build this project
Inspired by modern polling applications
Built with love for the open-source community

📞 Contact

Project Link: https://github.com/Heisenberg/voxta
Live Demo: voxta.vercel.app
Email: swallieudawud@gmail.com


⭐ If you found this project helpful, please give it a star! ⭐
