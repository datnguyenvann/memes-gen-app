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
  const [objectCount, setObjectCount] = useState(0);

  // Fetch stickers từ API với error handling tốt hơn
  const fetchStickers = async (query = 'happy') => {
    setLoadingStickers(true);
    try {
      // Sử dụng Giphy API (public key - giới hạn 100 requests/giờ)
      const API_KEY = 'GlVGYHkr3WSBnllca54iNt0yFbjz7L65'; // Public demo key
      const response = await fetch(
        `https://api.giphy.com/v1/stickers/search?api_key=${API_KEY}&q=${query}&limit=50&rating=g`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && data.data.length > 0) {
        const stickers = data.data.map(item => ({
          id: item.id,
          url: item.images.fixed_height_small.url,
          title: item.title
        }));
        setApiStickers(stickers);
      } else {
        setApiStickers([]);
        console.warn('Không tìm thấy stickers cho từ khóa:', query);
      }
    } catch (error) {
      console.error('Error fetching stickers:', error);
      // Fallback to emoji if API fails
      setApiStickers([]);
      alert('Không thể tải stickers từ API. Vui lòng thử lại sau hoặc sử dụng emoji.');
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

    // Theo dõi thay đổi trên canvas để cập nhật object count
    const updateObjectCount = () => {
      setObjectCount(canvasInstance.getObjects().length);
    };

    canvasInstance.on('object:added', updateObjectCount);
    canvasInstance.on('object:removed', updateObjectCount);

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
    if (file && canvas) {
      const reader = new FileReader();
      reader.onload = (e) => {
        fabric.Image.fromURL(e.target.result, (img) => {
          // Thay đổi kích thước ảnh cho vừa canvas động
          const scale = Math.min(
            (canvasSize.width * 0.8) / img.width, 
            (canvasSize.height * 0.8) / img.height
          );
          
          img.scale(scale);
          img.set({
            left: (canvasSize.width - img.width * scale) / 2,
            top: (canvasSize.height - img.height * scale) / 2,
            selectable: true,
            evented: true,
            lockUniScaling: false
          });

          // Xóa chỉ ảnh cũ (background), giữ lại text và stickers
          const objects = canvas.getObjects();
          objects.forEach(obj => {
            if (obj.type === 'image') {
              canvas.remove(obj);
            }
          });

          // Thêm ảnh mới làm background (thêm vào đầu)
          canvas.insertAt(img, 0);
          canvas.renderAll();
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Thêm văn bản với positioning ngẫu nhiên
  const addText = () => {
    if (textInput.trim() && canvas) {
      const text = new fabric.Text(textInput, {
        left: Math.random() * (canvasSize.width - 200),
        top: Math.random() * (canvasSize.height - 100),
        fontFamily: 'Arial',
        fontSize: fontSize,
        fill: textColor,
        stroke: '#ffffff',
        strokeWidth: 2,
        shadow: 'rgba(0,0,0,0.3) 2px 2px 2px',
        selectable: true,
        hasControls: true,
        cornerSize: 10,
        transparentCorners: false
      });
      
      canvas.add(text);
      canvas.setActiveObject(text);
      canvas.renderAll();
      setTextInput('');
    }
  };

  // Thêm sticker từ URL (API) với error handling
  const addStickerFromUrl = (url) => {
    if (canvas) {
      fabric.Image.fromURL(url, (img) => {
        if (img && img.width && img.height) {
          // Scale theo kích thước canvas
          const maxSize = Math.min(canvasSize.width, canvasSize.height) * 0.2;
          const scale = Math.min(maxSize / img.width, maxSize / img.height);
          
          img.scale(scale);
          img.set({
            left: Math.random() * (canvasSize.width - img.width * scale),
            top: Math.random() * (canvasSize.height - img.height * scale),
            selectable: true,
            hasControls: true,
            cornerSize: 10,
            transparentCorners: false
          });
          
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        }
      }, { crossOrigin: 'anonymous' });
    }
  };

  // Thêm emoji sticker với positioning ngẫu nhiên
  const addSticker = (sticker) => {
    if (canvas) {
      const text = new fabric.Text(sticker, {
        left: Math.random() * (canvasSize.width - 100),
        top: Math.random() * (canvasSize.height - 100),
        fontSize: 50,
        selectable: true,
        hasControls: true,
        cornerSize: 10,
        transparentCorners: false
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
        case 'none':
          // Không thêm filter nào
          break;
      }

      activeObject.applyFilters();
      canvas.renderAll();
      setSelectedFilter(filterType);
    } else if (filterType !== 'none') {
      // Thông báo cho user nếu chưa chọn ảnh
      alert('Vui lòng chọn một ảnh trước khi áp dụng hiệu ứng!');
    } else {
      setSelectedFilter(filterType);
    }
  };

  // Xuất ảnh với chất lượng cao và tên file có timestamp
  const exportImage = () => {
    if (canvas) {
      const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2 // Tăng độ phân giải gấp đôi
      });
      
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      link.download = `meme-${timestamp}.png`;
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

  // Xóa tất cả với xác nhận
  const clearCanvas = () => {
    if (canvas && objectCount > 0) {
      if (window.confirm('Bạn có chắc chắn muốn xóa tất cả đối tượng trên canvas?')) {
        canvas.clear();
        canvas.backgroundColor = '#f0f0f0';
        canvas.renderAll();
      }
    } else if (canvas) {
      canvas.clear();
      canvas.backgroundColor = '#f0f0f0';
      canvas.renderAll();
    }
  };

  // Copy/duplicate đối tượng được chọn
  const duplicateSelected = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.clone((cloned) => {
          cloned.set({
            left: cloned.left + 20,
            top: cloned.top + 20,
          });
          canvas.add(cloned);
          canvas.setActiveObject(cloned);
          canvas.renderAll();
        });
      }
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
                  <li>• Số đối tượng trên canvas: {objectCount}</li>
                </ul>
              </div>
              <div className="canvas-wrapper">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-300 max-w-full rounded-lg shadow-sm"
                />
              </div>
            </div>

            <br/>

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
                  onClick={duplicateSelected}
                  className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                >
                  Sao chép đối tượng
                </button>
                <button
                  onClick={exportImage}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Tải xuống
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemeEditor;
