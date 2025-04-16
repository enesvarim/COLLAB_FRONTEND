import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Container from '../components/Container';
import ProjectMembers from '../components/ProjectMembers';

const ProjectDetail = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    // Proje detaylarını API'den çekmek için
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/projects/${id}`);
        const data = await response.json();
        setProject(data);
      } catch (error) {
        console.error('Proje detayları alınırken hata oluştu:', error);
      }
    };

    fetchProject();
  }, [id]);

  // Proje verilerini güncellemek için
  const handleProjectUpdate = (updatedProject) => {
    setProject(updatedProject);
  };

  return (
    <Container>
      {project && (
        <>
          <h1>{project.name}</h1>
          <p>{project.description}</p>

          {/* Üyeleri ve yönetici atama/kaldırma işlemlerini gösteren kısım */}
          <ProjectMembers
            project={project}
            onUpdate={handleProjectUpdate}
          />
        </>
      )}
    </Container>
  );
};

export default ProjectDetail;