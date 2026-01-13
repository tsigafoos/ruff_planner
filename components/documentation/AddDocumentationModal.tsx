import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, TextInput } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useTheme } from '../useTheme';

interface AddDocumentationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { title: string; type: string; filePath?: string }) => void;
  onContinueToEditor: (data: { title: string; type: string; content: string }) => void;
}

export default function AddDocumentationModal({
  visible,
  onClose,
  onSave,
  onContinueToEditor,
}: AddDocumentationModalProps) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'mermaid' | 'markdown' | 'rich_text' | 'plain_text' | 'other'>('mermaid');
  const [continueToEditor, setContinueToEditor] = useState(false);
  const [filePath, setFilePath] = useState<string>('');
  const [fileContent, setFileContent] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!visible) {
      // Reset form when modal closes
      setTitle('');
      setType('mermaid');
      setContinueToEditor(false);
      setFilePath('');
      setFileContent('');
    }
  }, [visible]);

  const handleFileSelect = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.txt,.md,.mmd,.mermaid';
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          setFilePath(file.name);
          const reader = new FileReader();
          reader.onload = (event) => {
            const content = event.target?.result as string;
            setFileContent(content);
            // Auto-detect type from extension
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext === 'md') {
              setType('markdown');
            } else if (ext === 'mmd' || ext === 'mermaid') {
              setType('mermaid');
            } else if (ext === 'txt') {
              setType('plain_text');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) return;

    if (continueToEditor) {
      // Continue to editor mode
      onContinueToEditor({
        title: title.trim(),
        type: type === 'other' ? 'plain_text' : type,
        content: fileContent || '',
      });
      onClose();
    } else {
      // Save file
      onSave({
        title: title.trim(),
        type: type === 'other' ? 'plain_text' : type,
        filePath: filePath || undefined,
      });
      onClose();
    }
  };

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>Add Documentation</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Input
              label="Title"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter documentation title"
            />

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
              <View style={styles.typeOptions}>
                {(['mermaid', 'markdown', 'rich_text', 'plain_text', 'other'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.typeOption,
                      {
                        backgroundColor: type === option ? theme.primary + '20' : theme.surfaceSecondary,
                        borderColor: type === option ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => {
                      setType(option);
                      if (option !== 'other') {
                        setFilePath('');
                        setFileContent('');
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        {
                          color: type === option ? theme.primary : theme.text,
                          fontWeight: type === option ? '600' : '400',
                        },
                      ]}
                    >
                      {option === 'rich_text' ? 'Rich Text' : option === 'plain_text' ? 'Plain Text' : option === 'mermaid' ? 'Mermaid' : option === 'markdown' ? 'Markdown' : 'Other (Upload File)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {type === 'other' && (
              <View style={styles.field}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>Upload File</Text>
                <TouchableOpacity
                  style={[styles.fileButton, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                  onPress={handleFileSelect}
                >
                  <FontAwesome name="upload" size={16} color={theme.textSecondary} />
                  <Text style={[styles.fileButtonText, { color: theme.text }]}>
                    {filePath || 'Select File (.txt, .md, .mmd, .mermaid)'}
                  </Text>
                </TouchableOpacity>
                {filePath && (
                  <Text style={[styles.fileInfo, { color: theme.textTertiary }]}>
                    Selected: {filePath}
                  </Text>
                )}
              </View>
            )}

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setContinueToEditor(!continueToEditor)}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    {
                      backgroundColor: continueToEditor ? theme.primary : 'transparent',
                      borderColor: continueToEditor ? theme.primary : theme.border,
                    },
                  ]}
                >
                  {continueToEditor && (
                    <FontAwesome name="check" size={12} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { color: theme.text }]}>
                  Continue to editor
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => setContinueToEditor(false)}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    {
                      backgroundColor: !continueToEditor ? theme.primary : 'transparent',
                      borderColor: !continueToEditor ? theme.primary : theme.border,
                    },
                  ]}
                >
                  {!continueToEditor && (
                    <FontAwesome name="check" size={12} color="#FFFFFF" />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { color: theme.text }]}>
                  Save file
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Button
              title="Cancel"
              onPress={onClose}
              variant="secondary"
              style={styles.footerButton}
            />
            <Button
              title={continueToEditor ? 'Continue to Editor' : 'Save'}
              onPress={handleSubmit}
              style={styles.footerButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  content: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  typeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 120,
  },
  typeOptionText: {
    fontSize: 14,
  },
  fileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  fileButtonText: {
    fontSize: 14,
  },
  fileInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  checkboxContainer: {
    marginBottom: 12,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
  },
  footerButton: {
    minWidth: 100,
  },
});
