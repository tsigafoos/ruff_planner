import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import ProjectCard from '@/components/ProjectCard';
import ProjectForm from '@/components/ProjectForm';
import { PageWrapper } from '@/components/ui';

export default function ProjectsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { projects, loading, fetchProjects, createProject, updateProject } = useProjectStore();
  const [projectFormVisible, setProjectFormVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

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

  return (
    <PageWrapper
      section="Projects"
      title="All Projects"
      subtitle={`${projects.length} projects`}
      loading={loading}
      isEmpty={projects.length === 0}
      emptyState={{
        icon: 'folder-open-o',
        title: 'No projects yet',
        subtitle: 'Create a project to get started',
      }}
      actions={[
        {
          label: '+ New Project',
          icon: 'plus',
          onPress: () => {
            setSelectedProject(null);
            setProjectFormVisible(true);
          },
          variant: 'primary',
        },
      ]}
    >
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
      />

      <ProjectForm
        visible={projectFormVisible}
        onClose={() => {
          setProjectFormVisible(false);
          setSelectedProject(null);
        }}
        onSubmit={selectedProject ? handleUpdateProject : handleCreateProject}
        initialData={selectedProject}
      />
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Platform.OS === 'web' ? 24 : 16,
  },
});
