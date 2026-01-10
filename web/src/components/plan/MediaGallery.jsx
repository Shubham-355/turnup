import { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { mediaService } from '../../services/mediaService';

const MediaGallery = ({ planId }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    fetchMedia();
  }, [planId]);

  const fetchMedia = async () => {
    try {
      const response = await mediaService.getMedia(planId);
      setMedia(response.data?.items || []);
    } catch (error) {
      toast.error('Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));

    try {
      await mediaService.uploadMedia(planId, formData);
      toast.success('Media uploaded successfully');
      fetchMedia();
    } catch (error) {
      toast.error('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Delete this media?')) return;

    try {
      await mediaService.deleteMedia(mediaId);
      toast.success('Media deleted');
      fetchMedia();
    } catch (error) {
      toast.error('Failed to delete media');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Media</h2>
        <label>
          <input
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button as="span" disabled={uploading}>
            <Upload className="w-5 h-5 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Media'}
          </Button>
        </label>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading media...</div>
      ) : media.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No media yet</h3>
          <p className="text-gray-600">Upload photos and videos to share with your group</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="relative group aspect-square rounded-lg overflow-hidden cursor-pointer"
              onClick={() => setSelectedMedia(item)}
            >
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                />
              ) : (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMedia(item.id);
                }}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedMedia(null)}
        >
          {selectedMedia.type === 'image' ? (
            <img
              src={selectedMedia.url}
              alt=""
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <video
              src={selectedMedia.url}
              controls
              className="max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
