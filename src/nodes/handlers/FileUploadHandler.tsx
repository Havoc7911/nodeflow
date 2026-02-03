/**
 * FileUploadHandler.tsx
 * Handler for file upload nodes with drag-and-drop functionality
 * Uses react-dropzone for enhanced file upload experience
 */

import { Node } from '@xyflow/react';
import { NodeHandler, NodeInputs, NodeOutput, ExecutionContext } from './NodeHandler';
import React, { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';

interface FileUploadConfig {
  acceptedTypes?: string;
  maxFileSize?: number; // in MB
  multiple?: boolean;
}

interface FileData {
  name: string;
  size: number;
  type: string;
  content: string | ArrayBuffer | null;
  uploadedAt: string;
}

export class FileUploadHandler extends NodeHandler {
  async execute(
    node: Node,
    inputs: NodeInputs,
    context: ExecutionContext
  ): Promise<NodeOutput> {
    const config = (node.data as any)?.config as FileUploadConfig || {};
    const files = inputs.files as File[] || [];

    if (!files || files.length === 0) {
      return {
        success: false,
        error: 'No files provided',
        data: null
      };
    }

    try {
      // Process uploaded files
      const processedFiles: FileData[] = await Promise.all(
        files.map(async (file) => {
          // Read file content
          const content = await this.readFileContent(file);
          
          return {
            name: file.name,
            size: file.size,
            type: file.type,
            content,
            uploadedAt: new Date().toISOString()
          };
        })
      );

      return {
        success: true,
        data: {
          files: processedFiles,
          count: processedFiles.length,
          totalSize: processedFiles.reduce((sum, f) => sum + f.size, 0)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: `File processing failed: ${error}`,
        data: null
      };
    }
  }

  private readFileContent(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('File reading failed'));
      
      // Read as text for text files, as data URL for others
      if (file.type.startsWith('text/') || file.name.endsWith('.json')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    });
  }

  validate(config: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (config.maxFileSize && config.maxFileSize <= 0) {
      errors.push('Max file size must be positive');
    }

    if (config.maxFileSize && config.maxFileSize > 100) {
      errors.push('Max file size cannot exceed 100 MB');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * React component for file upload with drag-and-drop
 * To be used in NodeConfigPanel or as standalone component
 */
export interface FileUploadComponentProps {
  config: FileUploadConfig;
  onFilesSelected: (files: File[]) => void;
  onError?: (error: string) => void;
}

export const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  config,
  onFilesSelected,
  onError
}) => {
  const maxSizeBytes = (config.maxFileSize || 10) * 1024 * 1024;
  
  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    if (fileRejections.length > 0) {
      const errors = fileRejections.map(rejection => 
        rejection.errors.map(e => e.message).join(', ')
      );
      onError?.(errors.join('; '));
    }
    
    if (acceptedFiles.length > 0) {
      onFilesSelected(acceptedFiles);
    }
  }, [onFilesSelected, onError]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: config.acceptedTypes ? 
      config.acceptedTypes.split(',').reduce((acc, type) => {
        acc[type.trim()] = [];
        return acc;
      }, {} as Record<string, string[]>) : undefined,
    maxSize: maxSizeBytes,
    multiple: config.multiple ?? true
  });

  return (
    <div
      {...getRootProps()}
      style={{
        border: '2px dashed #007acc',
        borderRadius: '8px',
        padding: '40px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: isDragActive ? '#2d2d30' : '#1e1e1e',
        borderColor: isDragReject ? '#f48771' : isDragActive ? '#4ec9b0' : '#007acc',
        transition: 'all 0.2s ease'
      }}
    >
      <input {...getInputProps()} />
      {isDragActive ? (
        <p style={{ color: '#4ec9b0', margin: 0 }}>
          Drop files here...
        </p>
      ) : isDragReject ? (
        <p style={{ color: '#f48771', margin: 0 }}>
          Some files will be rejected
        </p>
      ) : (
        <div>
          <p style={{ color: '#d4d4d4', margin: '0 0 10px 0' }}>
            Drag & drop files here, or click to select
          </p>
          <p style={{ color: '#858585', fontSize: '12px', margin: 0 }}>
            {config.acceptedTypes && `Accepted: ${config.acceptedTypes}`}
            {config.maxFileSize && ` | Max size: ${config.maxFileSize}MB`}
            {config.multiple === false && ' | Single file only'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadHandler;