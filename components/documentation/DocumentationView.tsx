import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import DocumentationEditor from './DocumentationEditor';
import DocumentationEditorFullScreen from './DocumentationEditorFullScreen';
import AddDocumentationModal from './AddDocumentationModal';
import MermaidRenderer from './MermaidRenderer';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../useTheme';

interface DocumentationItem {
  id: string;
  type: 'mermaid' | 'markdown' | 'text' | 'rich_text' | 'plain_text';
  title: string;
  content: string;
  filePath?: string;
}

interface DocumentationViewProps {
  documentation: DocumentationItem[];
  onUpdate: (documentation: DocumentationItem[]) => Promise<void>;
}

export default function DocumentationView({ documentation, onUpdate }: DocumentationViewProps) {
  const theme = useTheme();
  const [editingItem, setEditingItem] = useState<DocumentationItem | undefined>();
  const [editorVisible, setEditorVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [fullScreenEditor, setFullScreenEditor] = useState<{
    title: string;
    type: string;
    content: string;
  } | null>(null);

  // Toggle preview for an item
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleAdd = () => {
    setAddModalVisible(true);
  };

  const handleAddSave = async (data: { title: string; type: string; filePath?: string }) => {
    const newDoc: DocumentationItem = {
      id: Date.now().toString(),
      type: data.type as any,
      title: data.title,
      content: '',
      filePath: data.filePath,
    };
    await onUpdate([...documentation, newDoc]);
  };

  const handleContinueToEditor = (data: { title: string; type: string; content: string }) => {
    setFullScreenEditor({
      title: data.title,
      type: data.type,
      content: data.content,
    });
  };

  const handleFullScreenSave = async (title: string, type: string, content: string) => {
    const newDoc: DocumentationItem = {
      id: Date.now().toString(),
      type: type as any,
      title,
      content,
    };
    await onUpdate([...documentation, newDoc]);
    setFullScreenEditor(null);
  };

  const handleEdit = (item: DocumentationItem) => {
    setEditingItem(item);
    setEditorVisible(true);
  };

  const handleOpen = (item: DocumentationItem) => {
    setEditingItem(item);
    setEditorVisible(true);
  };

  const handleDownload = (item: DocumentationItem) => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const blob = new Blob([item.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title}.${item.type === 'mermaid' ? 'mmd' : item.type === 'markdown' ? 'md' : 'txt'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleDelete = async (id: string) => {
    const updated = documentation.filter((item) => item.id !== id);
    await onUpdate(updated);
  };

  const handleSave = async (item: DocumentationItem) => {
    let updated: DocumentationItem[];
    if (editingItem) {
      // Update existing
      updated = documentation.map((doc) => (doc.id === item.id ? item : doc));
    } else {
      // Add new
      updated = [...documentation, item];
    }
    await onUpdate(updated);
    setEditorVisible(false);
    setEditingItem(undefined);
  };

  const renderContent = (item: DocumentationItem) => {
    switch (item.type) {
      case 'mermaid':
        return <MermaidRenderer content={item.content} id={item.id} />;
      case 'markdown':
        if (Platform.OS === 'web') {
          return (
            <View style={[styles.markdownContainer, { backgroundColor: theme.surfaceSecondary }]}>
              <ReactMarkdown>{item.content}</ReactMarkdown>
            </View>
          );
        }
        return <Text style={[styles.plainText, { color: theme.text }]}>{item.content}</Text>;
      case 'text':
      case 'plain_text':
      case 'rich_text':
        return <Text style={[styles.plainText, { color: theme.text }]}>{item.content}</Text>;
      default:
        return <Text style={[styles.plainText, { color: theme.text }]}>{item.content}</Text>;
    }
  };

  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.disabledText}>
          Documentation editor is only available on web
        </Text>
      </View>
    );
  }

  // Full screen editor mode
  if (fullScreenEditor) {
    return (
      <DocumentationEditorFullScreen
        initialTitle={fullScreenEditor.title}
        initialType={fullScreenEditor.type}
        initialContent={fullScreenEditor.content}
        onSave={handleFullScreenSave}
        onClose={() => setFullScreenEditor(null)}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Header with Add button outside collapsible */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.text }]}>Documentation</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={handleAdd}
        >
          <FontAwesome name="plus" size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>+ Add Documentation</Text>
        </TouchableOpacity>
      </View>

      {/* Documentation List */}
      {documentation.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No documentation yet</Text>
          <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
            Click "+ Add Documentation" to create flowcharts, notes, or documentation
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {documentation.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const typeIcon = item.type === 'mermaid' ? 'sitemap' : 
                            item.type === 'markdown' ? 'file-text-o' : 'file-o';
            
            return (
              <View key={item.id} style={[styles.docItem, { borderColor: theme.border }]}>
                <View style={[styles.docRow, { borderBottomColor: isExpanded ? theme.border : 'transparent' }]}>
                  <TouchableOpacity 
                    style={styles.docRowLeft}
                    onPress={() => toggleExpand(item.id)}
                  >
                    <FontAwesome 
                      name={isExpanded ? 'chevron-down' : 'chevron-right'} 
                      size={12} 
                      color={theme.textTertiary} 
                    />
                    <View style={[styles.typeBadge, { backgroundColor: theme.primary + '20' }]}>
                      <FontAwesome name={typeIcon} size={12} color={theme.primary} />
                      <Text style={[styles.typeBadgeText, { color: theme.primary }]}>{item.type}</Text>
                    </View>
                    <Text style={[styles.docTitle, { color: theme.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.docRowActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => toggleExpand(item.id)}
                    >
                      <FontAwesome 
                        name={isExpanded ? 'eye-slash' : 'eye'} 
                        size={14} 
                        color={theme.textSecondary} 
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDownload(item)}
                    >
                      <FontAwesome name="download" size={14} color={theme.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleEdit(item)}
                    >
                      <FontAwesome name="pencil" size={14} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDelete(item.id)}
                    >
                      <FontAwesome name="trash-o" size={14} color={theme.error} />
                    </TouchableOpacity>
                  </View>
                </View>
                
                {/* Expanded Preview */}
                {isExpanded && (
                  <View style={[styles.docPreview, { backgroundColor: theme.surfaceSecondary }]}>
                    {renderContent(item)}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      <AddDocumentationModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSave={handleAddSave}
        onContinueToEditor={handleContinueToEditor}
      />

      <DocumentationEditor
        visible={editorVisible}
        onClose={() => {
          setEditorVisible(false);
          setEditingItem(undefined);
        }}
        onSave={handleSave}
        initialData={editingItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    minHeight: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  empty: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  scrollView: {
    maxHeight: 500,
  },
  docItem: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  docRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  docTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  docRowActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionButton: {
    padding: 6,
  },
  docPreview: {
    padding: 16,
    maxHeight: 400,
    overflow: 'scroll',
  },
  markdownContainer: {
    padding: 12,
    borderRadius: 8,
  },
  plainText: {
    fontSize: 14,
    lineHeight: 22,
    whiteSpace: 'pre-wrap',
  },
  disabledText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 40,
  },
});
