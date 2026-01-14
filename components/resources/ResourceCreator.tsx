import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Button from '../ui/Button';
import { useTheme } from '../useTheme';
import MermaidRenderer from '../documentation/MermaidRenderer';
import ReactMarkdown from 'react-markdown';

interface ResourceCreatorProps {
  onSave: (title: string, type: string, content: string, tags?: string[]) => void;
  onClose: () => void;
  existingTags?: string[]; // Tags already in use for suggestions
}

type ResourceType = 'markdown' | 'mermaid' | 'txt';

export default function ResourceCreator({
  onSave,
  onClose,
  existingTags = [],
}: ResourceCreatorProps) {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ResourceType>('markdown');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [previewContent, setPreviewContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const editorRef = useRef<TextInput>(null);
  const [mermaidFlowchartType, setMermaidFlowchartType] = useState('TB');
  const [showFlowchartDropdown, setShowFlowchartDropdown] = useState(false);
  const dropdownRef = useRef<View>(null);

  // Parse tags string into array
  const parseTags = (tagsStr: string): string[] => {
    return tagsStr
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
  };

  // Add suggested tag
  const addSuggestedTag = (tag: string) => {
    const currentTags = tags.trim();
    if (currentTags.toLowerCase().includes(tag.toLowerCase())) return;
    setTags(currentTags ? `${currentTags}, ${tag}` : tag);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showFlowchartDropdown) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (Platform.OS === 'web' && dropdownRef.current) {
        const target = e.target as Node;
        const element = dropdownRef.current as any;
        if (element && !element.contains(target)) {
          setShowFlowchartDropdown(false);
        }
      }
    };

    if (Platform.OS === 'web') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showFlowchartDropdown]);

  const handleGeneratePreview = () => {
    setPreviewContent(content);
  };

  // Insert text at cursor position
  const insertText = (textToInsert: string, wrapText?: string) => {
    const start = selection.start;
    const end = selection.end;
    const before = content.substring(0, start);
    const selected = content.substring(start, end);
    const after = content.substring(end);

    let newContent: string;
    if (wrapText && selected) {
      // Wrap selected text
      newContent = before + wrapText + selected + wrapText + after;
    } else if (wrapText) {
      // Insert wrapping text with placeholder
      newContent = before + wrapText + wrapText + after;
    } else {
      // Insert text
      newContent = before + textToInsert + after;
    }

    setContent(newContent);
    
    // Focus editor and set cursor position
    if (editorRef.current) {
      setTimeout(() => {
        const newPos = wrapText && selected 
          ? start + wrapText.length + selected.length + wrapText.length
          : start + (wrapText ? wrapText.length * 2 : textToInsert.length);
        if (Platform.OS === 'web' && editorRef.current) {
          const input = editorRef.current as any;
          if (input.setSelectionRange) {
            input.setSelectionRange(newPos, newPos);
          }
        }
        editorRef.current?.focus();
      }, 0);
    }
  };

  // Markdown toolbar handlers
  const handleMarkdownHeading = (level: number) => {
    const hashes = '#'.repeat(level);
    const start = selection.start;
    const end = selection.end;
    const before = content.substring(0, start);
    
    // Find the start of the current line
    const lineStart = before.lastIndexOf('\n') + 1;
    const lineEnd = content.indexOf('\n', start);
    const actualLineEnd = lineEnd === -1 ? content.length : lineEnd;
    
    // Get the current line content
    const currentLine = content.substring(lineStart, actualLineEnd);
    
    // Remove existing heading markers if present (any number of # at start)
    const lineWithoutHeading = currentLine.replace(/^#+\s*/, '');
    
    // Build new content
    const newLineContent = `${hashes} ${lineWithoutHeading}`;
    const newContent = content.substring(0, lineStart) + newLineContent + content.substring(actualLineEnd);
    
    setContent(newContent);
    
    // Focus editor and set cursor position after the heading
    if (editorRef.current) {
      setTimeout(() => {
        const newPos = lineStart + hashes.length + 1 + lineWithoutHeading.length;
        if (Platform.OS === 'web' && editorRef.current) {
          const input = editorRef.current as any;
          if (input.setSelectionRange) {
            input.setSelectionRange(newPos, newPos);
          }
        }
        editorRef.current?.focus();
      }, 0);
    }
  };

  const handleMarkdownBold = () => {
    insertText('', '**');
  };

  const handleMarkdownItalic = () => {
    insertText('', '*');
  };

  const handleMarkdownHorizontalRule = () => {
    insertText('\n---\n');
  };

  const handleMarkdownBlockquote = () => {
    insertText('> ');
  };

  const handleMarkdownUnorderedList = () => {
    const start = selection.start;
    const end = selection.end;
    const before = content.substring(0, start);
    const selected = content.substring(start, end);
    const after = content.substring(end);
    
    // Find the start of the first selected line
    const firstLineStart = before.lastIndexOf('\n') + 1;
    
    if (selected) {
      // Split selected text into lines
      const lines = selected.split('\n');
      const processedLines = lines.map((line, index) => {
        // Skip empty lines, but preserve them
        if (line.trim() === '') return line;
        // Remove existing list markers if present
        const lineWithoutMarker = line.replace(/^(\s*)([-*+]|\d+\.)\s+/, '$1');
        return lineWithoutMarker.replace(/^\s*/, '- ');
      });
      
      const newSelected = processedLines.join('\n');
      const newContent = content.substring(0, firstLineStart) + newSelected + after;
      setContent(newContent);
      
      // Set selection to cover all processed lines
      if (editorRef.current) {
        setTimeout(() => {
          const newStart = firstLineStart;
          const newEnd = firstLineStart + newSelected.length;
          if (Platform.OS === 'web' && editorRef.current) {
            const input = editorRef.current as any;
            if (input.setSelectionRange) {
              input.setSelectionRange(newStart, newEnd);
            }
          }
          editorRef.current?.focus();
        }, 0);
      }
    } else {
      // No selection, just insert at cursor position
      insertText('- ');
    }
  };

  const handleMarkdownOrderedList = () => {
    const start = selection.start;
    const end = selection.end;
    const before = content.substring(0, start);
    const selected = content.substring(start, end);
    const after = content.substring(end);
    
    // Find the start of the first selected line
    const firstLineStart = before.lastIndexOf('\n') + 1;
    
    if (selected) {
      // Split selected text into lines
      const lines = selected.split('\n');
      let listNumber = 1;
      const processedLines = lines.map((line, index) => {
        // Skip empty lines, but preserve them
        if (line.trim() === '') return line;
        // Remove existing list markers if present
        const lineWithoutMarker = line.replace(/^(\s*)([-*+]|\d+\.)\s+/, '$1');
        const numberedLine = lineWithoutMarker.replace(/^\s*/, `${listNumber}. `);
        listNumber++;
        return numberedLine;
      });
      
      const newSelected = processedLines.join('\n');
      const newContent = content.substring(0, firstLineStart) + newSelected + after;
      setContent(newContent);
      
      // Set selection to cover all processed lines
      if (editorRef.current) {
        setTimeout(() => {
          const newStart = firstLineStart;
          const newEnd = firstLineStart + newSelected.length;
          if (Platform.OS === 'web' && editorRef.current) {
            const input = editorRef.current as any;
            if (input.setSelectionRange) {
              input.setSelectionRange(newStart, newEnd);
            }
          }
          editorRef.current?.focus();
        }, 0);
      }
    } else {
      // No selection, just insert at cursor position
      insertText('1. ');
    }
  };

  // Mermaid toolbar handlers
  const handleMermaidNode = (syntax: string) => {
    const nodeId = `node${Date.now().toString().slice(-4)}`;
    // Insert node with format: nodeId[Text] where syntax is [Text]
    const nodeText = `${nodeId}${syntax}`;
    insertText(nodeText);
  };

  const handleMermaidArrow = (arrow: string) => {
    insertText(arrow);
  };

  const handleFlowchartTypeChange = (flowType: string) => {
    setMermaidFlowchartType(flowType);
    setShowFlowchartDropdown(false);
    
    // Find the config section and update the graph line
    const lines = content.split('\n');
    let configEndIndex = -1;
    
    // Find the line after the second `---`
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        // Check if this is the second `---`
        let dashCount = 0;
        for (let j = 0; j < i; j++) {
          if (lines[j].trim() === '---') dashCount++;
        }
        if (dashCount === 1) {
          configEndIndex = i;
          break;
        }
      }
    }
    
    if (configEndIndex >= 0 && configEndIndex + 1 < lines.length) {
      // Update the graph line (first line after config)
      const graphLineIndex = configEndIndex + 1;
      lines[graphLineIndex] = `graph ${flowType}`;
      setContent(lines.join('\n'));
    } else {
      // If structure not found, create/update it
      const newContent = `---
config:
---
graph ${flowType}
`;
      setContent(newContent);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      const tagsArray = parseTags(tags);
      await onSave(title.trim(), type, content.trim(), tagsArray.length > 0 ? tagsArray : undefined);
      onClose();
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderPreview = () => {
    if (type === 'mermaid') {
      return <MermaidRenderer content={previewContent} id={`resource-preview-${Date.now()}`} />;
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
            placeholder="Resource Title"
            placeholderTextColor={theme.textTertiary}
          />
        </View>
        <View style={styles.headerTags}>
          <FontAwesome name="tags" size={14} color={theme.textSecondary} />
          <TextInput
            style={[styles.tagsInput, { color: theme.text, borderColor: theme.border }]}
            value={tags}
            onChangeText={setTags}
            placeholder="Tags (comma-separated)"
            placeholderTextColor={theme.textTertiary}
          />
          {existingTags.length > 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.tagSuggestions}
              contentContainerStyle={styles.tagSuggestionsContent}
            >
              {existingTags.filter(t => !tags.toLowerCase().includes(t.toLowerCase())).slice(0, 5).map(tag => (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagSuggestion, { backgroundColor: theme.surfaceSecondary }]}
                  onPress={() => addSuggestedTag(tag)}
                >
                  <Text style={[styles.tagSuggestionText, { color: theme.text }]}>+ {tag}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
        <View style={styles.headerRight}>
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
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: type === 'markdown' ? theme.primary + '20' : theme.surfaceSecondary,
                    borderColor: type === 'markdown' ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setType('markdown')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: type === 'markdown' ? theme.primary : theme.text },
                  ]}
                >
                  Markdown
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: type === 'mermaid' ? theme.primary + '20' : theme.surfaceSecondary,
                    borderColor: type === 'mermaid' ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => {
                  setType('mermaid');
                  if (!content.trim()) {
                    // Initialize with config structure
                    const initialContent = `---
config:
---
graph TB
`;
                    setContent(initialContent);
                  }
                }}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: type === 'mermaid' ? theme.primary : theme.text },
                  ]}
                >
                  Mermaid
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: type === 'txt' ? theme.primary + '20' : theme.surfaceSecondary,
                    borderColor: type === 'txt' ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => setType('txt')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    { color: type === 'txt' ? theme.primary : theme.text },
                  ]}
                >
                  TXT
                </Text>
              </TouchableOpacity>
            </View>
            <Button
              title="Preview"
              onPress={handleGeneratePreview}
              variant="secondary"
              style={styles.previewButton}
            />
          </View>
          
          {/* Toolbar */}
          {type === 'markdown' && (
            <View style={[styles.toolbar, { backgroundColor: theme.surfaceSecondary, borderBottomColor: theme.border }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarContent}>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMarkdownHeading(1)}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>H1</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMarkdownHeading(2)}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>H2</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMarkdownHeading(3)}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>H3</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMarkdownHeading(4)}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>H4</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMarkdownHeading(5)}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>H5</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMarkdownHeading(6)}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>H6</Text>
                </TouchableOpacity>
                <View style={[styles.toolbarSeparator, { backgroundColor: theme.border }]} />
                <TouchableOpacity style={styles.toolbarButton} onPress={handleMarkdownBold}>
                  <Text style={[styles.toolbarButtonText, { fontWeight: 'bold', color: theme.text }]}>B</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={handleMarkdownItalic}>
                  <Text style={[styles.toolbarButtonText, { fontStyle: 'italic', color: theme.text }]}>I</Text>
                </TouchableOpacity>
                <View style={[styles.toolbarSeparator, { backgroundColor: theme.border }]} />
                <TouchableOpacity style={styles.toolbarButton} onPress={handleMarkdownHorizontalRule}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>─</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={handleMarkdownBlockquote}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>"</Text>
                </TouchableOpacity>
                <View style={[styles.toolbarSeparator, { backgroundColor: theme.border }]} />
                <TouchableOpacity style={styles.toolbarButton} onPress={handleMarkdownUnorderedList}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>• List</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={handleMarkdownOrderedList}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>1. List</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          )}

          {type === 'mermaid' && (
            <View style={[styles.toolbar, { backgroundColor: theme.surfaceSecondary, borderBottomColor: theme.border }]}>
              <View style={styles.toolbarContent}>
                <View ref={dropdownRef} style={{ position: 'relative' }}>
                  <TouchableOpacity
                    style={[styles.toolbarDropdown, { borderColor: theme.border, backgroundColor: theme.surface }]}
                    onPress={() => setShowFlowchartDropdown(!showFlowchartDropdown)}
                  >
                    <Text style={[styles.toolbarDropdownText, { color: theme.text }]}>
                      {mermaidFlowchartType ? `flowchart ${mermaidFlowchartType}` : 'Select Type'}
                    </Text>
                    <FontAwesome name="chevron-down" size={12} color={theme.textSecondary} />
                  </TouchableOpacity>
                  {showFlowchartDropdown && (
                    <View style={[styles.dropdownMenu, { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.text }]}>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleFlowchartTypeChange('TB')}
                      >
                        <Text style={[styles.dropdownItemText, { color: theme.text }]}>flowchart TB</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleFlowchartTypeChange('BT')}
                      >
                        <Text style={[styles.dropdownItemText, { color: theme.text }]}>flowchart BT</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleFlowchartTypeChange('LR')}
                      >
                        <Text style={[styles.dropdownItemText, { color: theme.text }]}>flowchart LR</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleFlowchartTypeChange('RL')}
                      >
                        <Text style={[styles.dropdownItemText, { color: theme.text }]}>flowchart RL</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}

          <TextInput
            ref={editorRef}
            style={[styles.editor, { color: theme.text, backgroundColor: theme.surfaceSecondary }]}
            value={content}
            onChangeText={setContent}
            onSelectionChange={(e) => {
              setSelection({
                start: e.nativeEvent.selection.start,
                end: e.nativeEvent.selection.end,
              });
            }}
            placeholder={`Start typing your ${type} content...`}
            placeholderTextColor={theme.textTertiary}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Right Side - Preview */}
        <View style={[styles.previewSection, { backgroundColor: theme.surface }]}>
          <View style={[styles.previewHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Preview</Text>
            {type === 'mermaid' && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.toolbarContent}>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMermaidNode('[Text]')}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>□</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMermaidNode('(Text)')}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>( )</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMermaidNode('([Text])')}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>([ ])</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMermaidNode('[[Text]]')}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>[[ ]]</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMermaidNode('[(Text)]')}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>[( )]</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMermaidNode('((Text))')}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>(())</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMermaidNode('{Text}')}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>{'{}'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMermaidNode('{{Text}}')}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>{'{{}}'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMermaidNode('[/Text/]')}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>/ /</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.toolbarButton} onPress={() => handleMermaidNode('[/Text\\]')}>
                  <Text style={[styles.toolbarButtonText, { color: theme.text }]}>/ \\</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
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
  headerTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginHorizontal: 16,
  },
  tagsInput: {
    flex: 1,
    fontSize: 13,
    padding: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    maxWidth: 200,
  },
  tagSuggestions: {
    maxWidth: 250,
  },
  tagSuggestionsContent: {
    flexDirection: 'row',
    gap: 4,
  },
  tagSuggestion: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagSuggestionText: {
    fontSize: 11,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    gap: 12,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  previewButton: {
    minWidth: 100,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  closePreviewButton: {
    padding: 4,
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
  toolbar: {
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  toolbarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  toolbarButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolbarButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  toolbarSeparator: {
    width: 1,
    height: 20,
    marginHorizontal: 4,
  },
  toolbarDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  toolbarDropdownText: {
    fontSize: 13,
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: 4,
    borderRadius: 6,
    borderWidth: 1,
    minWidth: 150,
    zIndex: 1000,
    ...(Platform.OS === 'web' && {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }),
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  dropdownItemText: {
    fontSize: 13,
    fontWeight: '400',
  },
});
