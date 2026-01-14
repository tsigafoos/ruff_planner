import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Platform, ScrollView } from 'react-native';
import Input from '../ui/Input';
import Button from '../ui/Button';
import FontAwesome from '@expo/vector-icons/FontAwesome';

// Quick-start templates for common diagrams
const MERMAID_TEMPLATES = [
  {
    id: 'flowchart',
    name: 'Flowchart',
    icon: 'sitemap',
    description: 'Decision flows and processes',
    content: `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action 1]
    B -->|No| D[Action 2]
    C --> E[End]
    D --> E`,
  },
  {
    id: 'sequence',
    name: 'Sequence',
    icon: 'exchange',
    description: 'Interactions between entities',
    content: `sequenceDiagram
    participant User
    participant System
    participant Database
    
    User->>System: Request data
    System->>Database: Query
    Database-->>System: Results
    System-->>User: Display data`,
  },
  {
    id: 'classDiagram',
    name: 'Class Diagram',
    icon: 'cubes',
    description: 'Object relationships',
    content: `classDiagram
    class Project {
        +String name
        +Date startDate
        +Date endDate
        +addTask()
        +removeTask()
    }
    class Task {
        +String title
        +String status
        +complete()
    }
    Project "1" --> "*" Task : contains`,
  },
  {
    id: 'gantt',
    name: 'Gantt Chart',
    icon: 'tasks',
    description: 'Project timeline',
    content: `gantt
    title Project Schedule
    dateFormat YYYY-MM-DD
    section Planning
    Research       :a1, 2024-01-01, 7d
    Design         :a2, after a1, 5d
    section Development
    Build Feature  :a3, after a2, 10d
    Testing        :a4, after a3, 5d`,
  },
  {
    id: 'pie',
    name: 'Pie Chart',
    icon: 'pie-chart',
    description: 'Data distribution',
    content: `pie title Task Distribution
    "Completed" : 45
    "In Progress" : 30
    "To Do" : 25`,
  },
  {
    id: 'stateDiagram',
    name: 'State Diagram',
    icon: 'random',
    description: 'State transitions',
    content: `stateDiagram-v2
    [*] --> Draft
    Draft --> InReview : Submit
    InReview --> Approved : Approve
    InReview --> Draft : Request Changes
    Approved --> Published : Publish
    Published --> [*]`,
  },
  {
    id: 'erDiagram',
    name: 'ER Diagram',
    icon: 'database',
    description: 'Database relationships',
    content: `erDiagram
    PROJECT ||--o{ TASK : contains
    TASK ||--o{ SUBTASK : has
    USER ||--o{ TASK : assigned
    PROJECT ||--o{ USER : members`,
  },
  {
    id: 'mindmap',
    name: 'Mind Map',
    icon: 'share-alt',
    description: 'Brainstorming ideas',
    content: `mindmap
  root((Project))
    Features
      Core
      Nice to Have
    Timeline
      Phase 1
      Phase 2
    Resources
      Team
      Budget`,
  },
];

