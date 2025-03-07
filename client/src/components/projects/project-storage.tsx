
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Trash2, Download } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

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

  useEffect(() => {
    setUploadedFiles(existingFiles);
  }, [existingFiles]);

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
        // Solo permitir un archivo por proyecto
        const newFile = validFiles[0];
        setFiles([newFile]);
        if (onFilesChange) {
          onFilesChange([newFile]);
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
      setUploadedFiles([]);
      toast({
        title: "Archivo eliminado",
        description: `El archivo ha sido eliminado correctamente`,
      });
      
      // Limpiar cualquier archivo en la cola si existe
      setFiles([]);
      
      if (onFilesChange) {
        onFilesChange([]);
      }
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
      setUploadedFiles(result.filenames);
      setFiles([]);
      
      toast({
        title: "Archivo subido",
        description: "El archivo ha sido subido exitosamente",
      });
    } catch (error) {
      toast({
        title: "Error al subir archivo",
        description: "No se pudo subir el archivo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFile = (filename: string) => {
    if (!projectId) return;
    window.open(`/api/projects/${projectId}/files/${filename}/download`, '_blank');
  };

  return (
    <div className="space-y-4">
      {uploadedFiles.length > 0 ? (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Documentación actual:</h4>
          {uploadedFiles.map((filename, index) => (
            <div key={index} className="flex items-center justify-between p-2 border rounded-md">
              <span className="text-sm truncate flex-1">{filename}</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => downloadFile(filename)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Descargar
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => removeUploadedFile(filename)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col space-y-2">
          <Label htmlFor="files">Subir documentación</Label>
          <div className="flex items-center gap-2">
            <Input 
              id="files" 
              type="file"
              accept=".zip,.rar"
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
          {files.length > 0 && (
            <div className="mt-2">
              <h4 className="text-sm font-medium">Archivo seleccionado:</h4>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-md mt-1">
                  <span className="text-sm truncate">{file.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeFile(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
