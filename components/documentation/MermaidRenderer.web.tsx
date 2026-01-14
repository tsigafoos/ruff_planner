import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface MermaidRendererProps {
  content: string;
  id: string;
}

// Common Mermaid syntax errors and their fixes
const SYNTAX_HINTS: Record<string, string> = {
  'Lexical error': 'Check for invalid characters or missing quotes around text with special characters.',
  'Parse error': 'Verify your diagram structure. Each node needs proper syntax like A[Label] or B{Decision}.',
  'Unknown diagram type': 'Start with a valid diagram type: graph, sequenceDiagram, classDiagram, gantt, pie, stateDiagram, erDiagram, or mindmap.',
  'Expecting': 'Missing required syntax element. Check arrows (-->) and node definitions.',
  'undefined': 'Node referenced before definition. Define all nodes before connecting them.',
};

function getErrorHint(errorMessage: string): string {
  for (const [key, hint] of Object.entries(SYNTAX_HINTS)) {
    if (errorMessage.includes(key)) {
      return hint;
    }
  }
  return 'Check your Mermaid syntax. Common issues: missing arrows (-->), unclosed brackets, or invalid node names.';
}

export default function MermaidRenderer({ content, id }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRawSyntax, setShowRawSyntax] = useState(false);

  useEffect(() => {
    if (!content || !containerRef.current) return;

    setError(null);
    setShowRawSyntax(false);

    const renderMermaid = async () => {
      try {
        // Dynamically import mermaid
        const mermaid = (await import('mermaid')).default;
        
        // Initialize mermaid with better config
        mermaid.initialize({ 
          startOnLoad: false, 
          theme: 'default',
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis',
          },
          themeVariables: {
            primaryColor: '#3B82F6',
            primaryTextColor: '#1F2937',
            primaryBorderColor: '#93C5FD',
            lineColor: '#6B7280',
            secondaryColor: '#EFF6FF',
            tertiaryColor: '#F3F4F6',
          },
        });

        // Clear container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Generate unique ID for this chart
        const chartId = `mermaid-${id}-${Date.now()}`;
        
        // Render the chart
        if (containerRef.current) {
          const svg = await mermaid.render(chartId, content);
          if (containerRef.current) {
            containerRef.current.innerHTML = svg.svg;
            setError(null);
          }
        }
      } catch (err: any) {
        console.error('Error rendering Mermaid chart:', err);
        const errorMessage = err?.message || err?.toString() || 'Unknown error';
        setError(errorMessage);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
      }
    };

    renderMermaid();
  }, [content, id]);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <View style={styles.errorHeader}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Chart Rendering Error</Text>
          </View>
          
          <View style={styles.errorHint}>
            <Text style={styles.errorHintLabel}>💡 Hint:</Text>
            <Text style={styles.errorHintText}>{getErrorHint(error)}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.showSyntaxBtn}
            onPress={() => setShowRawSyntax(!showRawSyntax)}
          >
            <Text style={styles.showSyntaxBtnText}>
              {showRawSyntax ? 'Hide' : 'Show'} Raw Syntax
            </Text>
          </TouchableOpacity>
          
          {showRawSyntax && (
            <View style={styles.rawSyntax}>
              <Text style={styles.rawSyntaxText}>{content}</Text>
            </View>
          )}
          
          <View style={styles.errorDetails}>
            <Text style={styles.errorDetailsLabel}>Error details:</Text>
            <Text style={styles.errorDetailsText}>{error}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* @ts-ignore - web-only div element */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          minHeight: 200,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      />
    </View>
  );
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
  // Error styles
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  errorIcon: {
    fontSize: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991B1B',
  },
  errorHint: {
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  errorHintLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  errorHintText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  showSyntaxBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 12,
  },
  showSyntaxBtnText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  rawSyntax: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  rawSyntaxText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#374151',
  },
  errorDetails: {
    marginTop: 8,
  },
  errorDetailsLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  errorDetailsText: {
    fontSize: 11,
    color: '#991B1B',
    fontFamily: 'monospace',
  },
});
