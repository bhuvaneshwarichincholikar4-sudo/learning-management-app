import type { Course } from '../types';
import { Link } from 'react-router-dom';

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link to={`/course/${course.id}`} style={styles.card}>
      <img
        src={course.thumbnail}
        alt={course.title}
        style={styles.thumbnail}
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            'https://via.placeholder.com/400x225?text=Course+Thumbnail';
        }}
      />
      <div style={styles.body}>
        <h3 style={styles.title}>{course.title}</h3>
        <p style={styles.instructor}>{course.instructor_name}</p>
        <p style={styles.description}>
          {course.description.length > 100
            ? course.description.slice(0, 100) + '...'
            : course.description}
        </p>
        <div style={styles.meta}>
          <span>{course.total_lessons} lessons</span>
          <span>{formatDuration(course.total_duration)}</span>
        </div>
      </div>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: '#16213e',
    borderRadius: 12,
    overflow: 'hidden',
    textDecoration: 'none',
    color: '#fff',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
  },
  thumbnail: {
    width: '100%',
    height: 180,
    objectFit: 'cover',
  },
  body: {
    padding: 20,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: 700,
    marginBottom: 6,
    lineHeight: 1.3,
  },
  instructor: {
    fontSize: 13,
    color: '#e94560',
    marginBottom: 8,
    fontWeight: 500,
  },
  description: {
    fontSize: 13,
    color: '#999',
    lineHeight: 1.5,
    flex: 1,
    marginBottom: 12,
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 12,
    color: '#888',
    borderTop: '1px solid #2a2a4a',
    paddingTop: 10,
  },
};
