import { ProjectShowcaseData } from '@/app/types/project-showcase';

// Sample project data for development and testing
export const sampleProjects: ProjectShowcaseData[] = [
  {
    id: '1',
    title: 'NEURAL VISION',
    description: 'Advanced computer vision system utilizing deep learning architectures for real-time object detection and classification. Built with TensorFlow and OpenCV, this project demonstrates the power of convolutional neural networks in processing visual data streams with 94% accuracy across 20+ object categories. The system features adaptive learning capabilities, allowing it to improve recognition patterns over time through continuous training cycles.',
    skills: ['Python', 'TensorFlow', 'OpenCV', 'PyTorch', 'CUDA', 'Docker'],
    images: [
      {
        id: 'img1',
        blob_url: '/gallery_photos/2024_January_05_16-04.jpg',
        caption: 'Neural network architecture visualization',
        alt_text: 'Complex neural network diagram showing interconnected nodes',
        order: 1
      },
      {
        id: 'img2',
        blob_url: '/gallery_photos/2024_March_04_18-19.jpg',
        caption: 'Real-time object detection in action',
        alt_text: 'Screenshot of live object detection with bounding boxes',
        order: 2
      }
    ],
    featured: true,
    order: 1,
    project_end_date: '2024-03-15'
  },
  {
    id: '2',
    title: 'QUANTUM ANALYTICS',
    description: 'Cutting-edge quantum computing simulation platform designed for financial modeling and risk analysis. This project explores quantum algorithms for portfolio optimization and market prediction, achieving computational speedups of 300x over classical methods. The platform integrates with existing financial systems through RESTful APIs and provides real-time analytics dashboards for institutional traders.',
    skills: ['Qiskit', 'Python', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
    images: [
      {
        id: 'img3',
        blob_url: '/gallery_photos/2024_February_17_13-57.jpg',
        caption: 'Quantum circuit visualization interface',
        alt_text: 'Complex quantum circuit diagram with gates and qubits',
        order: 1
      }
    ],
    featured: false,
    order: 2,
    project_end_date: '2024-01-20'
  },
  {
    id: '3',
    title: 'CYBER FORTRESS',
    description: 'Enterprise-grade cybersecurity platform offering zero-trust architecture and advanced threat detection. The system employs machine learning algorithms to identify anomalous network behavior and automatically responds to security incidents. Built with microservices architecture, it scales to protect organizations with 100,000+ endpoints while maintaining sub-millisecond response times for critical security events.',
    skills: ['Go', 'Kubernetes', 'Elasticsearch', 'Redis', 'Terraform', 'Prometheus'],
    images: [
      {
        id: 'img4',
        blob_url: '/gallery_photos/2024_October_04_16-34.jpg',
        caption: 'Security dashboard showing threat analysis',
        alt_text: 'Dark-themed security dashboard with network topology',
        order: 1
      },
      {
        id: 'img5',
        blob_url: '/gallery_photos/2024_September_02_12-39.jpg',
        caption: 'Real-time threat monitoring visualization',
        alt_text: 'Live threat map showing global attack patterns',
        order: 2
      }
    ],
    featured: true,
    order: 3,
    project_end_date: '2024-09-30'
  },
  {
    id: '4',
    title: 'BIOTECH SYNTHESIZER',
    description: 'Revolutionary bioinformatics platform for protein folding prediction and drug discovery. Using transformer models and molecular dynamics simulations, this system accelerates the identification of therapeutic compounds by 10x. The platform integrates with laboratory automation systems and provides researchers with interactive 3D visualizations of molecular structures and binding sites.',
    skills: ['Python', 'PyMOL', 'CUDA', 'Django', 'PostgreSQL', 'Docker'],
    images: [
      {
        id: 'img6',
        blob_url: '/gallery_photos/2024_January_13_15-56.jpg',
        caption: '3D protein structure visualization',
        alt_text: 'Complex protein molecule rendered in 3D with highlighted binding sites',
        order: 1
      }
    ],
    featured: false,
    order: 4,
    project_end_date: '2024-06-12'
  }
];

// Helper function to transform database projects to showcase format
export function transformProjectForShowcase(dbProject: any): ProjectShowcaseData {
  return {
    id: dbProject.id,
    title: dbProject.title,
    description: dbProject.description,
    skills: dbProject.skills || [],
    images: dbProject.images?.map((img: any, index: number) => ({
      id: img.id || `img-${index}`,
      blob_url: img.blob_url,
      caption: img.caption || '',
      alt_text: img.alt_text || `${dbProject.title} - Image ${index + 1}`,
      order: index + 1
    })) || [],
    featured: dbProject.featured || false,
    order: dbProject.order || 999,
    project_end_date: dbProject.project_end_date
  };
}

// Helper function to get projects sorted by order
export function getSortedProjects(projects: ProjectShowcaseData[]): ProjectShowcaseData[] {
  return [...projects].sort((a, b) => {
    // Featured projects first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    
    // Then by order
    return (a.order || 999) - (b.order || 999);
  });
}

// Helper function to get featured projects only
export function getFeaturedProjects(projects: ProjectShowcaseData[]): ProjectShowcaseData[] {
  return projects.filter(project => project.featured);
}