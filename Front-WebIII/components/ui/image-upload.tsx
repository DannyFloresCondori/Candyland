'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import { fileService } from '@/lib/services/file.service';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
}

export function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  className = '' 
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 🔹 Manejar subida de archivos
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setIsUploading(true);
    const newImageUrls: string[] = [];
    const filesToUpload: File[] = [];

    try {
      // Validar archivos primero
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} no es una imagen válida`);
          continue;
        }

        // Validar tamaño (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} es muy grande (máximo 5MB)`);
          continue;
        }

        filesToUpload.push(file);
      }

      if (filesToUpload.length === 0) {
        setIsUploading(false);
        return;
      }

      // Subir archivos al servidor
      const uploadedUrls = await fileService.uploadMultipleFiles(filesToUpload);
      
      // Agregar las nuevas imágenes
      onImagesChange([...images, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} imagen(es) subida(s) exitosamente`);
    } catch (error) {
      console.error('Error al subir imágenes:', error);
      toast.error('Error al subir las imágenes');
    } finally {
      setIsUploading(false);
    }
  }, [images, maxImages, onImagesChange]);

  // 🔹 Manejar drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);

  // 🔹 Manejar click en input
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  }, [handleFileUpload]);

  // 🔹 Eliminar imagen
  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  // 🔹 Agregar URL manualmente
  const addUrl = useCallback((url: string) => {
    if (images.length >= maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    // Validar URL
    try {
      new URL(url);
      onImagesChange([...images, url]);
      toast.success('URL agregada');
    } catch {
      toast.error('URL inválida');
    }
  }, [images, maxImages, onImagesChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      <Label>Imágenes del producto</Label>
      
      {/* Zona de drop */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className="space-y-2">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
          <p className="text-sm text-foreground/80">
            Arrastra imágenes aquí o{' '}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="text-primary hover:text-primary/90 underline"
            >
              haz clic para seleccionar
            </button>
          </p>
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF hasta 5MB cada una
          </p>
        </div>
      </div>

      {/* Agregar URL manualmente */}
      <div className="flex gap-2">
        <Input
          placeholder="O agrega una URL de imagen"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;
              if (input.value.trim()) {
                addUrl(input.value.trim());
                input.value = '';
              }
            }
          }}
        />
        <Button
          type="button"
          variant="outline"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const input = document.querySelector('input[placeholder*="URL"]') as HTMLInputElement;
            if (input?.value.trim()) {
              addUrl(input.value.trim());
              input.value = '';
            }
          }}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Imágenes seleccionadas ({images.length}/{maxImages})</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border">
                  <Image
                    src={image}
                    alt={`Imagen ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeImage(index);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Estado de carga */}
      {isUploading && (
        <div className="text-center text-sm text-foreground/70">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto mb-2" />
          Procesando imágenes...
        </div>
      )}
    </div>
  );
}
