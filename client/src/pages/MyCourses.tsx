import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { Enrollment } from '../types';

export default function MyCourses() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/enrollments')
      .then((res) => setEnrollments(res.data))
      .catch((err) => console.error('Failed to load enrollments:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleResume = async (enrollment: Enrollment) => {
    try {
      const res = await api.get(`/progress/course/${enrollment.course_id}`);
      const progress = res.data;
      if (progress.last_watched) {
        navigate(`/learn/${enrollment.course_id}/${progress.last_watched.lesson_id}`);
      } else {
        // Go to first lesson
        const courseRes = await api.get(`/courses/${enrollment.course_id}`);
        const course = courseRes.data;
        if (course.sections?.length > 0 && course.sections[0].lessons?.length > 0) {
          navigate(`/learn/${enrollment.course_id}/${course.sections[0].lessons[0].id}`);
        }
      }
    } catch {
      navigate(`/course/${enrollment.course_id}`);
    }
  };

  if (loading) return <div style={styles.loading}>Loading your courses...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>My Courses</h1>
      {enrollments.length === 0 ? (
        <div style={styles.empty}>
          <p>You haven't enrolled in any courses yet.</p>
          <button onClick={() => navigate('/')} style={styles.browseBtn}>
            Browse Courses
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {enrollments.map((enrollment) => (
            <div key={enrollment.id} style={styles.card}>
              <img
                src={enrollment.thumbnail}
                alt={enrollment.title}
                style={styles.thumbnail}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://via.placeholder.com/400x225?text=Course';
                }}
              />
              <div style={styles.body}>
                <h3 style={styles.courseTitle}>{enrollment.title}</h3>
                <p style={styles.instructor}>{enrollment.instructor_name}</p>
                <div style={styles.progressBarOuter}>
                  <div
                    style={{
                      ...styles.progressBarInner,
                      width: `${enrollment.progress_percentage}%`,
                    }}
                  />
                </div>
                <p style={styles.progressText}>
                  {enrollment.completed_lessons} / {enrollment.total_lessons} lessons
                  ({enrollment.progress_percentage}%)
                </p>
                <button
                  onClick={() => handleResume(enrollment)}
                  style={styles.resumeBtn}
                >
                  {enrollment.progress_percentage === 0
                    ? 'Start Learning'
                    : enrollment.progress_percentage === 100
                    ? 'Review Course'
                    : 'Resume'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '40px 24px 60px',
  },
  title: {
    fontSize: 28,
    fontWeight: 800,
    color: '#fff',
    marginBottom: 32,
  },
  loading: {
    color: '#888',
    textAlign: 'center',
    padding: 80,
    fontSize: 16,
  },
  empty: {
    textAlign: 'center',
    color: '#888',
    padding: 60,
    fontSize: 15,
  },
  browseBtn: {
    marginTop: 16,
    padding: '12px 28px',
    background: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 24,
  },
  card: {
    background: '#16213e',
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
  },
  thumbnail: {
    width: '100%',
    height: 170,
    objectFit: 'cover',
  },
  body: {
    padding: 20,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 4,
    lineHeight: 1.3,
  },
  instructor: {
    fontSize: 13,
    color: '#e94560',
    marginBottom: 14,
    fontWeight: 500,
  },
  progressBarOuter: {
    height: 6,
    background: '#0f3460',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarInner: {
    height: '100%',
    background: '#e94560',
    borderRadius: 3,
    transition: 'width 0.3s',
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 14,
  },
  resumeBtn: {
    width: '100%',
    padding: 12,
    background: '#e94560',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
