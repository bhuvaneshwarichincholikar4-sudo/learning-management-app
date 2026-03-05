import { useState, useEffect } from 'react';
import api from '../services/api';
import type { Course } from '../types';
import CourseCard from '../components/CourseCard';

export default function Home() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/courses')
      .then((res) => setCourses(res.data))
      .catch((err) => console.error('Failed to load courses:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={styles.loading}>Loading courses...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Explore Courses</h1>
        <p style={styles.heroSub}>Learn from the best instructors with structured, video-based courses</p>
      </div>
      <div style={styles.grid}>
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
      {courses.length === 0 && (
        <p style={styles.empty}>No courses available yet. Run the seed script to add demo data.</p>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 24px 60px',
  },
  hero: {
    textAlign: 'center',
    padding: '48px 0 32px',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 800,
    color: '#fff',
    marginBottom: 8,
  },
  heroSub: {
    fontSize: 16,
    color: '#888',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 24,
  },
  loading: {
    color: '#888',
    textAlign: 'center',
    padding: 80,
    fontSize: 16,
  },
  empty: {
    color: '#666',
    textAlign: 'center',
    padding: 40,
    fontSize: 14,
  },
};
