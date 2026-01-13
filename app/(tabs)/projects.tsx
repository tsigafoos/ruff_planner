import { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import ProjectCard from '@/components/ProjectCard';
import ProjectForm from '@/components/ProjectForm';
import { useTheme } from '@/components/useTheme';

export default function ProjectsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { projects, loading, fetchProjects, createProject, updateProject, deleteProject } = useProjectStore();
  const [projectFormVisible, setProjectFormVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const theme = useTheme();

  useEffect(() => {
    if (user?.id) {
      fetchProjects(user.id);
    }
  }, [user?.id]);

  const handleCreateProject = async (projectData: any) => {
    if (!user?.id) return;
    try {
      await createProject({
        ...projectData,
        userId: user.id,
      });
      setProjectFormVisible(false);
      fetchProjects(user.id);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleUpdateProject = async (projectData: any) => {
    if (!selectedProject?.id || !user?.id) return;
    try {
      await updateProject(selectedProject.id, projectData);
      setProjectFormVisible(false);
      setSelectedProject(null);
      fetchProjects(user.id);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleEditProject = (project: any) => {
    setSelectedProject(project);
    setProjectFormVisible(true);
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      if (user?.id) fetchProjects(user.id);
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Projects</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => {
            setSelectedProject(null);
            setProjectFormVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ New Project</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={projects}
          keyExtractor={(item: any) => item.id}
          renderItem={({ item }) => (
            <ProjectCard
              project={item}
              taskCount={0}
              onPress={() => router.push(`/project/${item.id}`)}
            />
          )}
          contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === 'web' ? 40 : 100 }]}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No projects yet</Text>
              <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
                Create a project to get started
              </Text>
            </View>
          }
        />
      )}

      <ProjectForm
        visible={projectFormVisible}
        onClose={() => {
          setProjectFormVisible(false);
          setSelectedProject(null);
        }}
        onSubmit={selectedProject ? handleUpdateProject : handleCreateProject}
        initialData={selectedProject}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Platform.OS === 'web' ? 24 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 20 : 32,
    fontWeight: 'bold',
  },
  addButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: Platform.OS === 'web' ? 13 : 14,
    fontWeight: '600',
  },
  list: {
    padding: Platform.OS === 'web' ? 24 : 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Platform.OS === 'web' ? 14 : 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: Platform.OS === 'web' ? 12 : 14,
  },
});
