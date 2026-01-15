import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/components/useTheme';

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
  pinned?: boolean;
}

export interface NotesWidgetProps {
  notes?: Note[];
  onNotesChange?: (notes: Note[]) => void;
  widgetId?: string;
  showHeader?: boolean;
  maxNotes?: number;
}

/**
 * NotesWidget - Quick notes and reminders pinned to dashboard
 */
export default function NotesWidget({
  notes: initialNotes = [],
  onNotesChange,
  widgetId,
  showHeader = true,
  maxNotes = 10,
}: NotesWidgetProps) {
  const theme = useTheme();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // Load notes from localStorage
  useEffect(() => {
    if (widgetId) {
      try {
        const stored = localStorage.getItem(`notes-widget-${widgetId}`);
        if (stored) {
          setNotes(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Error loading notes:', e);
      }
    }
  }, [widgetId]);

  // Save notes to localStorage
  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    onNotesChange?.(updatedNotes);
    if (widgetId) {
      try {
        localStorage.setItem(`notes-widget-${widgetId}`, JSON.stringify(updatedNotes));
      } catch (e) {
        console.error('Error saving notes:', e);
      }
    }
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    
    const note: Note = {
      id: Math.random().toString(36).substring(2, 9),
      content: newNote.trim(),
      createdAt: new Date(),
      pinned: false,
    };
    
    const updatedNotes = [note, ...notes].slice(0, maxNotes);
    saveNotes(updatedNotes);
    setNewNote('');
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter(n => n.id !== id);
    saveNotes(updatedNotes);
  };

  const togglePin = (id: string) => {
    const updatedNotes = notes.map(n => 
      n.id === id ? { ...n, pinned: !n.pinned } : n
    );
    // Sort pinned notes first
    updatedNotes.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return 0;
    });
    saveNotes(updatedNotes);
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditingContent(note.content);
  };

  const saveEdit = () => {
    if (!editingId || !editingContent.trim()) {
      setEditingId(null);
      return;
    }
    
    const updatedNotes = notes.map(n =>
      n.id === editingId ? { ...n, content: editingContent.trim() } : n
    );
    saveNotes(updatedNotes);
    setEditingId(null);
    setEditingContent('');
  };

  return (
    <View style={styles.container}>
      {showHeader && (
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <FontAwesome name="sticky-note" size={14} color={theme.textSecondary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Notes</Text>
          <View style={[styles.badge, { backgroundColor: theme.primary + '15' }]}>
            <Text style={[styles.badgeText, { color: theme.primary }]}>{notes.length}</Text>
          </View>
        </View>
      )}

      {/* Add Note Input */}
      <View style={[styles.addNote, { borderBottomColor: theme.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border }]}
          placeholder="Add a note..."
          placeholderTextColor={theme.textTertiary}
          value={newNote}
          onChangeText={setNewNote}
          onSubmitEditing={addNote}
          returnKeyType="done"
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={addNote}
          disabled={!newNote.trim()}
        >
          <FontAwesome name="plus" size={12} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Notes List */}
      <ScrollView 
        style={styles.notesList}
        showsVerticalScrollIndicator
        contentContainerStyle={styles.notesListContent}
      >
        {notes.map((note) => (
          <View
            key={note.id}
            style={[
              styles.noteItem,
              { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
              note.pinned && { borderLeftColor: theme.primary, borderLeftWidth: 3 },
            ]}
          >
            {editingId === note.id ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={[styles.editInput, { backgroundColor: theme.surface, color: theme.text, borderColor: theme.border }]}
                  value={editingContent}
                  onChangeText={setEditingContent}
                  multiline
                  autoFocus
                />
                <View style={styles.editActions}>
                  <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: theme.success }]}
                    onPress={saveEdit}
                  >
                    <FontAwesome name="check" size={10} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.editButton, { backgroundColor: theme.error }]}
                    onPress={() => setEditingId(null)}
                  >
                    <FontAwesome name="times" size={10} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <Text style={[styles.noteContent, { color: theme.text }]} numberOfLines={3}>
                  {note.content}
                </Text>
                <View style={styles.noteActions}>
                  <TouchableOpacity
                    style={styles.noteAction}
                    onPress={() => togglePin(note.id)}
                  >
                    <FontAwesome 
                      name={note.pinned ? 'thumb-tack' : 'thumb-tack'} 
                      size={10} 
                      color={note.pinned ? theme.primary : theme.textTertiary} 
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.noteAction}
                    onPress={() => startEditing(note)}
                  >
                    <FontAwesome name="pencil" size={10} color={theme.textTertiary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.noteAction}
                    onPress={() => deleteNote(note.id)}
                  >
                    <FontAwesome name="trash" size={10} color={theme.textTertiary} />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ))}
        
        {notes.length === 0 && (
          <View style={styles.emptyState}>
            <FontAwesome name="sticky-note-o" size={24} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textTertiary }]}>
              No notes yet
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  addNote: {
    flexDirection: 'row',
    gap: 8,
    padding: 10,
    borderBottomWidth: 1,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesList: {
    flex: 1,
  },
  notesListContent: {
    padding: 10,
  },
  noteItem: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  noteContent: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  noteAction: {
    padding: 4,
  },
  editContainer: {
    gap: 8,
  },
  editInput: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    fontSize: 12,
    minHeight: 60,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  editButton: {
    width: 24,
    height: 24,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 11,
  },
});
