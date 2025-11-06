# 📊 Timesheet Tracker

A simple, user-friendly web application for tracking your daily activities and time. Built with React and modern web technologies.

## ✨ Features

- **📅 Calendar Integration**: Select dates and times easily with intuitive date/time pickers
- **⏱️ Time Tracking**: Add task entries with name, duration, and optional comments
- **📋 Task Management**: View, edit, and delete all your time entries
- **📈 Visual Dashboards**: 
  - Time by task (Pie chart)
  - Time series overview (Daily/Weekly/Monthly views)
  - Top tasks by hours (Bar chart)
  - Summary statistics
- **📥 Excel Export**: Export all your timesheet data to Excel format
- **💾 Local Storage**: All data is saved locally in your browser - no cloud needed
- **🎨 Modern UI**: Beautiful, responsive design that works on desktop and mobile

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

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

1. **Add Time Entry**: 
   - Click on "➕ Add Entry" tab
   - Select date and time (start/end time or duration)
   - Enter task name (required)
   - Add optional comment
   - Click "✅ Add Entry"

2. **View All Entries**:
   - Click on "📋 All Entries" tab
   - Filter by date or task name
   - Edit or delete entries as needed
   - Export to Excel when ready

3. **View Dashboard**:
   - Click on "📈 Dashboard" tab
   - See visual charts and statistics
   - Switch between Daily/Weekly/Monthly views

## 🛠️ Technologies Used

- **React** - UI library
- **Vite** - Build tool and dev server
- **Chart.js** - Data visualization
- **react-datepicker** - Date and time selection
- **xlsx** - Excel export functionality

## 💡 Tips

- Duration can be entered manually (e.g., "2h 30m") or calculated automatically from start/end times
- All data is stored in your browser's local storage - no account needed!
- Use filters in the "All Entries" view to find specific tasks or dates quickly
- Export your data regularly to keep a backup

## 📝 License

This project is open source and available for personal use.

---

Made with ❤️ for efficient time tracking

