"use client";

import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Button } from '@/components/ui/button';
import { getCroppedImg } from '@/lib/cropImage';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: { file: Blob; url: string }) => void;
  onCancel: () => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropCompleteCallback = useCallback(
    (_: any, croppedAreaPixels: {
      x: number;
      y: number;
      width: number;
      height: number;
    }) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCropImage = async () => {
    try {
      if (!croppedAreaPixels) return;

      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-[#1c0f2e] rounded-xl p-6 w-full max-w-xl">
        <h3 className="text-white text-lg font-semibold mb-4">Crop Image</h3>

        <div className="relative h-96 w-full mb-4">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={3 / 2}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleteCallback}
            objectFit="contain"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-1 text-sm">Zoom</label>
          <input
            type="range"
            min={1}
            max={5}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-purple-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            onClick={onCancel}
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCropImage}
            className="bg-[#715cff] hover:bg-[#5740b2] text-white"
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
