import React, { useRef, useState, useEffect } from 'react';
import { X, Undo, Check, Palette } from 'lucide-react';

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#000000', '#ffffff'];

const ImageEditor = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(COLORS[0]);
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [imageObj, setImageObj] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Load the initial image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      setDimensions({ width: img.width, height: img.height });
      setImageObj(img);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Redraw canvas whenever paths, image, or dimensions change
  useEffect(() => {
    if (!canvasRef.current || !imageObj) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw base image
    ctx.drawImage(imageObj, 0, 0, canvas.width, canvas.height);
    
    // Draw saved paths
    paths.forEach(drawPath);
    
    // Draw current active path
    if (currentPath) {
      drawPath(currentPath);
    }
  }, [imageObj, dimensions, paths, currentPath]);

  const drawPath = (path) => {
    if (!canvasRef.current || path.points.length < 2) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = path.color;
    ctx.lineWidth = 8; // Fixed line width
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.moveTo(path.points[0].x, path.points[0].y);
    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    ctx.stroke();
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    // Handle both mouse and touch events
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    // Prevent default to stop touch scrolling
    if (e.type !== 'mousedown') e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;
    
    setIsDrawing(true);
    setCurrentPath({ color, points: [coords] });
  };

  const draw = (e) => {
    if (!isDrawing) return;
    if (e.type !== 'mousemove') e.preventDefault();
    
    const coords = getCoordinates(e);
    if (!coords) return;
    
    setCurrentPath(prev => ({
      ...prev,
      points: [...prev.points, coords]
    }));
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentPath && currentPath.points.length > 0) {
      setPaths(prev => [...prev, currentPath]);
    }
    setCurrentPath(null);
  };

  const handleUndo = () => {
    setPaths(prev => prev.slice(0, -1));
  };

  const handleSave = () => {
    if (!canvasRef.current) return;
    // Export to blob
    canvasRef.current.toBlob((blob) => {
      onSave(blob);
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
        <button onClick={onCancel} className="text-white p-2 rounded-full hover:bg-white/10">
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleUndo} 
            disabled={paths.length === 0}
            className={`p-2 rounded-full ${paths.length > 0 ? 'text-white hover:bg-white/10' : 'text-gray-600'}`}
          >
            <Undo className="w-6 h-6" />
          </button>
          
          <button onClick={handleSave} className="bg-lily text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-lily/90">
            <Check className="w-5 h-5" />
            Done
          </button>
        </div>
      </div>

      {/* Canvas Container */}
      <div 
        ref={containerRef}
        className="flex-1 flex items-center justify-center overflow-hidden relative touch-none"
      >
        {dimensions.width > 0 ? (
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            className="max-w-full max-h-full object-contain cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            onTouchCancel={stopDrawing}
          />
        ) : (
          <div className="text-white animate-pulse">Loading image...</div>
        )}
      </div>

      {/* Bottom Color Picker */}
      <div className="p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
        <div className="flex items-center space-x-4 bg-white/10 p-3 rounded-full backdrop-blur-md">
          <Palette className="w-5 h-5 text-white/50 mr-2" />
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${color === c ? 'scale-125 border-white' : 'border-transparent hover:scale-110'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
