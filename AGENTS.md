# Project Rules for DropAir

## Strict Modification Rules

### ALLOWED CHANGES
- **ONLY** modify files within the `/public` directory
- UI changes only (HTML, CSS, JavaScript for frontend)
- Styling and visual improvements
- Frontend behavior modifications (app.js)

### FORBIDDEN CHANGES
- **NEVER** modify any function logic outside `/public` folder
- **NEVER** change server.js or any backend logic
- **NEVER** modify utility functions in `/utils` folder
- **NEVER** change upload handling in `/upload` folder
- **NEVER** modify download handling in `/downlaod` folder
- **NEVER** change package.json or dependencies
- **NEVER** modify server configuration or routing

## Project Structure
```
dropair/
├── public/          # ONLY MODIFY FILES HERE
│   ├── index.html   # UI HTML
│   ├── style.css    # UI Styling
│   └── app.js       # Frontend JavaScript
├── server.js        # DO NOT MODIFY
├── utils/           # DO NOT MODIFY
├── upload/          # DO NOT MODIFY
└── downlaod/        # DO NOT MODIFY
```

## Functionality
This is a file sharing application with:
- File upload functionality
- File download functionality  
- QR code generation for sharing
- File listing API

All backend functions are working correctly and should not be touched. Only UI improvements in the `/public` folder are permitted.

## Verification
When making changes:
1. Ensure all modifications are within `/public` directory
2. Test that existing functionality still works
3. Do not break any existing features
