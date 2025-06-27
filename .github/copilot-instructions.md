<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Meme Generator App

This is a React-based meme generator application that allows users to:
- Upload images from their device
- Add text to images at any position
- Add emoji stickers
- Apply basic image filters (grayscale, blur, contrast, etc.)
- Export and download edited images

## Tech Stack
- React (with Vite)
- Fabric.js for canvas manipulation
- TailwindCSS for styling
- All processing is done on the frontend, no backend required

## Key Components
- `MemeEditor.jsx` - Main component handling all editing functionality
- Uses fabric.js Canvas for image manipulation
- TailwindCSS for responsive, modern UI design

## Development Notes
- Use fabric.js APIs for canvas operations
- Ensure responsive design with TailwindCSS
- All image processing happens client-side
- Export functionality uses canvas.toDataURL()
