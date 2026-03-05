import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { CourseDetail } from '../types';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then((res) => setCourse(res.data))
      .catch((err) => console.error('Failed to load course:', err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    setEnrolling(true);
    try {
      await api.post(`/enrollments/${id}`);
      setCourse((prev) => prev ? { ...prev, enrolled: true } : prev);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setCourse((prev) => prev ? { ...prev, enrolled: true } : prev);
      }
      console.error('Enrollment failed:', err);
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartLearning = () => {
    if (course && course.sections.length > 0 && course.sections[0].lessons.length > 0) {
      const firstLesson = course.sections[0].lessons[0];
      navigate(`/learn/${course.id}/${firstLesson.id}`);
    }
  };

  if (loading) return <div style={styles.loading}>Loading course...</div>;
  if (!course) return <div style={styles.loading}>Course not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>{course.title}</h1>
          <p style={styles.instructor}>by {course.instructor_name}</p>
          <p style={styles.description}>{course.description}</p>
          <div style={styles.stats}>
            <span style={styles.stat}>{course.total_lessons} lessons</span>
            <span style={styles.statDot}>-</span>
            <span style={styles.stat}>{formatDuration(course.total_duration)} total</span>
          </div>
          {course.enrolled ? (
            <button onClick={handleStartLearning} style={styles.enrollBtn}>
              Start Learning
            </button>
          ) : (
            <button onClick={handleEnroll} disabled={enrolling} style={styles.enrollBtn}>
              {enrolling ? 'Enrolling...' : 'Enroll Now - Free'}
            </button>
          )}
        </div>
        <img
          src={course.thumbnail}
          alt={course.title}
          style={styles.headerImg}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://via.placeholder.com/400x225?text=Course';
          }}
        />
      </div>

      <div style={styles.content}>
        <div style={styles.learnSection}>
          <h2 style={styles.sectionTitle}>What You'll Learn</h2>
          <div style={styles.learnGrid}>
            {(course.what_you_learn || []).map((item, i) => (
              <div key={i} style={styles.learnItem}>
                <span style={styles.checkIcon}>&#10003;</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.curriculumSection}>
          <h2 style={styles.sectionTitle}>Course Curriculum</h2>
          {course.sections.map((section) => (
            <div key={section.id} style={styles.sectionBlock}>
              <h3 style={styles.sectionName}>{section.title}</h3>
              {section.lessons.map((lesson) => (
                <div key={lesson.id} style={styles.lessonRow}>
                  <span style={styles.playIcon}>&#9654;</span>
                  <span style={styles.lessonTitle}>{lesson.title}</span>
                  <span style={styles.lessonDuration}>{formatDuration(lesson.duration)}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '0 24px 60px',
  },
  loading: {
    color: '#888',
    textAlign: 'center',
    padding: 80,
    fontSize: 16,
  },
  header: {
    display: 'flex',
    gap: 40,
    alignItems: 'center',
    padding: '40px 0',
    flexWrap: 'wrap',
  },
  headerContent: {
    flex: 1,
    minWidth: 300,
  },
  title: {
    fontSize: 30,
    fontWeight: 800,
    color: '#fff',
    marginBottom: 8,
    lineHeight: 1.2,
  },
  instructor: {
    fontSize: 15,
    color: '#e94560',
    fontWeight: 500,
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#aaa',
    lineHeight: 1.7,
    marginBottom: 20,
  },
  stats: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  stat: {
    color: '#888',
    fontSize: 14,
  },
  statDot: {
    color: '#555',
  },
  enrollBtn: {
    padding: '14px 36px',
    background: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
  },
  headerImg: {
    width: 400,
    maxWidth: '100%',
    borderRadius: 12,
    objectFit: 'cover',
    boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
  },
  content: {
    marginTop: 20,
  },
  learnSection: {
    background: '#16213e',
    borderRadius: 12,
    padding: 32,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 20,
  },
  learnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 14,
  },
  learnItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    color: '#ccc',
    fontSize: 14,
    lineHeight: 1.5,
  },
  checkIcon: {
    color: '#e94560',
    fontWeight: 700,
    fontSize: 14,
    marginTop: 2,
    flexShrink: 0,
  },
  curriculumSection: {
    background: '#16213e',
    borderRadius: 12,
    padding: 32,
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#e94560',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: '1px solid #2a2a4a',
  },
  lessonRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderBottom: '1px solid #1a1a3e',
  },
  playIcon: {
    color: '#555',
    fontSize: 10,
    flexShrink: 0,
  },
  lessonTitle: {
    color: '#ccc',
    fontSize: 14,
    flex: 1,
  },
  lessonDuration: {
    color: '#666',
    fontSize: 12,
    flexShrink: 0,
  },
};
