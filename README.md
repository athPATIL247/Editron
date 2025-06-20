# 🚀 Editron - Real-Time Collaborative Coding Platform

![Editron Logo](/logo.png)

## ✨ Features

### 🎯 Real-Time Collaboration
- **Live Code Editing**: Multiple users can code simultaneously
- **Instant Updates**: See changes in real-time as team members code
- **Synchronized Environment**: Everyone stays on the same page

### 💻 Rich Code Editor
- **Multi-language Support**: Python, JavaScript, C++, Java, and more
- **Syntax Highlighting**: Enhanced code readability
- **Code Execution**: Run and test code directly in the editor
- **AI Code Generation**: Powered by Gemini for smart code suggestions

### 👥 Team Features
- **Private Rooms**: Secure coding spaces for your team
- **File Management**: Upload, create, and organize code files
- **Version Control**: Track changes and commit updates
- **Real-time Chat**: Built-in communication for team discussions

### 🔒 Security
- **Password Protection**: Secure rooms with password authentication
- **User Authentication**: Safe and secure user management
- **Data Privacy**: Your code stays private and protected

## 🛠️ Tech Stack

- **Frontend**: React.js, Socket.io-client, Monaco Editor
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Real-time Communication**: Socket.io
- **Authentication**: JWT
- **Code Execution**: Piston API
- **AI Integration**: Google Gemini API

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/editron.git
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# Backend (.env)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=8003

# Frontend (.env)
VITE_API_URL=http://localhost:8003
VITE_GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development servers
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd ../frontend
npm run dev
```

## 🌟 Key Features in Detail

### Real-Time Code Collaboration
- Multiple users can edit code simultaneously
- Changes are synchronized instantly
- Conflict resolution for concurrent edits
- Cursor presence to see where others are working

### Smart Code Editor
- Language-specific syntax highlighting
- Code completion and suggestions
- Error detection and debugging
- Multiple file support
- Code execution with output display

### Team Management
- Create private coding rooms
- Invite team members
- Manage file permissions
- Track team activity
- Real-time chat for discussions

### File Management
- Upload existing code files
- Create new files with proper extensions
- Organize files in rooms
- Download code files
- Version history tracking

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) for the powerful code editor
- [Socket.io](https://socket.io/) for real-time communication
- [Piston API](https://github.com/engineer-man/piston) for code execution
- [Google Gemini](https://deepmind.google/technologies/gemini/) for AI code generation