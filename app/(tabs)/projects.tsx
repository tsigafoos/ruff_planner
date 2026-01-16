import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Platform, View, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useProjectStore } from '@/store/projectStore';
import { useTaskStore } from '@/store/taskStore';
import { useAuthStore } from '@/store/authStore';
import ProjectCard from '@/components/ProjectCard';
import ProjectForm from '@/components/ProjectForm';
import { PageWrapper } from '@/components/ui';
import { MobileProjectList } from '@/components/mobile';
import { TemplateTask } from '@/lib/projectTemplates';

const isMobile = Platform.OS !== 'web';

export default function ProjectsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { projects, loading, fetchProjects, createProject, updateProject, deleteProject } = useProjectStore();
  const { createTask, fetchTasks } = useTaskStore();
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

  // Handler for creating project from template with tasks
  const handleCreateProjectWithTasks = async (
    projectData: any, 
    templateTasks: Array<TemplateTask & { dueDate: Date; startDate?: Date }>
  ) => {
    if (!user?.id) return;
    try {
      const newProject = await createProject({
        ...projectData,
        userId: user.id,
      });
      
      if (newProject?.id) {
        for (const templateTask of templateTasks) {
          await createTask({
            title: templateTask.title,
            description: templateTask.description || '',
            priority: templateTask.priority,
            status: templateTask.status || 'to_do',
            dueDate: templateTask.dueDate,
            startDate: templateTask.startDate,
            phase: templateTask.phase,
            category: templateTask.category,
            projectId: newProject.id,
            userId: user.id,
          });
        }
      }
      
      setProjectFormVisible(false);
      fetchProjects(user.id);
      fetchTasks(user.id);
    } catch (error) {
      console.error('Error creating project with tasks:', error);
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

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    Alert.alert(
      'Delete Project',
      `Are you sure you want to delete "${projectName}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            try {
              await deleteProject(projectId);
              fetchProjects(user.id);
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete project');
            }
          },
        },
      ]
    );
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <View style={styles.mobileContainer}>
        <MobileProjectList
          projects={projects}
          tasks={[]} // Can be populated with tasks for progress calculation
          loading={loading}
          onRefresh={() => user?.id && fetchProjects(user.id)}
          onProjectPress={(project) => router.push(`/project/${project.id}`)}
          onAddProject={() => {
            setSelectedProject(null);
            setProjectFormVisible(true);
          }}
        />

        <ProjectForm
          visible={projectFormVisible}
          onClose={() => {
            setProjectFormVisible(false);
            setSelectedProject(null);
          }}
          onSubmit={selectedProject ? handleUpdateProject : handleCreateProject}
          onCreateWithTasks={handleCreateProjectWithTasks}
          initialData={selectedProject}
        />
      </View>
    );
  }

  // Web Layout
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
            onDelete={() => handleDeleteProject(item.id, item.name)}
          />
        )}
        contentContainerStyle={styles.list}
      />

      <ProjectForm
        visible={projectFormVisible}
        onClose={() => {
          setProjectFormVisible(false);
          setSelectedProject(null);
        }}
        onSubmit={selectedProject ? handleUpdateProject : handleCreateProject}
        onCreateWithTasks={handleCreateProjectWithTasks}
        initialData={selectedProject}
      />
    </PageWrapper>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingBottom: Platform.OS === 'web' ? 40 : 100,
  },
  mobileContainer: {
    flex: 1,
  },
});
