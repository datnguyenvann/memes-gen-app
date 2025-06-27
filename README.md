# Meme Generator App

A modern React-based meme generator application that allows users to create and edit memes with ease.

## Features

- **Image Upload**: Upload images from your device
- **Text Editor**: Add customizable text at any position on the image
- **Emoji Stickers**: Choose from a variety of emoji stickers
- **Image Filters**: Apply filters like grayscale, sepia, blur, brightness, and contrast
- **Export**: Download your edited memes as PNG files
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **React** with Vite for fast development
- **Fabric.js** for powerful canvas manipulation
- **TailwindCSS** for modern, responsive styling
- **Frontend-only** - no backend required

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Upload an Image**: Click "Tải ảnh" and select an image from your device
2. **Add Text**: Enter text in the input field and click "Thêm văn bản"
3. **Add Stickers**: Click on any emoji sticker to add it to your image
4. **Apply Filters**: Select an image object and choose from various filters
5. **Edit Objects**: Click on any text or sticker to move, resize, or rotate it
6. **Delete Objects**: Select an object and click "Xóa đối tượng"
7. **Export**: Click "Tải xuống" to save your meme

## Project Structure

```
src/
├── MemeEditor.jsx    # Main meme editor component
├── App.jsx          # App wrapper
├── index.css        # TailwindCSS imports and global styles
└── main.jsx         # React entry point
```

## Development

This project uses:
- Vite for fast development and building
- ESLint for code linting
- TailwindCSS for utility-first styling

All image processing happens client-side using Fabric.js Canvas API.
