
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Trash2, FileText, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ProjectStorageProps {
  projectId: number | null;
  existingFiles?: string[];
  onFilesChange?: (files: File[] | string[]) => void;
}

export default function ProjectStorage({ 
  projectId, 
  existingFiles = [],
  onFilesChange 
}: ProjectStorageProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>(existingFiles);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      
      // Filter for only .zip and .rar files
      const validFiles = fileList.filter(file => {
        const extension = file.name.toLowerCase().split('.').pop();
        return extension === 'zip' || extension === 'rar';
      });
      
      if (validFiles.length !== fileList.length) {
        toast({
          title: "Archivos no válidos",
          description: "Solo se permiten archivos comprimidos (.zip o .rar)",
          variant: "destructive",
        });
      }
      
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
        if (onFilesChange) {
          onFilesChange([...files, ...validFiles]);
        }
      }
      
      // Reset the input to allow selecting the same file again
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    if (onFilesChange) {
      onFilesChange(newFiles);
    }
  };

  const removeUploadedFile = async (filename: string) => {
    if (!projectId) return;
    
    try {
      await apiRequest("DELETE", `/api/projects/${projectId}/files/${filename}`);
      setUploadedFiles(prev => prev.filter(f => f !== filename));
      toast({
        title: "Archivo eliminado",
        description: `El archivo ${filename} ha sido eliminado`,
      });
    } catch (error) {
      toast({
        title: "Error al eliminar el archivo",
        description: "No se pudo eliminar el archivo",
        variant: "destructive",
      });
    }
  };

  const uploadFiles = async () => {
    if (!projectId || files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Error uploading files');
      }
      
      const result = await response.json();
      setUploadedFiles(prev => [...prev, ...result.filenames]);
      setFiles([]);
      
      toast({
        title: "Archivos subidos",
        description: "Los archivos han sido subidos exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error al subir archivos",
        description: "No se pudieron subir los archivos",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <Label htmlFor="files">Archivos del proyecto</Label>
        <div className="flex items-center gap-2">
          <Input 
            id="files" 
            type="file" 
            multiple 
            onChange={handleFileChange} 
            className="flex-1"
          />
          <Button 
            onClick={uploadFiles} 
            disabled={files.length === 0 || isUploading || !projectId}
            type="button"
          >
            {isUploading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Subir
          </Button>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="border rounded-md p-2">
          <p className="text-sm font-medium mb-2">Archivos para subir:</p>
          <ul className="space-y-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-1 px-2 bg-muted/50 rounded">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm">{file.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeFile(index)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {uploadedFiles.length > 0 && (
        <div className="border rounded-md p-2">
          <p className="text-sm font-medium mb-2">Archivos subidos:</p>
          <ul className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between py-1 px-2 bg-muted/50 rounded">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-sm">{file}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeUploadedFile(file)}
                  type="button"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
