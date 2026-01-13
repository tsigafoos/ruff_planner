import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform } from 'react-native';
import Input from '../ui/Input';
import Button from '../ui/Button';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface DocumentationItem {
  id: string;
  type: 'mermaid' | 'markdown' | 'text';
  title: string;
  content: string;
}

interface DocumentationEditorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (item: DocumentationItem) => void;
  initialData?: DocumentationItem;
}

export default function DocumentationEditor({
  visible,
  onClose,
  onSave,
  initialData,
}: DocumentationEditorProps) {
  const [type, setType] = useState<'mermaid' | 'markdown' | 'text'>('mermaid');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setContent(initialData.content);
    } else {
      setType('mermaid');
      setTitle('');
      setContent('');
    }
  }, [initialData, visible]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await onSave({
        id: initialData?.id || Date.now().toString(),
        type,
        title: title.trim(),
        content: content.trim(),
      });
      onClose();
    } catch (error) {
      console.error('Error saving documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const mermaidExample = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`;

  if (Platform.OS !== 'web') {
    return null; // Documentation editor is web-only
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {initialData ? 'Edit Documentation' : 'Add Documentation'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {/* Type Selector */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[styles.typeOption, type === 'mermaid' && styles.typeOptionSelected]}
                onPress={() => setType('mermaid')}
              >
                <Text style={[styles.typeOptionText, type === 'mermaid' && styles.typeOptionTextSelected]}>
                  Mermaid Chart
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, type === 'markdown' && styles.typeOptionSelected]}
                onPress={() => setType('markdown')}
              >
                <Text style={[styles.typeOptionText, type === 'markdown' && styles.typeOptionTextSelected]}>
                  Markdown
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, type === 'text' && styles.typeOptionSelected]}
                onPress={() => setType('text')}
              >
                <Text style={[styles.typeOptionText, type === 'text' && styles.typeOptionTextSelected]}>
                  Plain Text
                </Text>
              </TouchableOpacity>
            </View>

            <Input
              label="Title *"
              value={title}
              onChangeText={setTitle}
              placeholder="Enter documentation title"
            />

            <View style={styles.contentContainer}>
              <Text style={styles.label}>
                Content * {type === 'mermaid' && '(Mermaid syntax)'}
              </Text>
              {type === 'mermaid' && (
                <View style={styles.exampleContainer}>
                  <Text style={styles.exampleLabel}>Example:</Text>
                  <Text style={styles.exampleText}>{mermaidExample}</Text>
                  <TouchableOpacity
                    style={styles.exampleButton}
                    onPress={() => setContent(mermaidExample)}
                  >
                    <Text style={styles.exampleButtonText}>Use Example</Text>
                  </TouchableOpacity>
                </View>
              )}
              <Input
                value={content}
                onChangeText={setContent}
                placeholder={
                  type === 'mermaid'
                    ? 'Enter Mermaid chart syntax'
                    : type === 'markdown'
                    ? 'Enter Markdown content'
                    : 'Enter text content'
                }
                multiline
                numberOfLines={type === 'mermaid' ? 12 : 10}
                style={[
                  styles.textArea,
                  { height: type === 'mermaid' ? 300 : 250 },
                  (type === 'mermaid' || type === 'markdown') && { fontFamily: 'monospace' },
                ]}
              />
            </View>
          </View>

          <View style={styles.footer}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={onClose}
              style={styles.footerButton}
            />
            <Button
              title={initialData ? 'Update' : 'Add'}
              onPress={handleSave}
              loading={loading}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 800,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 32,
    color: '#6B7280',
    lineHeight: 32,
  },
  content: {
    padding: 20,
    maxHeight: 600,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  typeOptionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  typeOptionTextSelected: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  contentContainer: {
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  exampleContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  exampleLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#374151',
    marginBottom: 12,
  },
  exampleButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 6,
  },
  exampleButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  textArea: {
    textAlignVertical: 'top',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});
