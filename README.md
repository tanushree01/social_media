# Social Media Application

A full-featured social media platform built with modern web technologies. This application allows users to create profiles, share posts with images, like and comment on posts, follow other users, and discover new friends.

## 📋 Features

- **Authentication**: Secure signup/login with JWT tokens
- **User Profiles**: Customizable profiles with bio and profile pictures
- **Posts**: Create, view, edit, and delete posts with optional image uploads
- **Social Interactions**: Like posts, add comments, follow/unfollow users
- **Friend Discovery**: Search for users by name or username
- **Real-time UI Updates**: Immediate feedback when liking, commenting, or following

## 🛠️ Tech Stack

### Backend

- **Node.js & Express**: Server framework
- **TypeScript**: Type-safe code
- **Sequelize ORM**: Database interactions
- **MySQL**: Relational database
- **JWT**: Authentication
- **Multer**: File uploads
- **bcrypt**: Password hashing

### Frontend

- **Next.js**: React framework with SSR capabilities
- **TypeScript**: Type-safe code
- **Redux Toolkit**: State management
- **shadcn/ui**: Component library
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: SVG icon library

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Installation

#### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/social-media.git
   cd social-media
   ```

2. Install backend dependencies
   ```bash
   cd socail_median_backend
   npm install --legacy-peer-dep
   ```

4. Start the backend server
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. Install frontend dependencies
   ```bash
   cd ../social_media_frontend
   npm install --legacy-peer-deps
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Access the application at http://localhost:3000

## 📂 Project Structure

### Backend Structure

```
socail_median_backend/
├── src/
│   ├── config/            # Database and application configuration
│   ├── controllers/       # Request handlers
│   ├── middleware/        # Custom middleware (auth, upload)
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── types/             # TypeScript type definitions
│   ├── app.ts             # Express application
│   └── index.ts           # Entry point
├── uploads/               # Uploaded files storage
├── package.json
└── tsconfig.json
```

### Frontend Structure

```
social_media_frontend/
├── public/                # Static files
├── src/
│   ├── app/               # Next.js app router
│   │   ├── (auth)/        # Authentication pages
│   │   ├── discover/      # User discovery
│   │   ├── feed/          # Post feed
│   │   └── profile/       # User profiles
│   ├── components/        # Reusable components
│   │   ├── navigation/    # Navigation components
│   │   ├── post/          # Post-related components
│   │   ├── ui/            # UI components
│   │   └── user/          # User-related components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   └── redux/             # Redux state management
│       ├── middleware/    # Redux middleware
│       └── slices/        # Redux slices
├── package.json
└── tsconfig.json
```


## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

- Your Name - Initial development

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Sequelize Documentation](https://sequelize.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/) 