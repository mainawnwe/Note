# Changelog

## [Unreleased]

- Added label creation and assignment functionality in CreateArea component for note creation, allowing users to select and create labels similar to Google Keep.

- Fixed profile picture path handling in `AuthContext.js` to correctly format image URLs for profile pictures.
- Improved error handling and logging in `App.js` for fetching labels from the backend API.
- Verified existence of backend API endpoints for profile and labels.
- Confirmed presence of profile images in backend uploads directory.
- Investigated and identified missing or incorrect backend API files and uploads as root cause of profile pictures and labels not displaying.
- Prepared to restore or fix backend API endpoints and uploads if missing or corrupted.
- Ensured changelog updates append new entries without clearing previous information.
- Updated profile picture URLs in `Header.js` to use correct backend uploads path `/api/uploads/` for proper image loading in header and dropdown.

All notable changes to this project will be documented in this file.

### Changed
- Improved background and text color balance in NoteDetailsModal component:
  - Dynamically compute text color based on background color luminance.
  - Use white text on black or very dark backgrounds, black text otherwise.
  - Applied consistent text color styling to all text elements inside the modal.
- Updated Note component (note cards) to use similar text color logic:
  - Text color switches to white only on black or very dark backgrounds.
  - Black text used for all other background colors for better readability.
- Fixed search API parameter binding issue causing search failures.
- Corrected frontend search API URL to match backend server setup.

## [1.0.0] - 2024-06-10
### Added
- Initial project setup with React frontend and PHP backend API.
- Support for multiple note types: text, list, drawing, image.
- User authentication and profile management.
- Note CRUD operations with reminders and status.
- Categorized search and theming support.

### Changed
- N/A

### Fixed
- N/A
