import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '../useTheme';
import ResourceCreator from './ResourceCreator';
import Button from '../ui/Button';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase/client';

interface ResourceItem {
  id: string;
  name: string;
  type: 'file' | 'folder' | 'resource';
  path?: string;
  storage_path?: string;  // Path in Supabase Storage
  storage_url?: string;   // Public URL to the file
  size?: number;          // File size in bytes
  mime_type?: string;     // File MIME type
  content?: string;       // Deprecated: kept for backward compatibility, but files should use storage
}

interface ResourcesViewProps {
  resources: ResourceItem[];
  onSave: (resources: ResourceItem[]) => Promise<void>;
  onBack?: () => void;
}

export default function ResourcesView({ resources, onSave, onBack }: ResourcesViewProps) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [showCreator, setShowCreator] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('');

  const getUsername = () => {
    if (!user?.email) return 'user';
    return user.email.split('@')[0];
  };

  const getUserId = () => {
    return user?.id || '';
  };

  const getRootPath = () => {
    const userId = getUserId();
    return userId ? `${userId}/` : '';
  };

  const getFolderPath = (folderName: string) => {
    const userId = getUserId();
    return userId ? `${userId}/${folderName}/` : '';
  };

  const getFilePath = (fileName: string, folderPath?: string) => {
    const basePath = folderPath || getRootPath();
    return `${basePath}${fileName}`;
  };

  const getAvailableFolders = () => {
    return resources.filter(r => r.type === 'folder');
  };

  const handleAddFolder = () => {
    setFolderName('');
    setShowFolderModal(true);
  };

  const handleSaveFolder = async () => {
    if (!folderName.trim()) return;
    
    const userId = getUserId();
    if (!userId) {
      alert('User not authenticated. Please log in and try again.');
      return;
    }
    
    try {
      const folderPath = getFolderPath(folderName.trim());
      const newFolder: ResourceItem = {
        id: Date.now().toString(),
        name: folderName.trim(),
        type: 'folder',
        path: folderPath,
        storage_path: folderPath,
      };
      await onSave([...resources, newFolder]);
      setShowFolderModal(false);
      setFolderName('');
    } catch (error) {
      console.error('Error saving folder:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Full error details:', error);
      alert(`Failed to create folder: ${errorMessage}`);
    }
  };

  const handleUploadFile = () => {
    setSelectedFolder('');
    setUploadFiles([]);
    setShowUploadModal(true);
  };

  const handleFileSelect = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          setUploadFiles(Array.from(files));
        }
      };
      input.click();
    }
  };

  const handleSaveUploadedFiles = async () => {
    if (uploadFiles.length === 0) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const newFiles: ResourceItem[] = [];
      const totalFiles = uploadFiles.length;
      const folderPath = selectedFolder || getRootPath();
      const userId = getUserId();
      
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        const fileName = file.name;
        const storagePath = getFilePath(fileName, folderPath);
        
        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('user-files')
          .upload(storagePath, file, {
            cacheControl: '3600',
            upsert: false, // Don't overwrite existing files
          });
        
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw new Error(`Failed to upload ${fileName}: ${uploadError.message}`);
        }
        
        // Get public URL for the file
        const { data: urlData } = supabase.storage
          .from('user-files')
          .getPublicUrl(storagePath);
        
        // Create resource metadata (without file content)
        newFiles.push({
          id: `${Date.now()}-${i}`,
          name: fileName,
          type: 'file',
          path: storagePath,
          storage_path: storagePath,
          storage_url: urlData.publicUrl,
          size: file.size,
          mime_type: file.type,
        });
        
        setUploadProgress(((i + 1) / totalFiles) * 100);
      }
      
      // Save only metadata to database
      await onSave([...resources, ...newFiles]);
      setShowUploadModal(false);
      setUploadFiles([]);
      setSelectedFolder('');
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateResource = () => {
    setShowCreator(true);
  };

  const handleDownloadFile = async (resource: ResourceItem) => {
    if (!resource.storage_path || resource.type !== 'file') return;
    
    try {
      const { data, error } = await supabase.storage
        .from('user-files')
        .download(resource.storage_path);
      
      if (error) throw error;
      
      // For web: create download link
      if (Platform.OS === 'web' && typeof window !== 'undefined' && data) {
        const url = window.URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = resource.name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const handleDeleteFile = async (resourceId: string) => {
    const resource = resources.find(r => r.id === resourceId);
    if (!resource || resource.type !== 'file' || !resource.storage_path) return;
    
    Alert.alert(
      'Delete File',
      `Are you sure you want to delete "${resource.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete from Supabase Storage
              const { error: storageError } = await supabase.storage
                .from('user-files')
                .remove([resource.storage_path!]);
              
              if (storageError) throw storageError;
              
              // Remove from database metadata
              const updatedResources = resources.filter(r => r.id !== resourceId);
              await onSave(updatedResources);
            } catch (error) {
              console.error('Error deleting file:', error);
              Alert.alert('Error', 'Failed to delete file');
            }
          },
        },
      ]
    );
  };

  const handleSaveResource = async (title: string, type: string, content: string) => {
    const newResource: ResourceItem = {
      id: Date.now().toString(),
      name: title,
      type: 'resource',
      content,
    };
    await onSave([...resources, newResource]);
    setShowCreator(false);
  };

  if (showCreator) {
    return (
      <ResourceCreator
        onSave={handleSaveResource}
        onClose={() => setShowCreator(false)}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Header with Actions */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <FontAwesome name="arrow-left" size={16} color={theme.text} />
            </TouchableOpacity>
          )}
          <Text style={[styles.title, { color: theme.text }]}>Resources</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
            onPress={handleAddFolder}
          >
            <FontAwesome name="folder-plus" size={14} color={theme.text} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>Add Folder</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
            onPress={handleUploadFile}
          >
            <FontAwesome name="upload" size={14} color={theme.text} />
            <Text style={[styles.actionButtonText, { color: theme.text }]}>Upload File</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.primary }]}
            onPress={handleCreateResource}
          >
            <FontAwesome name="file-text-o" size={14} color="#FFFFFF" />
            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Create Resource</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* File View */}
      {resources.length === 0 ? (
        <View style={styles.empty}>
          <FontAwesome name="folder-open" size={48} color={theme.textTertiary} />
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No resources yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
            Create resources, upload files, or organize with folders
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.fileList}>
          {resources.map((resource) => (
            <TouchableOpacity
              key={resource.id}
              style={[styles.fileItem, { borderBottomColor: theme.border }]}
            >
              <View style={styles.fileItemLeft}>
                <FontAwesome
                  name={resource.type === 'folder' ? 'folder' : 'file-text-o'}
                  size={16}
                  color={theme.textSecondary}
                />
                <Text style={[styles.fileItemName, { color: theme.text }]}>{resource.name}</Text>
              </View>
              <View style={styles.fileItemActions}>
                {resource.type === 'file' && resource.storage_path && (
                  <>
                    <TouchableOpacity
                      style={styles.fileItemAction}
                      onPress={() => handleDownloadFile(resource)}
                    >
                      <FontAwesome name="download" size={14} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.fileItemAction}
                      onPress={() => handleDeleteFile(resource.id)}
                    >
                      <FontAwesome name="trash" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Add Folder Modal */}
      <Modal
        visible={showFolderModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFolderModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.background + 'B3' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>New Folder</Text>
              <TouchableOpacity onPress={() => setShowFolderModal(false)} style={styles.closeButton}>
                <FontAwesome name="times" size={16} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Folder Name</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border }]}
                value={folderName}
                onChangeText={setFolderName}
                placeholder="Enter folder name"
                placeholderTextColor={theme.textTertiary}
                autoFocus
                onSubmitEditing={handleSaveFolder}
              />
            </View>
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Button
                title="Cancel"
                onPress={() => setShowFolderModal(false)}
                variant="secondary"
                style={styles.modalButton}
              />
              <Button
                title="Create"
                onPress={handleSaveFolder}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Upload File Modal */}
      <Modal
        visible={showUploadModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          if (!uploading) {
            setShowUploadModal(false);
            setUploadFiles([]);
            setSelectedFolder('');
          }
        }}
      >
        <View style={[styles.modalOverlay, { backgroundColor: theme.background + 'B3' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Upload Files</Text>
              {!uploading && (
                <TouchableOpacity onPress={() => {
                  setShowUploadModal(false);
                  setUploadFiles([]);
                  setSelectedFolder('');
                }} style={styles.closeButton}>
                  <FontAwesome name="times" size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.modalBody}>
              <View style={styles.folderSelectorContainer}>
                <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Select Folder</Text>
                <View style={[styles.folderSelector, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                  <TouchableOpacity
                    style={[
                      styles.folderOption,
                      { borderBottomColor: theme.border },
                      selectedFolder === '' && { backgroundColor: theme.primary + '20' }
                    ]}
                    onPress={() => setSelectedFolder('')}
                    disabled={uploading}
                  >
                    <FontAwesome name="home" size={16} color={selectedFolder === '' ? theme.primary : theme.textSecondary} />
                    <Text style={[styles.folderOptionText, { color: selectedFolder === '' ? theme.primary : theme.text }]}>
                      Root ({getUsername()})
                    </Text>
                    {selectedFolder === '' && (
                      <FontAwesome name="check" size={14} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                  {getAvailableFolders().map((folder) => (
                    <TouchableOpacity
                      key={folder.id}
                      style={[
                        styles.folderOption,
                        selectedFolder === folder.path && { backgroundColor: theme.primary + '20' }
                      ]}
                      onPress={() => setSelectedFolder(folder.path || '')}
                      disabled={uploading}
                    >
                      <FontAwesome name="folder" size={16} color={selectedFolder === folder.path ? theme.primary : theme.textSecondary} />
                      <Text style={[styles.folderOptionText, { color: selectedFolder === folder.path ? theme.primary : theme.text }]}>
                        {folder.name}
                      </Text>
                      {selectedFolder === folder.path && (
                        <FontAwesome name="check" size={14} color={theme.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {uploadFiles.length === 0 ? (
                <>
                  <Text style={[styles.modalLabel, { color: theme.textSecondary, marginTop: 16 }]}>Select Files</Text>
                  <TouchableOpacity
                    style={[styles.fileSelectButton, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                    onPress={handleFileSelect}
                    disabled={uploading}
                  >
                    <FontAwesome name="folder-open" size={24} color={theme.primary} />
                    <Text style={[styles.fileSelectText, { color: theme.text }]}>Choose Files</Text>
                    <Text style={[styles.fileSelectSubtext, { color: theme.textTertiary }]}>Click to browse and select files</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.modalLabel, { color: theme.textSecondary }]}>Selected Files ({uploadFiles.length})</Text>
                  <ScrollView style={styles.fileListPreview} nestedScrollEnabled>
                    {uploadFiles.map((file, index) => (
                      <View key={index} style={[styles.filePreviewItem, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                        <FontAwesome name="file" size={16} color={theme.textSecondary} />
                        <Text style={[styles.filePreviewName, { color: theme.text }]} numberOfLines={1}>{file.name}</Text>
                        <Text style={[styles.filePreviewSize, { color: theme.textTertiary }]}>
                          {(file.size / 1024).toFixed(2)} KB
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                  {uploading && (
                    <View style={styles.progressContainer}>
                      <View style={[styles.progressBarContainer, { backgroundColor: theme.surfaceSecondary }]}>
                        <View
                          style={[
                            styles.progressBar,
                            {
                              width: `${uploadProgress}%`,
                              backgroundColor: theme.primary,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                        {Math.round(uploadProgress)}% uploaded
                      </Text>
                    </View>
                  )}
                </>
              )}
            </View>
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <Button
                title="Cancel"
                onPress={() => {
                  if (!uploading) {
                    setShowUploadModal(false);
                    setUploadFiles([]);
                    setSelectedFolder('');
                  }
                }}
                variant="secondary"
                style={styles.modalButton}
                disabled={uploading}
              />
              <Button
                title={uploading ? 'Uploading...' : uploadFiles.length === 0 ? 'Select Files' : 'Upload'}
                onPress={uploadFiles.length === 0 ? handleFileSelect : handleSaveUploadedFiles}
                style={styles.modalButton}
                loading={uploading}
                disabled={uploading}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  empty: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  fileList: {
    flex: 1,
  },
  fileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  fileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  fileItemName: {
    fontSize: 14,
    fontWeight: '500',
  },
  fileItemActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  fileItemAction: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: Platform.OS === 'web' ? 400 : '90%',
    maxWidth: Platform.OS === 'web' ? 400 : '90%',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
  },
  modalButton: {
    minWidth: 100,
  },
  fileSelectButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  fileSelectText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  fileSelectSubtext: {
    fontSize: 13,
  },
  fileListPreview: {
    maxHeight: 200,
    marginTop: 8,
  },
  filePreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  filePreviewName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  filePreviewSize: {
    fontSize: 12,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  folderSelectorContainer: {
    marginBottom: 16,
  },
  folderSelector: {
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    maxHeight: 200,
  },
  folderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
  },
  folderOptionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
});
