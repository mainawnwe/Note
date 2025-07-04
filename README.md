# Second-Note Project

## Overview
Second-Note is a full-stack note-taking application featuring a React-based client and a PHP-based server API. It supports various note types including text notes, lists, drawings, and image notes. The app includes user authentication, theming, categorized search, and note management with reminders and status tracking.

## Project Structure

```
Note/
├── client/                 # React frontend application
│   ├── public/             # Static assets and HTML template
│   ├── src/                # React source code
│   │   ├── assets/         # Images and icons
│   │   ├── components/     # React components
│   │   │   ├── AppDownloads.js
│   │   │   ├── AppDownloadsModal.js
│   │   │   ├── CategorizedSearch.js
│   │   │   ├── ColorPicker.jsx
│   │   │   ├── CreateArea.js
│   │   │   ├── DetailedSettingsPanel.js
│   │   │   ├── DrawingCanvas.js
│   │   │   ├── DrawingNoteCardDisplay.jsx
│   │   │   ├── FeedbackDropdown.jsx
│   │   │   ├── FeedbackModal.js
│   │   │   ├── Footer.js
│   │   │   ├── FormattingToolbar.jsx
│   │   │   ├── Header.js
│   │   │   ├── HelpModal.js
│   │   │   ├── ImageNoteCardDisplay.jsx
│   │   │   ├── ImageUpload.js
│   │   │   ├── KeyboardShortcutsModal.js
│   │   │   ├── ListItemManager.jsx
│   │   │   ├── ListItemsDisplay.js
│   │   │   ├── MainContent.js
│   │   │   ├── MainMenu.js
│   │   │   ├── Modal.js
│   │   │   ├── MoreOptionsDropdown.jsx
│   │   │   ├── Note.js
│   │   │   ├── NoteDetailsModal.jsx
│   │   │   ├── NoteTypeSelector.jsx
│   │   │   ├── Search.js
│   │   │   ├── SettingsMenu.js
│   │   │   ├── SimpleNoteDisplay.jsx
│   │   │   ├── UserProfileEditModal.js
│   │   │   ├── UserProfilePage.jsx
│   │   │   └── auth/       # Authentication components
│   │   │       ├── AuthRoute.js
│   │   │       ├── Login.js
│   │   │       └── Signup.js
│   │   ├── context/        # React context providers
│   │   │   ├── AuthContext.js
│   │   │   └── ThemeContext.js
│   │   ├── App.js          # Main React app entry point
│   │   ├── index.js        # React DOM rendering
│   │   └── ...             # Other React app files and configs
│   ├── package.json        # Frontend dependencies and scripts
│   ├── README.md           # Frontend-specific README
│   └── tailwind.config.js  # Tailwind CSS configuration
│
├── server/                 # PHP backend API
│   ├── api/                # API endpoints
│   │   ├── auth/           # Authentication endpoints
│   │   │   ├── login.php
│   │   │   ├── profile.php
│   │   │   └── signup.php
│   │   ├── index.php       # Main notes API entry point
│   │   ├── search.php      # Search API endpoint
│   │   ├── test.php        # Test API endpoint
│   │   └── uploads/        # Uploaded profile images
│   │       ├── profile_68637fc606f572.41573366.png
│   │       ├── profile_686376ade26549.14833144.png
│   │       ├── profile_686381aedc4db7.97417083.jpeg
│   │       └── profile_68638117663091.25359675.jpeg
│   ├── db/                 # Database scripts and migrations
│   │   ├── auth/           # Auth-related SQL scripts
│   │   ├── migrations/     # Database migration scripts
│   │   ├── db-connection.php # Database connection setup
│   │   └── test_db.php     # Test database script
│   └── lib/                # Helper libraries (auth, uploads)
│
├── project-structure.txt   # Textual summary of project structure
├── README.md               # This file: project overview and setup
└── CHANGELOG.md            # Project changelog and version history

## Setup Instructions

### Client (React Frontend)
1. Navigate to the client directory:
   ```bash
   cd Note/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. The app will be available at `http://localhost:3000`.

### Server (PHP Backend API)
1. Ensure you have PHP and MySQL installed and running.
2. Configure your MySQL database and user. The default credentials in `server/api/index.php` are:
   - Host: `localhost`
   - Database: `notes_db`
   - User: `notes_user`
   - Password: `SecurePass123!`
3. Import the database schema and migrations located in `server/db/migrations/`.
4. Start your PHP server pointing to the `server/api` directory or configure your web server accordingly.
5. The API will be accessible at `http://localhost` or your configured domain.

## Database
- The database schema supports notes with multiple types (text, list, drawing).
- Notes can have labels, colors, pinned status, reminders, and soft deletion (status).
- List items are stored in a separate table linked to notes.
- Migrations are located in `server/db/migrations/`.

## Additional Information
- The client uses React Router for navigation and Context API for auth and theming.
- The server API supports CORS for requests from the client.
- For frontend details, see `Note/client/README.md`.

## Contributing
Please follow standard Git workflows and document your changes in the `CHANGELOG.md`.

## License
Specify your project license here.