const MARKDOWN_TEMPLATES = [
  {
    id: 'meeting',
    name: 'Meeting Notes',
    icon: 'users',
    description: 'Capture meeting outcomes',
    content: `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Attendees:** 

## Agenda
1. Topic 1
2. Topic 2

## Discussion
- Key point discussed

## Action Items
- [ ] Action 1 - @person
- [ ] Action 2 - @person

## Next Steps
- Follow-up meeting scheduled for...`,
  },
  {
    id: 'spec',
    name: 'Feature Spec',
    icon: 'file-text',
    description: 'Document a feature',
    content: `# Feature: [Name]

## Overview
Brief description of the feature.

## Goals
- Goal 1
- Goal 2

## User Stories
As a [user], I want [feature] so that [benefit].

## Requirements
### Functional
- Requirement 1

### Non-Functional
- Performance: ...
- Security: ...

## Out of Scope
- Not included in this version

## Timeline
| Phase | Duration |
|-------|----------|
| Design | 1 week |
| Development | 2 weeks |
| Testing | 1 week |`,
  },
  {
    id: 'standup',
    name: 'Daily Standup',
    icon: 'calendar',
    description: 'Track daily progress',
    content: `# Daily Standup - ${new Date().toLocaleDateString()}

## Yesterday
- Completed task 1
- Made progress on task 2

## Today
- [ ] Task for today
- [ ] Another task

## Blockers
- None / Describe blocker

## Notes
Additional context or updates.`,
  },
];

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
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setTitle(initialData.title);
      setContent(initialData.content);
      setShowTemplates(false);
    } else {
      setType('mermaid');
      setTitle('');
      setContent('');
      setShowTemplates(true); // Show templates for new docs
    }
  }, [initialData, visible]);

  // Get templates based on type
  const currentTemplates = type === 'mermaid' ? MERMAID_TEMPLATES : 
                           type === 'markdown' ? MARKDOWN_TEMPLATES : [];

  // Apply a template
  const applyTemplate = (template: typeof MERMAID_TEMPLATES[0]) => {
    setContent(template.content);
    if (!title.trim()) {
      setTitle(template.name);
    }
    setShowTemplates(false);
  };

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

  // Render template grid
  const renderTemplateGrid = () => {
    if (!showTemplates || currentTemplates.length === 0) return null;

    return (
      <View style={styles.templatesSection}>
        <View style={styles.templatesHeader}>
          <Text style={styles.templatesTitle}>
            <FontAwesome name="magic" size={14} color="#6B7280" /> Quick Start Templates
          </Text>
          <TouchableOpacity onPress={() => setShowTemplates(false)}>
            <Text style={styles.templatesHide}>Start from scratch</Text>
          </TouchableOpacity>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.templatesGrid}
        >
          {currentTemplates.map((template) => (
            <TouchableOpacity
              key={template.id}
              style={styles.templateCard}
              onPress={() => applyTemplate(template)}
            >
              <View style={styles.templateIcon}>
                <FontAwesome name={template.icon as any} size={20} color="#3B82F6" />
              </View>
              <Text style={styles.templateName}>{template.name}</Text>
              <Text style={styles.templateDesc}>{template.description}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

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
                onPress={() => { 
                  setType('mermaid'); 
                  if (!content.trim()) setShowTemplates(true);
                }}
              >
                <FontAwesome name="sitemap" size={14} color={type === 'mermaid' ? '#3B82F6' : '#6B7280'} />
                <Text style={[styles.typeOptionText, type === 'mermaid' && styles.typeOptionTextSelected]}>
                  Mermaid Chart
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, type === 'markdown' && styles.typeOptionSelected]}
                onPress={() => { 
                  setType('markdown'); 
                  if (!content.trim()) setShowTemplates(true);
                }}
              >
                <FontAwesome name="file-text-o" size={14} color={type === 'markdown' ? '#3B82F6' : '#6B7280'} />
                <Text style={[styles.typeOptionText, type === 'markdown' && styles.typeOptionTextSelected]}>
                  Markdown
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeOption, type === 'text' && styles.typeOptionSelected]}
                onPress={() => { 
                  setType('text'); 
                  setShowTemplates(false); // No templates for plain text
                }}
              >
                <FontAwesome name="file-o" size={14} color={type === 'text' ? '#3B82F6' : '#6B7280'} />
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

            {/* Templates Section */}
            {renderTemplateGrid()}

            <View style={styles.contentContainer}>
              <View style={styles.contentHeader}>
                <Text style={styles.label}>
                  Content * {type === 'mermaid' && '(Mermaid syntax)'}
                  {type === 'markdown' && '(Markdown syntax)'}
                </Text>
                {!showTemplates && currentTemplates.length > 0 && (
                  <TouchableOpacity 
                    style={styles.showTemplatesBtn}
                    onPress={() => setShowTemplates(true)}
                  >
                    <FontAwesome name="magic" size={12} color="#3B82F6" />
                    <Text style={styles.showTemplatesBtnText}>Templates</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Syntax hints for Mermaid */}
              {type === 'mermaid' && content.length === 0 && !showTemplates && (
                <View style={styles.syntaxHint}>
                  <Text style={styles.syntaxHintTitle}>
                    <FontAwesome name="lightbulb-o" size={12} color="#F59E0B" /> Quick Syntax Tips:
                  </Text>
                  <Text style={styles.syntaxHintText}>
                    • Flowchart: <Text style={styles.syntaxCode}>graph TD</Text> (top-down) or <Text style={styles.syntaxCode}>graph LR</Text> (left-right)
                  </Text>
                  <Text style={styles.syntaxHintText}>
                    • Nodes: <Text style={styles.syntaxCode}>[Rectangle]</Text> <Text style={styles.syntaxCode}>(Rounded)</Text> <Text style={styles.syntaxCode}>{'{Diamond}'}</Text>
                  </Text>
                  <Text style={styles.syntaxHintText}>
                    • Arrows: <Text style={styles.syntaxCode}>--&gt;</Text> <Text style={styles.syntaxCode}>---</Text> <Text style={styles.syntaxCode}>-..-&gt;</Text>
                  </Text>
                </View>
              )}

              <Input
                value={content}
                onChangeText={(text) => {
                  setContent(text);
                  if (showTemplates && text.length > 0) {
                    setShowTemplates(false);
                  }
                }}
                placeholder={
                  type === 'mermaid'
                    ? 'Enter Mermaid chart syntax or select a template above'
                    : type === 'markdown'
                    ? 'Enter Markdown content or select a template above'
                    : 'Enter text content'
                }
                multiline
                numberOfLines={type === 'mermaid' ? 12 : 10}
                style={[
                  styles.textArea,
                  { height: showTemplates ? 200 : (type === 'mermaid' ? 300 : 250) },
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
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
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
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  showTemplatesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#EFF6FF',
  },
  showTemplatesBtnText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '500',
  },
  // Templates section
  templatesSection: {
    marginBottom: 16,
  },
  templatesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  templatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  templatesHide: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'underline',
  },
  templatesGrid: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 4,
  },
  templateCard: {
    width: 140,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  templateName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  templateDesc: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Syntax hints
  syntaxHint: {
    backgroundColor: '#FFFBEB',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  syntaxHintTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  syntaxHintText: {
    fontSize: 11,
    color: '#78350F',
    marginBottom: 4,
    lineHeight: 18,
  },
  syntaxCode: {
    fontFamily: 'monospace',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 4,
    borderRadius: 2,
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
