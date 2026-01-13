import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

interface MermaidRendererProps {
  content: string;
  id: string;
}

export default function MermaidRenderer({ content, id }: MermaidRendererProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!content || !containerRef.current) return;

    const renderMermaid = async () => {
      try {
        // Dynamically import mermaid
        const mermaid = (await import('mermaid')).default;
        
        // Initialize mermaid
        mermaid.initialize({ 
          startOnLoad: false, 
          theme: 'default',
          securityLevel: 'loose',
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
          }
        }
      } catch (error) {
        console.error('Error rendering Mermaid chart:', error);
        if (containerRef.current) {
          containerRef.current.innerHTML = `<div style="color: #EF4444; padding: 20px; background: #FEF2F2; border-radius: 8px;">Error rendering chart. Please check your Mermaid syntax.</div>`;
        }
      }
    };

    renderMermaid();
  }, [content, id]);

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
});
