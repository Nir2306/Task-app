# 📊 Task Tracker

A modern, full-featured web application for tracking your daily activities and time. Built with React, Firebase, and modern web technologies. Features cloud sync, offline support, Mauritian public holidays integration, and a beautiful mobile-responsive interface.

## ✨ Features

### Core Functionality
- **📅 Calendar Integration**: 
  - Desktop: Traditional form-based entry with calendar picker
  - Mobile: Google Calendar-style interface with Day, Month, and List views
  - Click any time slot to create tasks
  - Color-coded tasks with duration highlighting
- **⏱️ Time Tracking**: Add task entries with name, duration, and optional comments
- **📋 Task Management**: View, edit, and delete all your time entries with advanced filtering
- **📈 Visual Dashboards**: 
  - Time by task (Pie chart)
  - Time series overview (Daily/Weekly/Monthly views)
  - Top tasks by hours (Bar chart)
  - Summary statistics
  - Compact, optimized chart heights
- **📥 Excel Export**: Export all your timesheet data to Excel format
- **🇲🇺 Mauritian Public Holidays**: 
  - Automatic holiday detection and display
  - Holiday days highlighted in green in month view
  - Holiday banner shown in day view
  - Complete list of holidays displayed below month calendar

### Authentication & Storage
- **🔐 Firebase Authentication**: Secure email/password and Google Sign-In
- **☁️ Cloud Sync**: Automatic data synchronization with Firestore
- **💾 Offline Support**: Works offline with local IndexedDB storage
- **🔄 Hybrid Storage**: Seamless sync when connection is restored

### Additional Features
- **📝 Notes**: 
  - Rich text editor with formatting options (bold, italic, bullets, colors, etc.)
  - Standalone notes system with categories, tags, and task linking
  - Auto-save functionality
  - Search and filter capabilities
- **🎲 Name Generator**: Name generator for creative projects with favorites
- **🌙 Dark Mode**: Beautiful dark theme with smooth transitions
- **📱 Mobile Optimized**: 
  - Google Calendar-style interface for task management
  - Hamburger menu navigation
  - Touch-friendly interface
  - Responsive design for all screen sizes
  - Optimized month calendar view
- **🌐 Network Status**: Real-time connection status indicator
- **📲 Progressive Web App (PWA)**: 
  - Install as a mobile app on Android and iOS
  - Works offline with service worker caching
  - App-like experience with standalone mode
  - Auto-updates when new versions are deployed

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project (for authentication and cloud storage)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Nir2306/Task-app.git
cd Task-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Firebase configuration:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:

```bash
npm run preview
```

## 📖 How to Use

### Authentication
1. **Sign In**: Use email/password or Google Sign-In
2. **First Time**: Enter email and password to automatically create an account
3. **Password Reset**: Click "Forgot Password?" to reset your password

### Time Tracking
1. **Add Time Entry**: 
   - **Desktop**: Click on "New Task" tab
     - Select date from calendar and time (start/end time or duration)
     - Use NFX/NEX prefix buttons for task categorization
     - Enter task name (required)
     - Add optional comment
     - Click "Add Entry"
   - **Mobile**: Click on "New Task" tab
     - Google Calendar-style interface
     - Click any time slot to create a task
     - Switch between Day, Month, and List views
     - Tasks are color-coded and show duration

2. **View All Entries**:
   - Click on "Task List" tab
   - Filter by date or task name (with dropdown suggestions)
   - Edit or delete entries as needed
   - Export to Excel when ready

3. **View Dashboard**:
   - Click on "Dashboard" tab
   - See visual charts and statistics
   - Switch between Daily/Weekly/Monthly views
   - View time breakdown by task
   - Compact chart heights for better viewing

### Notes
- Click on "My Notes" tab
- Rich text editor with formatting options (bold, italic, underline, bullets, colors, etc.)
- Create notes with categories (Reminder, Code, To-Do, Links, Important)
- Link notes to specific tasks
- Search and filter notes by category, tag, or content
- Auto-save functionality while editing

### Mobile Navigation
- Tap the hamburger menu (☰) icon in the top-left corner
- Select any section from the slide-out menu
- Menu automatically closes after selection

## 🛠️ Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Firebase** - Authentication and Firestore database
- **Chart.js** - Data visualization
- **react-datepicker** - Date and time selection
- **react-quill** - Rich text editor for notes
- **lottie-react** - Lottie animations for offline indicator
- **xlsx** - Excel export functionality
- **IndexedDB** - Local offline storage

## 🌐 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard (Settings → Environment Variables):
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Deploy!

**Important**: Make sure to add your Vercel domain to Firebase authorized domains:
- Go to Firebase Console → Authentication → Settings → Authorized domains
- Add your Vercel domain (e.g., `your-app.vercel.app`)
- Add your custom domain if you have one

### PWA Icons

The app includes PWA icons for mobile installation:
- `pwa-192x192.png` - Standard icon
- `pwa-512x512.png` - High-resolution icon
- `apple-touch-icon.png` - iOS icon

These are automatically included in the build and enable PWA installation.

## 💡 Tips

- Duration can be entered manually (e.g., "2h 30m") or calculated automatically from start/end times
- Use NFX/NEX prefix buttons to categorize tasks quickly
- Data syncs automatically between devices when online
- Works completely offline - all data is stored locally
- Use filters in the "Task List" view to find specific tasks or dates quickly (dropdown suggestions available)
- Export your data regularly to keep a backup
- Dark mode can be toggled from the header
- Network status indicator shows your connection state and pending sync operations
- Install the app on your mobile device for quick access and offline use
- **Mauritian Public Holidays**: Holiday days are highlighted in green in the month view calendar
- **Mobile Calendar**: Use the Google Calendar-style interface on mobile for intuitive task management
- **Rich Text Notes**: Format your notes with bold, italic, bullets, and colors for better organization
- Tasks are automatically color-coded (green is reserved for holidays)

## 📱 Mobile Features

- **Hamburger Menu**: Easy access to all sections
- **Touch Optimized**: Large touch targets for easy interaction
- **Responsive Design**: Adapts to all screen sizes
- **Offline First**: Full functionality without internet connection

### Installing as a Mobile App (PWA)

**Android (Chrome/Edge):**
1. Visit your deployed app in Chrome or Edge
2. Tap the menu (⋮) → "Add to Home screen" or "Install app"
3. Confirm installation
4. The app will appear on your home screen like a native app

**iOS (Safari):**
1. Visit your deployed app in Safari
2. Tap the Share button (□↑) → "Add to Home Screen"
3. Optionally edit the name, then tap "Add"
4. The app will appear on your home screen

**Benefits:**
- Works offline with cached resources
- Opens in standalone mode (no browser UI)
- Auto-updates when new versions are deployed
- Fast loading with service worker caching

## 🔒 Security

- Firebase Authentication for secure user management
- Environment variables for sensitive configuration
- Data encrypted in transit and at rest
- User-specific data isolation

## 📝 License

This project is open source and available for personal use.

---

Made with ❤️ for efficient time tracking
