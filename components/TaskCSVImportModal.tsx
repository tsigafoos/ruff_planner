import { useTheme } from '@/components/useTheme';
import { useAuthStore } from '@/store/authStore';
import { useTaskStore } from '@/store/taskStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Platform, TextInput } from 'react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TaskCSVImportModalProps {
  visible: boolean;
  onClose: () => void;
  projectId: string;
  onImportComplete?: () => void;
}

interface ParsedTask {
  title: string;
  description?: string;
  dueDate?: Date;
  startDate?: Date;
  priority?: number;
  status?: string;
  projectPhase?: string;
  category?: string;
  errors?: string[];
  imported?: boolean;
  importing?: boolean;
}

// Simple CSV parser that handles quoted fields
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  values.push(current.trim());
  return values;
}

// Simple CSV parser
function parseCSV(csvText: string): ParsedTask[] {
  const lines = csvText.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  // Parse header row
  const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  const tasks: ParsedTask[] = [];

  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ''));
    const task: ParsedTask = { title: '' };
    const errors: string[] = [];

    headers.forEach((header, index) => {
      const value = values[index] || '';
      
      switch (header) {
        case 'title':
        case 'task':
        case 'name':
          task.title = value;
          break;
        case 'description':
        case 'desc':
        case 'notes':
          task.description = value;
          break;
        case 'due date':
        case 'due_date':
        case 'due':
          if (value) {
            const date = parseDate(value);
            if (date) {
              task.dueDate = date;
            } else {
              errors.push(`Invalid due date: ${value}`);
            }
          }
          break;
        case 'start date':
        case 'start_date':
        case 'start':
          if (value) {
            const date = parseDate(value);
            if (date) {
              task.startDate = date;
            } else {
              errors.push(`Invalid start date: ${value}`);
            }
          }
          break;
        case 'priority':
        case 'pri':
          if (value) {
            const priority = parseInt(value, 10);
            if (!isNaN(priority) && priority >= 1 && priority <= 4) {
              task.priority = priority;
            } else {
              errors.push(`Invalid priority: ${value} (must be 1-4)`);
            }
          }
          break;
        case 'status':
          if (value) {
            const validStatuses = ['to_do', 'in_progress', 'blocked', 'on_hold', 'completed', 'cancelled'];
            if (validStatuses.includes(value.toLowerCase())) {
              task.status = value.toLowerCase();
            } else {
              errors.push(`Invalid status: ${value}`);
            }
          }
          break;
        case 'phase':
        case 'project_phase':
          if (value) {
            const validPhases = ['brainstorm', 'design', 'logic', 'polish', 'done'];
            if (validPhases.includes(value.toLowerCase())) {
              task.projectPhase = value.toLowerCase();
            }
          }
          break;
        case 'category':
          if (value) {
            const validCategories = ['bug', 'enhancement', 'support', 'other'];
            if (validCategories.includes(value.toLowerCase())) {
              task.category = value.toLowerCase();
            }
          }
          break;
      }
    });

    if (!task.title) {
      errors.push('Title is required');
    }

    if (errors.length > 0) {
      task.errors = errors;
    }

    tasks.push(task);
  }

  return tasks;
}

// Parse date from various formats
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  // Try ISO format first
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Try common formats: MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD
  const formats = [
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let year, month, day;
      if (format === formats[0]) {
        // MM/DD/YYYY or DD/MM/YYYY
        month = parseInt(match[1], 10);
        day = parseInt(match[2], 10);
        year = parseInt(match[3], 10);
        // Assume MM/DD/YYYY if month > 12
        if (month > 12) {
          [day, month] = [month, day];
        }
      } else {
        // YYYY-MM-DD
        year = parseInt(match[1], 10);
        month = parseInt(match[2], 10);
        day = parseInt(match[3], 10);
      }
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  return null;
}

