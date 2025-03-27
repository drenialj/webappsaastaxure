import { useRef, useState } from 'react';
import { useFileUpload } from '@/hooks/useFileUpload';

export function FileUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile, uploading, error } = useFileUpload();
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setSuccess(false);
      await uploadFile(file);
      setSuccess(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Upload fehlgeschlagen:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={uploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
      </div>

      {uploading && (
        <div className="text-sm text-gray-500">
          Wird hochgeladen...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600">
          Fehler: {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-600">
          Datei erfolgreich hochgeladen!
        </div>
      )}
    </div>
  );
} 