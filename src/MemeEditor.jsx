import React, { useRef, useEffect, useState } from 'react';
import { fabric } from 'fabric';

const MemeEditor = () => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [textInput, setTextInput] = useState('');
  const [textColor, setTextColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(30);
  const [apiStickers, setApiStickers] = useState([]);
  const [loadingStickers, setLoadingStickers] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Fetch stickers từ API
  const fetchStickers = async (query = 'happy') => {
    setLoadingStickers(true);
    try {
      // Sử dụng Giphy API (public key - giới hạn 100 requests/giờ)
      const API_KEY = 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65'; // Public demo key
      const response = await fetch(
        `https://api.giphy.com/v1/stickers/search?api_key=${API_KEY}&q=${query}&limit=50&rating=g`
      );
      const data = await response.json();
      
      if (data.data) {
        const stickers = data.data.map(item => ({
          id: item.id,
          url: item.images.fixed_height_small.url,
          title: item.title
        }));
        setApiStickers(stickers);
      }
    } catch (error) {
      console.error('Error fetching stickers:', error);
      // Fallback to emoji if API fails
      setApiStickers([]);
    }
    setLoadingStickers(false);
  };

  // Load stickers khi component mount
  useEffect(() => {
    fetchStickers('meme');
  }, []);

  // Danh sách emoji mặc định
  const emojiStickers = [
    '😀', '😂', '😍', '🤔', '😎', '🔥', '💯', '👍', '❤️', '😭', 
    '🤣', '🙄', '🎉', '✨', '💪', '👌', '🤷‍♂️', '🤦‍♂️', '💀', '🤡',
    '🙃', '😱', '🤯', '👏', '🙏', '💰', '🎯', '⚡', '🌟', '🚀',
    '😊', '😉', '😋', '😘', '🥰', '🤗', '🤭', '🤫', '🤨', '😏',
    '😒', '🙄', '😬', '🤐', '🤢', '🤮', '🤧', '🥵', '🥶', '😵',
    '🤠', '🥳', '🥸', '😇', '🤓', '🧐', '😈', '👿', '👹', '👺',
    '🎭', '🎪', '🎨', '🎬', '🎤', '🎧', '🎵', '🎶', '🎸', '🥁',
    '🍕', '🍔', '🌭', '🍟', '🍿', '🥤', '☕', '🍰', '🎂', '🍪'
  ];

  // Danh sách hiệu ứng
  const filters = [
    { name: 'none', label: 'Không có' },
    { name: 'grayscale', label: 'Đen trắng' },
    { name: 'sepia', label: 'Sepia' },
    { name: 'blur', label: 'Mờ' },
    { name: 'brightness', label: 'Sáng' },
    { name: 'contrast', label: 'Tương phản' }
  ];

  // Tính toán kích thước canvas dựa trên màn hình
  const calculateCanvasSize = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Responsive breakpoints
    let width, height;
    
    if (screenWidth >= 1024) { // Desktop
      width = Math.min(800, screenWidth * 0.5);
      height = Math.min(600, screenHeight * 0.7);
    } else if (screenWidth >= 768) { // Tablet
      width = Math.min(600, screenWidth * 0.8);
      height = Math.min(450, screenHeight * 0.6);
    } else { // Mobile
      width = Math.min(400, screenWidth * 0.9);
      height = Math.min(300, screenHeight * 0.5);
    }
    
    return { width: Math.floor(width), height: Math.floor(height) };
  };

  useEffect(() => {
    // Tính toán kích thước canvas
    const size = calculateCanvasSize();
    setCanvasSize(size);
    
    // Khởi tạo canvas
    const canvasInstance = new fabric.Canvas(canvasRef.current, {
      width: size.width,
      height: size.height,
      backgroundColor: '#f0f0f0'
    });

    setCanvas(canvasInstance);

    // Xử lý phím tắt
    const handleKeyPress = (e) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const activeObject = canvasInstance.getActiveObject();
        if (activeObject) {
          canvasInstance.remove(activeObject);
          canvasInstance.renderAll();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    // Xử lý resize window
    const handleResize = () => {
      const newSize = calculateCanvasSize();
      setCanvasSize(newSize);
      canvasInstance.setDimensions({
        width: newSize.width,
        height: newSize.height
      });
      canvasInstance.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvasInstance.dispose();
      document.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Tải ảnh từ máy
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        fabric.Image.fromURL(e.target.result, (img) => {
          // Thay đổi kích thước ảnh cho vừa canvas động
          const scale = Math.min(canvasSize.width / img.width, canvasSize.height / img.height);
          
          img.scale(scale);
          img.set({
            left: (canvasSize.width - img.width * scale) / 2,
            top: (canvasSize.height - img.height * scale) / 2
          });

          canvas.clear();
          canvas.add(img);
          canvas.centerObject(img);
          canvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Thêm văn bản
  const addText = () => {
    if (textInput.trim() && canvas) {
      const text = new fabric.Text(textInput, {
        left: 100,
        top: 100,
        fontFamily: 'Arial',
        fontSize: fontSize,
        fill: textColor,
        stroke: '#ffffff',
        strokeWidth: 2,
        shadow: 'rgba(0,0,0,0.3) 2px 2px 2px'
      });
      
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      setTextInput('');
    }
  };

  // Thêm sticker từ URL (API)
  const addStickerFromUrl = (url) => {
    if (canvas) {
      fabric.Image.fromURL(url, (img) => {
        img.scale(0.5); // Scale down sticker
        img.set({
          left: 150,
          top: 150,
          selectable: true,
          hasControls: true
        });
        
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
    }
  };

  // Thêm emoji sticker
  const addSticker = (sticker) => {
    if (canvas) {
      const text = new fabric.Text(sticker, {
        left: 150,
        top: 150,
        fontSize: 50
      });
      
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
    }
  };

  // Áp dụng hiệu ứng
  const applyFilter = (filterType) => {
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'image') {
      // Xóa filter cũ
      activeObject.filters = [];

      // Áp dụng filter mới
      switch (filterType) {
        case 'grayscale':
          activeObject.filters.push(new fabric.Image.filters.Grayscale());
          break;
        case 'sepia':
          activeObject.filters.push(new fabric.Image.filters.Sepia());
          break;
        case 'blur':
          activeObject.filters.push(new fabric.Image.filters.Blur({ blur: 0.1 }));
          break;
        case 'brightness':
          activeObject.filters.push(new fabric.Image.filters.Brightness({ brightness: 0.3 }));
          break;
        case 'contrast':
          activeObject.filters.push(new fabric.Image.filters.Contrast({ contrast: 0.3 }));
          break;
      }

      activeObject.applyFilters();
      canvas.renderAll();
    }
    setSelectedFilter(filterType);
  };

  // Xuất ảnh
  const exportImage = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
      });
      
      const link = document.createElement('a');
      link.download = 'meme.png';
      link.href = dataURL;
      link.click();
    }
  };

  // Xóa đối tượng được chọn
  const deleteSelected = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
      }
    }
  };

  // Xóa tất cả
  const clearCanvas = () => {
    if (canvas) {
      canvas.clear();
      canvas.backgroundColor = '#f0f0f0';
      canvas.renderAll();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          🎨 Meme Generator
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Tạo meme của bạn một cách dễ dàng! Tải ảnh lên, thêm text, sticker và hiệu ứng.
        </p>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Thanh công cụ */}
          <div className="lg:w-1/3 space-y-6">
            {/* Tải ảnh */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3">Tải ảnh</h3>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            {/* Thêm văn bản */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3">Thêm văn bản</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Nhập văn bản..."
                  className="w-full p-2 border border-gray-300 rounded"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Màu chữ
                    </label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kích thước
                    </label>
                    <input
                      type="range"
                      min="12"
                      max="72"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-500">{fontSize}px</span>
                  </div>
                </div>
                <button
                  onClick={addText}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Thêm văn bản
                </button>
              </div>
            </div>

            {/* Stickers */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3">Stickers & Emoji</h3>
              
              {/* Search box cho stickers */}
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Tìm stickers (ví dụ: happy, funny, cat...)"
                  className="w-full p-2 border border-gray-300 rounded"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      fetchStickers(e.target.value || 'meme');
                    }
                  }}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Nhấn Enter để tìm. Hiện có {apiStickers.length} stickers từ Giphy
                </div>
              </div>

              {/* API Stickers */}
              {loadingStickers ? (
                <div className="sticker-container">
                  <div className="loading-placeholder">🔄 Đang tải stickers...</div>
                </div>
              ) : (
                <div className="sticker-container">
                  {apiStickers.map((sticker) => (
                    <button
                      key={sticker.id}
                      onClick={() => addStickerFromUrl(sticker.url)}
                      className="sticker-btn"
                      title={sticker.title}
                    >
                      <img 
                        src={sticker.url} 
                        alt={sticker.title}
                        className="sticker-img"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Emoji Stickers */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Emoji ({emojiStickers.length} emoji):
                </h4>
                <div className="emoji-container">
                  {emojiStickers.map((sticker, index) => (
                    <button
                      key={index}
                      onClick={() => addSticker(sticker)}
                      className="emoji-square-btn"
                      title={`Emoji: ${sticker}`}
                    >
                      {sticker}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Hiệu ứng */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3">Hiệu ứng</h3>
              <div className="space-y-2">
                {filters.map((filter) => (
                  <button
                    key={filter.name}
                    onClick={() => applyFilter(filter.name)}
                    className={`w-full p-2 rounded text-left ${
                      selectedFilter === filter.name
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Thao tác */}
            <div className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-3">Thao tác</h3>
              <div className="space-y-2">
                <button
                  onClick={deleteSelected}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Xóa đối tượng
                </button>
                <button
                  onClick={clearCanvas}
                  className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                >
                  Xóa tất cả
                </button>
                <button
                  onClick={exportImage}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Tải xuống
                </button>
              </div>
            </div>
          </div>

          {/* Khu vực canvas */}
          <div className="lg:w-2/3">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🎯 Hướng dẫn sử dụng:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Kéo thả để di chuyển đối tượng</li>
                  <li>• Click để chọn, kéo góc để thay đổi kích thước</li>
                  <li>• Nhấn Delete/Backspace để xóa đối tượng đã chọn</li>
                  <li>• Chọn ảnh trước khi áp dụng hiệu ứng</li>
                  <li>• Canvas tự động thay đổi kích thước theo màn hình</li>
                  <li>• Kích thước hiện tại: {canvasSize.width} x {canvasSize.height}px</li>
                </ul>
              </div>
              <div className="canvas-wrapper">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-300 max-w-full rounded-lg shadow-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeEditor;
