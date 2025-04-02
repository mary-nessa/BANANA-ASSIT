// components/FileUploader.tsx
"use client";

export default function FileUploader() {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Dispatch upload start event
    window.dispatchEvent(new CustomEvent('upload-start'));

    const formData = new FormData();
    Array.from(files).forEach(file => formData.append('files', file));

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.min(99, (event.loaded / event.total) * 100);
          window.dispatchEvent(new CustomEvent('upload-progress', {
            detail: { progress }
          }));
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          window.dispatchEvent(new CustomEvent('upload-progress', {
            detail: { progress: 100 }
          }));
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('upload-complete'));
          }, 500);
        } else {
          window.dispatchEvent(new CustomEvent('upload-error'));
        }
      };

      xhr.onerror = () => {
        window.dispatchEvent(new CustomEvent('upload-error'));
      };

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    } catch (error) {
      window.dispatchEvent(new CustomEvent('upload-error'));
    }
  };

  return (
    <div className="p-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Upload Banana Images
      </label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-semibold
          file:bg-green-50 file:text-green-700
          hover:file:bg-green-100"
      />
    </div>
  );
}