import { View, Text, StyleSheet, Platform } from 'react-native';

interface MermaidRendererProps {
  content: string;
  id: string;
}

export default function MermaidRenderer({ content, id }: MermaidRendererProps) {
  if (Platform.OS !== 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.mobileView}>
          <Text style={styles.mobileText}>Mermaid charts are only available on web</Text>
          <Text style={styles.codeText}>{content}</Text>
        </View>
      </View>
    );
  }

  // On web, dynamically import the web version
  // Metro bundler will automatically use MermaidRenderer.web.tsx on web
  const WebMermaidRenderer = require('./MermaidRenderer.web').default;
  return <WebMermaidRenderer content={content} id={id} />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 200,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  mobileView: {
    padding: 16,
  },
  mobileText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#374151',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 4,
  },
});
