import { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Upload, X, Image as ImageIcon, Loader2, Link as LinkIcon } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Default placeholder image
const DEFAULT_PLACEHOLDER = "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=400&fit=crop";

export default function ImageUpload({ 
  value = '', 
  onChange, 
  label = "Cover Image",
  placeholder = DEFAULT_PLACEHOLDER,
  folder = "drepanhope"
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  const imageUrl = value || placeholder;

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPEG, PNG, WebP, or GIF.');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const token = localStorage.getItem('drepanhope_token');
      const response = await axios.post(`${API}/upload/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        onChange(response.data.url);
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
      toast.success('Image URL set!');
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <Label>{label}</Label>
      
      {/* Preview */}
      <div className="relative">
        <div 
          className={`
            relative aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer
            ${isDragging ? 'border-teal-500 bg-teal-50' : 'border-slate-200 hover:border-slate-300'}
            ${isUploading ? 'opacity-50' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Cover preview" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = placeholder;
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <ImageIcon className="w-12 h-12 mb-2" />
              <p className="text-sm">No image selected</p>
            </div>
          )}
          
          {/* Upload Overlay */}
          <div className={`
            absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity
            ${isDragging ? 'opacity-100' : ''}
          `}>
            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                <p className="text-sm">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2" />
                <p className="text-sm font-medium">Click or drag to upload</p>
                <p className="text-xs text-white/70 mt-1">JPEG, PNG, WebP, GIF (max 10MB)</p>
              </>
            )}
          </div>
        </div>

        {/* Remove Button */}
        {value && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 rounded-full w-8 h-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1"
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Image
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUrlInput(!showUrlInput)}
          disabled={isUploading}
        >
          <LinkIcon className="w-4 h-4" />
        </Button>
      </div>

      {/* URL Input (Advanced) */}
      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            placeholder="Paste image URL..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            size="sm"
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}
          >
            Set URL
          </Button>
        </div>
      )}

      {/* Current URL Display */}
      {value && (
        <p className="text-xs text-slate-500 truncate">
          Current: {value}
        </p>
      )}
    </div>
  );
}
