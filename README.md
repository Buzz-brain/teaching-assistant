# Teaching Assistant App

 > Teaching Assistant is a modern, cross-platform application designed to empower both students and teachers with seamless classroom management, interactive quizzes, personalized schedules, real-time messaging, and more. Built with Expo, React Native, and Appwrite, it delivers a unified, professional experience across Android, iOS, and web; making learning and teaching more efficient, engaging, and accessible for everyone.

---

## 🚀 Overview

Teaching Assistant is a sleek, professional, and feature-rich mobile/web app designed to streamline classroom management, quizzes, schedules, messaging, and more for both students and teachers. Built with the latest technologies, it offers a seamless experience across Android, iOS, and web.

---

## ✨ Features

- **Authentication**: Secure login/signup with session persistence and robust session recovery.
- **Role-based Dashboards**: Distinct experiences for students and teachers.
- **Quizzes**: Create, take, and manage quizzes with real-time status (pending, in-progress, completed).
- **Courses**: View and manage enrolled courses.
- **Schedules**: Personalized class schedules for students and teachers.
- **Messaging**: Send and receive messages between users.
- **Notifications**: Stay updated with real-time notifications.
- **Activity Feed**: Track recent activities and progress.
- **Modern UI/UX**: Beautiful, responsive design with gradients, glassmorphism, and smooth navigation.
- **Cross-Platform**: Runs on Android, iOS, and web with a single codebase.

---

## 🛠️ Tech Stack

- **Framework**: Expo (React Native, React Native Web)
- **Backend**: Appwrite (Authentication, Database, Storage)
- **UI**: NativeWind, Expo Vector Icons, LinearGradient
- **State & Routing**: React Context, Expo Router
- **Storage**: AsyncStorage, Appwrite
- **Other**: TypeScript, EAS Build/Deploy, PostCSS, ESLint

---

## 📁 App Structure

```
app/
  (tabs)/
    ActivityScreen.tsx         # Activity feed
    CoursesScreen.tsx          # Courses list
    HelpScreen.tsx             # Help & support
    MoreScreen.tsx             # Settings, profile, etc.
    QuizScreen.tsx             # Quiz dashboard
    ScheduleScreen.tsx         # Student schedule
    ScheduleScreenTeacher.tsx  # Teacher schedule
    StudentDashboard.tsx       # Student dashboard
    ...
  auth/
    AuthScreen.tsx             # Login/Signup
  messages/
    SendMessage.tsx            # Messaging
  notification/
    NotificationsScreen.tsx    # Notifications
  quiz/
    CreateQuiz.tsx             # Quiz creation (teacher)
    WriteQuiz.tsx              # Take quiz (student)
  schedule/
    ScheduleCreateScreen.tsx   # Create schedule (teacher)
components/
  ActivityItem.tsx, CourseItem.tsx, ProgressBar.tsx, StatCard.tsx
contexts/
  AuthContext.tsx, RoleContext.tsx
utils/
  appwrite-config.ts           # Appwrite setup
  ...
```

---

## 🖥️ Main Screens & Functionality

- **Authentication**: Email/password login, signup, auto-login, session recovery.
- **Student Dashboard**: Overview of quizzes, courses, schedule, and recent activity.
- **Teacher Dashboard**: Manage quizzes, schedules, and view student progress.
- **Quiz Management**: Create, edit, take, and review quizzes. Real-time status and results.
- **Course Management**: Browse and view enrolled courses.
- **Schedule**: Personalized class schedules for students and teachers.
- **Messaging**: Direct messaging between users.
- **Notifications**: Real-time updates for important events.
- **Help & Support**: Submit questions or issues to teachers/admins.

---

## ⚡ Getting Started

### 1. Clone the Repository

```bash
 git clone https://github.com/Buzz-brain/teaching-assistant.git
 cd teaching-assistant
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Set your Appwrite endpoint and project ID in your environment variables or `.env` file:

```
EXPO_PUBLIC_APPWRITE_ENDPOINT=your-appwrite-endpoint
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-appwrite-project-id
```

### 4. Run the App

- **Start Metro Bundler:**
  ```bash
  npx expo start
  ```
- **Android:** `npm run android`
- **iOS:** `npm run ios`
- **Web:** `npm run web`

---

## 🚢 Deployment

### Deploy to Web (Render)

1. Push your repo to GitHub/GitLab/Bitbucket and link it to Render.
2. In Render, create a new "Static Site" service:
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `web`
   - Branch: your repo branch (e.g., main)
3. Add environment variables:
   - `EXPO_PUBLIC_APPWRITE_ENDPOINT`
   - `EXPO_PUBLIC_APPWRITE_PROJECT_ID`
4. Start the deploy. Render will build and export the static web app.
5. Configure CORS and allowed origins in Appwrite for your Render URL.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome! Please open an issue or submit a pull request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgements

- [Expo](https://expo.dev)
- [React Native](https://reactnative.dev/)
- [Appwrite](https://appwrite.io/)
- [NativeWind](https://www.nativewind.dev/)
- [All contributors & the open source community](https://github.com/Buzz-brain/teaching-assistant/graphs/contributors)