export default function TaskCSVImportModal({
  visible,
  onClose,
  projectId,
  onImportComplete,
}: TaskCSVImportModalProps) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const { createTask } = useTaskStore();
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);

  const handleFileSelect = async (event: any) => {
    if (Platform.OS !== 'web') {
      Alert.alert('Not Supported', 'CSV import is currently only available on web.');
      return;
    }

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      Alert.alert('Invalid File', 'Please select a CSV file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const tasks = parseCSV(text).map(t => ({ ...t, imported: false, importing: false }));
      setParsedTasks(tasks);
    };
    reader.readAsText(file);
  };

  const handleAcceptTask = async (index: number) => {
    if (!user?.id) return;

    const task = parsedTasks[index];
    if (task.imported || task.importing) return;
    
    // Check if title is still missing (required field)
    if (!task.title || task.title.trim() === '') {
      Alert.alert('Missing Title', 'Please provide a title for this task before importing.');
      return;
    }

    // Mark as importing
    const updatedTasks = [...parsedTasks];
    updatedTasks[index] = { ...task, importing: true };
    setParsedTasks(updatedTasks);

    try {
      await createTask({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate,
        startDate: task.startDate || new Date(),
        priority: task.priority || 1,
        projectId: projectId,
        userId: user.id,
        status: task.status || 'to_do',
        projectPhase: task.projectPhase,
        category: task.category,
        labelIds: [],
      });

      // Mark as imported
      updatedTasks[index] = { ...task, imported: true, importing: false };
      setParsedTasks(updatedTasks);
      onImportComplete?.();
    } catch (error: any) {
      // Show error and reset importing state
      Alert.alert('Import Failed', `Failed to import "${task.title}": ${error.message || 'Unknown error'}`);
      updatedTasks[index] = { ...task, importing: false };
      setParsedTasks(updatedTasks);
    }
  };

  const handleUpdateTask = (index: number, field: keyof ParsedTask, value: any) => {
    const updatedTasks = [...parsedTasks];
    const task = updatedTasks[index];
    const errors: string[] = [];
    
    if (field === 'dueDate' || field === 'startDate') {
      const date = typeof value === 'string' ? parseDate(value) : value;
      updatedTasks[index] = { ...task, [field]: date || undefined };
      // Clear date-related errors if date is now valid
      if (date && task.errors) {
        const dateField = field === 'dueDate' ? 'due date' : 'start date';
        updatedTasks[index].errors = task.errors.filter(e => !e.toLowerCase().includes(dateField));
      }
    } else if (field === 'priority') {
      const priority = parseInt(value, 10);
      if (value && (isNaN(priority) || priority < 1 || priority > 4)) {
        errors.push(`Invalid priority: ${value} (must be 1-4)`);
      }
      updatedTasks[index] = { ...task, priority: isNaN(priority) ? undefined : priority };
      // Clear priority-related errors if priority is now valid
      if (!errors.length && task.errors) {
        updatedTasks[index].errors = task.errors.filter(e => !e.toLowerCase().includes('priority'));
      }
    } else if (field === 'status') {
      const validStatuses = ['to_do', 'in_progress', 'blocked', 'on_hold', 'completed', 'cancelled'];
      if (value && !validStatuses.includes(value.toLowerCase())) {
        errors.push(`Invalid status: ${value}`);
      }
      updatedTasks[index] = { ...task, [field]: value };
      // Clear status-related errors if status is now valid
      if (!errors.length && task.errors) {
        updatedTasks[index].errors = task.errors.filter(e => !e.toLowerCase().includes('status'));
      }
    } else {
      updatedTasks[index] = { ...task, [field]: value };
      // Clear title-related errors if title is now provided
      if (field === 'title' && value && value.trim() && task.errors) {
        updatedTasks[index].errors = task.errors.filter(e => !e.toLowerCase().includes('title is required'));
      }
    }
    
    // Add new errors if any
    if (errors.length > 0) {
      updatedTasks[index].errors = [...(updatedTasks[index].errors || []), ...errors];
    }
    
    // Clean up empty errors array
    if (updatedTasks[index].errors && updatedTasks[index].errors.length === 0) {
      updatedTasks[index].errors = undefined;
    }
    
    setParsedTasks(updatedTasks);
  };

  const handleClose = () => {
    setParsedTasks([]);
    onClose();
  };

  const formatDateForInput = (date: Date | undefined): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper to get web-compatible styles for HTML elements
  const getWebInputStyle = (theme: any, hasErrors?: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '6px',
    borderRadius: '4px',
    border: `1px solid ${hasErrors ? '#EF4444' : theme.border}`,
    fontSize: '13px',
    fontFamily: 'inherit',
    backgroundColor: theme.surface,
    color: theme.text,
    outline: 'none',
  });

  const getWebInputSmallStyle = (theme: any): React.CSSProperties => ({
    ...getWebInputStyle(theme),
    padding: '4px',
    fontSize: '12px',
  });

  const getWebFileInputStyle = (theme: any): React.CSSProperties => ({
    marginTop: '12px',
    padding: '8px',
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: theme.surface,
    color: theme.text,
    outline: 'none',
  });

  const getWebPreStyle = (theme: any): React.CSSProperties => ({
    fontSize: '12px',
    fontFamily: 'monospace',
    margin: 0,
    whiteSpace: 'pre-wrap',
    color: theme.text,
  });

  const handleDownloadTemplate = () => {
    if (Platform.OS !== 'web') return;

    const csvTemplate = `title,description,due date,priority,status
Task 1,Description for task 1,2026-01-20,1,to_do
Task 2,Description for task 2,2026-01-25,2,in_progress
Task 3,Description for task 3,2026-02-01,3,to_do`;

    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'task-import-template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const csvTemplate = `title,description,due date,priority,status
Task 1,Description for task 1,2026-01-20,1,to_do
Task 2,Description for task 2,2026-01-25,2,in_progress
Task 3,Description for task 3,2026-02-01,3,to_do`;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={[styles.header, { borderBottomColor: theme.border }]}>
            <Text style={[styles.title, { color: theme.text }]}>Import Tasks from CSV</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <FontAwesome name="times" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={true}>
            {Platform.OS === 'web' ? (
              <>
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>Select CSV File</Text>
                    <TouchableOpacity
                      onPress={handleDownloadTemplate}
                      style={[styles.downloadButton, { borderColor: theme.border }]}
                    >
                      <FontAwesome name="download" size={12} color={theme.text} />
                      <Text style={[styles.downloadButtonText, { color: theme.text }]}>Download Template</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                    Your CSV file should have a header row with columns like: title, description, due date, priority, status
                  </Text>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    style={getWebFileInputStyle(theme)}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>CSV Format</Text>
                  <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                    Supported columns:
                  </Text>
                  <View style={styles.columnList}>
                    <Text style={[styles.columnItem, { color: theme.textSecondary }]}>• title (required)</Text>
                    <Text style={[styles.columnItem, { color: theme.textSecondary }]}>• description</Text>
                    <Text style={[styles.columnItem, { color: theme.textSecondary }]}>• due date (YYYY-MM-DD or MM/DD/YYYY)</Text>
                    <Text style={[styles.columnItem, { color: theme.textSecondary }]}>• start date (YYYY-MM-DD or MM/DD/YYYY)</Text>
                    <Text style={[styles.columnItem, { color: theme.textSecondary }]}>• priority (1-4)</Text>
                    <Text style={[styles.columnItem, { color: theme.textSecondary }]}>• status (to_do, in_progress, blocked, on_hold, completed, cancelled)</Text>
                    <Text style={[styles.columnItem, { color: theme.textSecondary }]}>• phase (brainstorm, design, logic, polish, done) - for Agile projects</Text>
                    <Text style={[styles.columnItem, { color: theme.textSecondary }]}>• category (bug, enhancement, support, other) - for Maintenance projects</Text>
                  </View>
                </View>

                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: theme.text }]}>Example CSV</Text>
                  <View style={[styles.codeBlock, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                    <pre style={getWebPreStyle(theme)}>
                      {csvTemplate}
                    </pre>
                  </View>
                </View>

                {parsedTasks.length > 0 && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Review and Import Tasks ({parsedTasks.length} tasks found)
                    </Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScrollContainer}>
                      <View style={[styles.tableContainer, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
                        {/* Table Header */}
                        <View style={[styles.tableRow, styles.tableHeader, { borderBottomColor: theme.border }]}>
                        <Text style={[styles.tableHeaderText, styles.tableCellTitle, { color: theme.text }]}>Title</Text>
                        <Text style={[styles.tableHeaderText, styles.tableCellDescription, { color: theme.text }]}>Description</Text>
                        <Text style={[styles.tableHeaderText, styles.tableCellPriority, { color: theme.text }]}>Priority</Text>
                        <Text style={[styles.tableHeaderText, styles.tableCellDate, { color: theme.text }]}>Start Date</Text>
                        <Text style={[styles.tableHeaderText, styles.tableCellDate, { color: theme.text }]}>Due Date</Text>
                        <Text style={[styles.tableHeaderText, styles.tableCellStatus, { color: theme.text }]}>Status</Text>
                        <Text style={[styles.tableHeaderText, styles.tableCellPhase, { color: theme.text }]}>Phase</Text>
                        <Text style={[styles.tableHeaderText, styles.tableCellCategory, { color: theme.text }]}>Category</Text>
                        <Text style={[styles.tableHeaderText, styles.tableCellAction, { color: theme.text }]}>Action</Text>
                      </View>

                      {/* Table Rows */}
                      <ScrollView style={styles.tableBody} nestedScrollEnabled={true}>
                        {parsedTasks.map((task, index) => {
                          const hasErrors = task.errors && task.errors.length > 0;
                          const isImported = task.imported;
                          const isImporting = task.importing;

                          return (
                            <View
                              key={index}
                              style={[
                                styles.tableRow,
                                styles.tableDataRow,
                                { borderBottomColor: theme.border },
                                hasErrors && styles.tableRowError,
                                isImported && styles.tableRowImported,
                              ]}
                            >
                              {/* Title - Editable */}
                              <View style={[styles.tableCell, styles.tableCellTitle]}>
                                {Platform.OS === 'web' ? (
                                  <input
                                    type="text"
                                    value={task.title}
                                    onChange={(e) => handleUpdateTask(index, 'title', e.target.value)}
                                    disabled={isImported}
                                    style={getWebInputStyle(theme, hasErrors)}
                                  />
                                ) : (
                                  <TextInput
                                    value={task.title}
                                    onChangeText={(text) => handleUpdateTask(index, 'title', text)}
                                    editable={!isImported}
                                    style={[
                                      styles.tableInput,
                                      {
                                        backgroundColor: theme.surface,
                                        color: theme.text,
                                        borderColor: hasErrors ? '#EF4444' : theme.border,
                                      },
                                    ]}
                                  />
                                )}
                                {hasErrors && (
                                  <Text style={[styles.errorText, { fontSize: 10, marginTop: 2 }]}>
                                    {task.errors?.join(', ')}
                                  </Text>
                                )}
                              </View>

                              {/* Description - Editable */}
                              <View style={[styles.tableCell, styles.tableCellDescription]}>
                                {Platform.OS === 'web' ? (
                                  <input
                                    type="text"
                                    value={task.description || ''}
                                    onChange={(e) => handleUpdateTask(index, 'description', e.target.value)}
                                    disabled={isImported}
                                    placeholder="Description"
                                    style={getWebInputStyle(theme)}
                                  />
                                ) : (
                                  <TextInput
                                    value={task.description || ''}
                                    onChangeText={(text) => handleUpdateTask(index, 'description', text)}
                                    editable={!isImported}
                                    placeholder="Description"
                                    style={getWebInputStyle(theme)}
                                  />
                                )}
                              </View>

                              {/* Priority - Editable */}
                              <View style={[styles.tableCell, styles.tableCellPriority]}>
                                {Platform.OS === 'web' ? (
                                  <input
                                    type="number"
                                    min="1"
                                    max="4"
                                    value={task.priority || ''}
                                    onChange={(e) => handleUpdateTask(index, 'priority', e.target.value)}
                                    disabled={isImported}
                                    style={getWebInputSmallStyle(theme)}
                                  />
                                ) : (
                                  <TextInput
                                    value={task.priority?.toString() || ''}
                                    onChangeText={(text) => handleUpdateTask(index, 'priority', text)}
                                    keyboardType="numeric"
                                    editable={!isImported}
                                    style={getWebInputSmallStyle(theme)}
                                  />
                                )}
                              </View>

                              {/* Start Date - Editable */}
                              <View style={[styles.tableCell, styles.tableCellDate]}>
                                {Platform.OS === 'web' ? (
                                  <input
                                    type="date"
                                    value={formatDateForInput(task.startDate)}
                                    onChange={(e) => handleUpdateTask(index, 'startDate', e.target.value)}
                                    disabled={isImported}
                                    style={getWebInputSmallStyle(theme)}
                                  />
                                ) : (
                                  <TextInput
                                    value={formatDateForInput(task.startDate)}
                                    onChangeText={(text) => handleUpdateTask(index, 'startDate', text)}
                                    editable={!isImported}
                                    placeholder="YYYY-MM-DD"
                                    style={getWebInputSmallStyle(theme)}
                                  />
                                )}
                              </View>

                              {/* Due Date - Editable */}
                              <View style={[styles.tableCell, styles.tableCellDate]}>
                                {Platform.OS === 'web' ? (
                                  <input
                                    type="date"
                                    value={formatDateForInput(task.dueDate)}
                                    onChange={(e) => handleUpdateTask(index, 'dueDate', e.target.value)}
                                    disabled={isImported}
                                    style={getWebInputSmallStyle(theme)}
                                  />
                                ) : (
                                  <TextInput
                                    value={formatDateForInput(task.dueDate)}
                                    onChangeText={(text) => handleUpdateTask(index, 'dueDate', text)}
                                    editable={!isImported}
                                    placeholder="YYYY-MM-DD"
                                    style={getWebInputSmallStyle(theme)}
                                  />
                                )}
                              </View>

                              {/* Status - Editable */}
                              <View style={[styles.tableCell, styles.tableCellStatus]}>
                                {Platform.OS === 'web' ? (
                                  <select
                                    value={task.status || 'to_do'}
                                    onChange={(e) => handleUpdateTask(index, 'status', e.target.value)}
                                    disabled={isImported}
                                    style={getWebInputSmallStyle(theme)}
                                  >
                                    <option value="to_do">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="blocked">Blocked</option>
                                    <option value="on_hold">On Hold</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                ) : (
                                  <Text style={[styles.tableText, { color: theme.text }]}>
                                    {task.status || 'to_do'}
                                  </Text>
                                )}
                              </View>

                              {/* Phase - Editable */}
                              <View style={[styles.tableCell, styles.tableCellPhase]}>
                                {Platform.OS === 'web' ? (
                                  <select
                                    value={task.projectPhase || ''}
                                    onChange={(e) => handleUpdateTask(index, 'projectPhase', e.target.value)}
                                    disabled={isImported}
                                    style={getWebInputSmallStyle(theme)}
                                  >
                                    <option value="">None</option>
                                    <option value="brainstorm">Brainstorm</option>
                                    <option value="design">Design</option>
                                    <option value="logic">Logic</option>
                                    <option value="polish">Polish</option>
                                    <option value="done">Done</option>
                                  </select>
                                ) : (
                                  <Text style={[styles.tableText, { color: theme.text }]}>
                                    {task.projectPhase || '-'}
                                  </Text>
                                )}
                              </View>

                              {/* Category - Editable */}
                              <View style={[styles.tableCell, styles.tableCellCategory]}>
                                {Platform.OS === 'web' ? (
                                  <select
                                    value={task.category || ''}
                                    onChange={(e) => handleUpdateTask(index, 'category', e.target.value)}
                                    disabled={isImported}
                                    style={getWebInputSmallStyle(theme)}
                                  >
                                    <option value="">None</option>
                                    <option value="bug">Bug</option>
                                    <option value="enhancement">Enhancement</option>
                                    <option value="support">Support</option>
                                    <option value="other">Other</option>
                                  </select>
                                ) : (
                                  <Text style={[styles.tableText, { color: theme.text }]}>
                                    {task.category || '-'}
                                  </Text>
                                )}
                              </View>

                              {/* Accept Button */}
                              <View style={[styles.tableCell, styles.tableCellAction]}>
                                {isImported ? (
                                  <View style={[styles.acceptButton, styles.acceptButtonSuccess, { backgroundColor: '#10B981' }]}>
                                    <FontAwesome name="check" size={14} color="#ffffff" />
                                    <Text style={[styles.acceptButtonText, { color: '#ffffff' }]}>Imported</Text>
                                  </View>
                                ) : (
                                  <TouchableOpacity
                                    onPress={() => handleAcceptTask(index)}
                                    disabled={isImporting}
                                    style={[
                                      styles.acceptButton,
                                      {
                                        backgroundColor: theme.primary,
                                        opacity: isImporting ? 0.6 : 1,
                                      },
                                    ]}
                                  >
                                    {isImporting ? (
                                      <ActivityIndicator color="#ffffff" size="small" />
                                    ) : (
                                      <>
                                        <FontAwesome name="check" size={14} color="#ffffff" />
                                        <Text style={[styles.acceptButtonText, { color: '#ffffff' }]}>Accept</Text>
                                      </>
                                    )}
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>
                          );
                        })}
                      </ScrollView>
                      </View>
                    </ScrollView>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.section}>
                <Text style={[styles.sectionText, { color: theme.textSecondary }]}>
                  CSV import is currently only available on web. Please use the web version to import tasks.
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <TouchableOpacity
              onPress={handleClose}
              style={[styles.button, styles.cancelButton, { borderColor: theme.border }]}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 20 : 16,
  },
  modalContent: {
    width: Platform.OS === 'web' ? 900 : '100%',
    maxWidth: '100%',
    maxHeight: Platform.OS === 'web' ? '90%' : '100%',
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
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  downloadButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  columnList: {
    marginTop: 8,
  },
  columnItem: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  fileInput: {
    marginTop: 12,
    padding: 8,
    borderWidth: 1,
    borderRadius: 6,
    fontSize: 14,
  },
  codeBlock: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'auto',
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  previewContainer: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 8,
  },
  previewRow: {
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  previewError: {
    fontSize: 12,
    marginTop: 2,
  },
  previewMore: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  resultsContainer: {
    marginTop: 8,
  },
  resultText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  errorsContainer: {
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
    maxHeight: 200,
  },
  errorText: {
    fontSize: 12,
    marginBottom: 4,
  },
  tableScrollContainer: {
    marginTop: 8,
  },
  tableContainer: {
    borderRadius: 6,
    borderWidth: 1,
    overflow: 'hidden',
    minWidth: 1100,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  tableHeader: {
    borderBottomWidth: 2,
    paddingVertical: 12,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  tableBody: {
    maxHeight: 500,
  },
  tableDataRow: {
    borderBottomWidth: 1,
    minHeight: 60,
  },
  tableRowError: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  tableRowImported: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    opacity: 0.7,
  },
  tableCell: {
    paddingHorizontal: 4,
  },
  tableCellTitle: {
    flex: 2,
    minWidth: 150,
  },
  tableCellDescription: {
    flex: 2,
    minWidth: 150,
  },
  tableCellPriority: {
    flex: 0.8,
    minWidth: 80,
  },
  tableCellDate: {
    flex: 1,
    minWidth: 120,
  },
  tableCellStatus: {
    flex: 1,
    minWidth: 120,
  },
  tableCellPhase: {
    flex: 1,
    minWidth: 100,
  },
  tableCellCategory: {
    flex: 1,
    minWidth: 100,
  },
  tableCellAction: {
    flex: 1,
    minWidth: 100,
  },
  tableInput: {
    width: '100%',
    padding: 6,
    borderRadius: 4,
    borderWidth: 1,
    fontSize: 13,
    fontFamily: Platform.OS === 'web' ? 'inherit' : undefined,
  },
  tableInputSmall: {
    padding: 4,
    fontSize: 12,
  },
  tableText: {
    fontSize: 13,
  },
  acceptButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    justifyContent: 'center',
  },
  acceptButtonSuccess: {
    // backgroundColor set inline
  },
  acceptButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    minHeight: 40,
  },
  cancelButton: {
    borderWidth: 1,
  },
  importButton: {
    // backgroundColor set inline
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
