import { useState, useEffect, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Play, ChevronLeft, ChevronRight, Download, Loader2, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { mediaService } from '../../services/mediaService';

const MediaGallery = ({ planId }) => {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const fileInputRef = useRef(null);

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

    // Validate file sizes (50MB max)
    const maxSize = 50 * 1024 * 1024;
    const oversizedFiles = files.filter(f => f.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast.error('Some files are too large. Maximum size is 50MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      if (files.length === 1) {
        await mediaService.uploadSingleMedia(planId, files[0]);
      } else {
        await mediaService.uploadMultipleMedia(planId, files);
      }
      toast.success(`${files.length} file(s) uploaded successfully`);
      fetchMedia();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload media');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Delete this media?')) return;

    try {
      await mediaService.deleteMedia(mediaId);
      toast.success('Media deleted');
      if (selectedMedia?.id === mediaId) {
        setSelectedMedia(null);
      }
      fetchMedia();
    } catch (error) {
      toast.error('Failed to delete media');
    }
  };

  const openMediaViewer = (item, index) => {
    setSelectedMedia(item);
    setSelectedIndex(index);
  };

  const navigateMedia = (direction) => {
    const newIndex = selectedIndex + direction;
    if (newIndex >= 0 && newIndex < media.length) {
      setSelectedIndex(newIndex);
      setSelectedMedia(media[newIndex]);
    }
  };

  const handleKeyDown = (e) => {
    if (!selectedMedia) return;
    if (e.key === 'ArrowLeft') navigateMedia(-1);
    if (e.key === 'ArrowRight') navigateMedia(1);
    if (e.key === 'Escape') setSelectedMedia(null);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMedia, selectedIndex]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Media ({media.length})</h2>
        <label className="cursor-pointer">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
          <Button as="span" disabled={uploading} className="cursor-pointer">
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Camera className="w-5 h-5 mr-2" />
                Upload Photos
              </>
            )}
          </Button>
        </label>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : media.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-gray-300">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No photos yet</h3>
          <p className="text-gray-600 mb-6">Upload photos and videos to share memories with your group</p>
          <label className="cursor-pointer inline-block">
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime,video/webm"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
            <Button as="span" variant="secondary" className="cursor-pointer">
              <Upload className="w-5 h-5 mr-2" />
              Choose Files
            </Button>
          </label>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {media.map((item, index) => (
            <div
              key={item.id}
              className="relative group aspect-square rounded-xl overflow-hidden cursor-pointer bg-gray-100 shadow-sm hover:shadow-md transition-shadow"
              onClick={() => openMediaViewer(item, index)}
            >
              {item.type === 'IMAGE' ? (
                <img
                  src={item.url}
                  alt={item.caption || ''}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              ) : (
                <>
                  <img
                    src={item.thumbnail || item.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <div className="w-12 h-12 rounded-full bg-white bg-opacity-90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-gray-900 ml-1" fill="currentColor" />
                    </div>
                  </div>
                </>
              )}
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {item.uploader?.displayName || item.uploader?.username}
                  </p>
                  <p className="text-white/70 text-xs">{formatDate(item.createdAt)}</p>
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMedia(item.id);
                }}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
          className="fixed inset-0 z-50 bg-black flex flex-col"
          onClick={() => setSelectedMedia(null)}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setSelectedMedia(null)}
                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <div className="text-white">
                <p className="font-medium">{selectedMedia.uploader?.displayName || selectedMedia.uploader?.username}</p>
                <p className="text-sm text-white/70">{formatDate(selectedMedia.createdAt)}</p>
              </div>
            </div>
            <div className="text-white/70">
              {selectedIndex + 1} / {media.length}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex items-center justify-center relative" onClick={(e) => e.stopPropagation()}>
            {/* Previous button */}
            {selectedIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigateMedia(-1); }}
                className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Media content */}
            <div className="max-w-full max-h-full p-4">
              {selectedMedia.type === 'IMAGE' ? (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.caption || ''}
                  className="max-w-full max-h-[calc(100vh-200px)] object-contain rounded-lg"
                />
              ) : (
                <video
                  src={selectedMedia.url}
                  controls
                  autoPlay
                  className="max-w-full max-h-[calc(100vh-200px)] rounded-lg"
                />
              )}
            </div>

            {/* Next button */}
            {selectedIndex < media.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); navigateMedia(1); }}
                className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>

          {/* Caption */}
          {selectedMedia.caption && (
            <div className="p-4 bg-gradient-to-t from-black/80 to-transparent">
              <p className="text-white text-center">{selectedMedia.caption}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
