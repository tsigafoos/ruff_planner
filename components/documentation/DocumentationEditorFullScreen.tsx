import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Button from '../ui/Button';
import { useTheme } from '../useTheme';
import MermaidRenderer from './MermaidRenderer';
import ReactMarkdown from 'react-markdown';

interface DocumentationEditorFullScreenProps {
  initialTitle: string;
  initialType: string;
  initialContent: string;
  onSave: (title: string, type: string, content: string) => void;
  onClose: () => void;
}

export default function DocumentationEditorFullScreen({
  initialTitle,
  initialType,
  initialContent,
  onSave,
  onClose,
}: DocumentationEditorFullScreenProps) {
  const theme = useTheme();
  const [title, setTitle] = useState(initialTitle);
  const [type, setType] = useState(initialType);
  const [content, setContent] = useState(initialContent);
  const [previewContent, setPreviewContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setType(initialType);
    setContent(initialContent);
    setPreviewContent(initialContent);
  }, [initialTitle, initialType, initialContent]);

  const handleGeneratePreview = () => {
    setPreviewContent(content);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await onSave(title.trim(), type, content.trim());
      onClose();
    } catch (error) {
      console.error('Error saving documentation:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (type === 'mermaid') {
      return <MermaidRenderer content={previewContent} id={`preview-${Date.now()}`} />;
    } else if (type === 'markdown') {
      return (
        <View style={styles.previewContainer}>
          <ReactMarkdown>{previewContent}</ReactMarkdown>
        </View>
      );
    } else {
      return (
        <View style={styles.previewContainer}>
          <Text style={[styles.previewText, { color: theme.text }]}>{previewContent}</Text>
        </View>
      );
    }
  };

  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <FontAwesome name="arrow-left" size={16} color={theme.text} />
          </TouchableOpacity>
          <TextInput
            style={[styles.titleInput, { color: theme.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Documentation Title"
            placeholderTextColor={theme.textTertiary}
          />
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.typeBadge, { backgroundColor: theme.primary + '20' }]}>
            <Text style={[styles.typeBadgeText, { color: theme.primary }]}>{type}</Text>
          </View>
          <Button
            title="Save"
            onPress={handleSave}
            loading={loading}
            style={styles.saveButton}
          />
        </View>
      </View>

      <View style={styles.splitContainer}>
        {/* Left Side - Editor */}
        <View style={[styles.editorSection, { backgroundColor: theme.surface, borderRightColor: theme.border }]}>
          <View style={[styles.editorHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Editor</Text>
            <Button
              title="Generate Preview"
              onPress={handleGeneratePreview}
              variant="secondary"
              style={styles.previewButton}
            />
          </View>
          <TextInput
            style={[styles.editor, { color: theme.text, backgroundColor: theme.surfaceSecondary }]}
            value={content}
            onChangeText={setContent}
            placeholder="Start typing your documentation..."
            placeholderTextColor={theme.textTertiary}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Right Side - Preview */}
        <View style={[styles.previewSection, { backgroundColor: theme.surface }]}>
          <View style={[styles.previewHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Preview</Text>
          </View>
          <ScrollView style={styles.previewScrollView} contentContainerStyle={styles.previewScrollContent}>
            {renderPreview()}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    height: 64,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    borderWidth: 0,
    padding: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  saveButton: {
    minWidth: 100,
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  editorSection: {
    flex: 1,
    borderRightWidth: 1,
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  previewButton: {
    minWidth: 140,
  },
  editor: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    padding: 16,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'monospace',
  },
  previewSection: {
    flex: 1,
  },
  previewHeader: {
    padding: 12,
    borderBottomWidth: 1,
  },
  previewScrollView: {
    flex: 1,
  },
  previewScrollContent: {
    padding: 16,
  },
  previewContainer: {
    flex: 1,
  },
  previewText: {
    fontSize: 14,
    lineHeight: 22,
    whiteSpace: 'pre-wrap',
  },
});
