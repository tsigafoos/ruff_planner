import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';
import { Button } from '@/components/ui';
import { 
  PROJECT_TEMPLATES, 
  TEMPLATE_CATEGORIES, 
  ProjectTemplate, 
  TemplateCategory,
  getTemplatesByCategory,
} from '@/lib/projectTemplates';

interface TemplateSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (template: ProjectTemplate) => void;
}

/**
 * TemplateSelectionModal - Modal for selecting a project template
 */
export default function TemplateSelectionModal({
  visible,
  onClose,
  onSelect,
}: TemplateSelectionModalProps) {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  const categories = Object.entries(TEMPLATE_CATEGORIES) as [TemplateCategory, { label: string; icon: string; color: string }][];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? PROJECT_TEMPLATES 
    : getTemplatesByCategory(selectedCategory);

  const handleSelectTemplate = (template: ProjectTemplate) => {
    onSelect(template);
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.container, { backgroundColor: theme.surface }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>Choose a Template</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Start with a pre-built project structure
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <FontAwesome name="times" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Category Tabs */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={[styles.categoryTabs, { borderBottomColor: theme.border }]}
            contentContainerStyle={styles.categoryTabsContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryTab,
                { 
                  backgroundColor: selectedCategory === 'all' ? theme.primary : theme.surfaceSecondary,
                  borderColor: selectedCategory === 'all' ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <FontAwesome 
                name="th-large" 
                size={12} 
                color={selectedCategory === 'all' ? '#fff' : theme.textSecondary} 
              />
              <Text style={[
                styles.categoryTabText,
                { color: selectedCategory === 'all' ? '#fff' : theme.text }
              ]}>
                All
              </Text>
            </TouchableOpacity>

            {categories.map(([key, cat]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryTab,
                  { 
                    backgroundColor: selectedCategory === key ? cat.color : theme.surfaceSecondary,
                    borderColor: selectedCategory === key ? cat.color : theme.border,
                  },
                ]}
                onPress={() => setSelectedCategory(key)}
              >
                <FontAwesome 
                  name={cat.icon as any} 
                  size={12} 
                  color={selectedCategory === key ? '#fff' : cat.color} 
                />
                <Text style={[
                  styles.categoryTabText,
                  { color: selectedCategory === key ? '#fff' : theme.text }
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Template Grid */}
          <ScrollView 
            style={styles.templateGrid}
            contentContainerStyle={styles.templateGridContent}
            showsVerticalScrollIndicator
          >
            {filteredTemplates.map((template) => {
              const category = TEMPLATE_CATEGORIES[template.category];
              
              return (
                <TouchableOpacity
                  key={template.id}
                  style={[styles.templateCard, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                  onPress={() => handleSelectTemplate(template)}
                >
                  {/* Icon */}
                  <View style={[styles.templateIcon, { backgroundColor: template.color + '15' }]}>
                    <FontAwesome name={template.icon as any} size={24} color={template.color} />
                  </View>
                  
                  {/* Info */}
                  <View style={styles.templateInfo}>
                    <Text style={[styles.templateName, { color: theme.text }]}>{template.name}</Text>
                    <Text style={[styles.templateDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                      {template.description}
                    </Text>
                    
                    {/* Meta */}
                    <View style={styles.templateMeta}>
                      <View style={[styles.metaBadge, { backgroundColor: category.color + '15' }]}>
                        <FontAwesome name={category.icon as any} size={10} color={category.color} />
                        <Text style={[styles.metaText, { color: category.color }]}>{category.label}</Text>
                      </View>
                      <View style={[styles.metaBadge, { backgroundColor: theme.primary + '15' }]}>
                        <FontAwesome name="tasks" size={10} color={theme.primary} />
                        <Text style={[styles.metaText, { color: theme.primary }]}>{template.tasks.length} tasks</Text>
                      </View>
                      <View style={[styles.metaBadge, { backgroundColor: theme.textSecondary + '15' }]}>
                        <FontAwesome name="clock-o" size={10} color={theme.textSecondary} />
                        <Text style={[styles.metaText, { color: theme.textSecondary }]}>~{template.estimatedDays} days</Text>
                      </View>
                    </View>
                  </View>
                  
                  {/* Arrow */}
                  <FontAwesome name="chevron-right" size={14} color={theme.textTertiary} />
                </TouchableOpacity>
              );
            })}

            {filteredTemplates.length === 0 && (
              <View style={styles.emptyState}>
                <FontAwesome name="folder-open-o" size={48} color={theme.textTertiary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  No templates in this category
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Button title="Cancel" variant="secondary" onPress={onClose} />
            <Text style={[styles.footerHint, { color: theme.textTertiary }]}>
              Select a template to preview tasks
            </Text>
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
  container: {
    width: Platform.OS === 'web' ? 700 : '95%',
    maxHeight: '90%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  categoryTabs: {
    borderBottomWidth: 1,
  },
  categoryTabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '500',
  },
  templateGrid: {
    flex: 1,
  },
  templateGridContent: {
    padding: 16,
  },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    gap: 16,
  },
  templateIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  templateMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    gap: 16,
  },
  emptyText: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  footerHint: {
    fontSize: 12,
  },
});
