import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Brush } from 'lucide-react';
import './App.css';

function App() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [blurStrength, setBlurStrength] = useState(5);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (canvasRef.current) {
      ctxRef.current = canvasRef.current.getContext('2d');
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => {
        setCanvasSize({ width: img.width, height: img.height });
        if (canvasRef.current && ctxRef.current) {
          canvasRef.current.width = img.width;
          canvasRef.current.height = img.height;
          ctxRef.current.drawImage(img, 0, 0);
        }
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    ctxRef.current?.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctxRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    ctxRef.current.filter = `blur(${blurStrength}px)`;
    ctxRef.current.beginPath();
    ctxRef.current.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctxRef.current.fill();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Image Editor with Blur Brush</h1>
      <div className="mb-4">
        <Input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
      {imageUrl && (
        <div className="mb-4 overflow-auto" style={{ maxHeight: '60vh' }}>
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onMouseLeave={stopDrawing}
            className="border border-gray-300"
            style={{ maxWidth: '100%', height: 'auto' }}
          />
        </div>
      )}
      <div className="flex space-x-4 mb-4">
        <div className="flex-1">
          <Label htmlFor="brush-size">Brush Size</Label>
          <Slider
            id="brush-size"
            min={1}
            max={100}
            step={1}
            value={[brushSize]}
            onValueChange={(value) => setBrushSize(value[0])}
          />
        </div>
        <div className="flex-1">
          <Label htmlFor="blur-strength">Blur Strength</Label>
          <Slider
            id="blur-strength"
            min={1}
            max={20}
            step={1}
            value={[blurStrength]}
            onValueChange={(value) => setBlurStrength(value[0])}
          />
        </div>
      </div>
      <Button className="w-full">
        <Brush className="mr-2 h-4 w-4" /> Apply Blur
      </Button>
    </div>
  );
}

export default App;