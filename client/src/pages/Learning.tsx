import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import type { CourseDetail, CourseProgress, Lesson } from '../types';

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  return `${mins} min`;
}

export default function Learning() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const allLessons: Lesson[] = course
    ? course.sections.flatMap((s) => s.lessons)
    : [];

  const completedLessonIds = new Set(
    (progress?.lessons || []).filter((l) => l.completed).map((l) => l.lesson_id)
  );

  const loadData = useCallback(async () => {
    try {
      const [courseRes, progressRes, lessonRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/progress/course/${courseId}`),
        api.get(`/progress/lesson/${lessonId}`),
      ]);
      setCourse(courseRes.data);
      setProgress(progressRes.data);
      setCurrentLesson(lessonRes.data);
    } catch (err) {
      console.error('Failed to load learning data:', err);
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  const markComplete = async () => {
    if (!lessonId) return;
    try {
      const res = await api.post(`/progress/lesson/${lessonId}/complete`);
      setProgress((prev) =>
        prev
          ? {
              ...prev,
              completed_lessons: res.data.completed_lessons,
              percentage: res.data.percentage,
              lessons: [
                ...prev.lessons.filter((l) => l.lesson_id !== parseInt(lessonId)),
                { lesson_id: parseInt(lessonId), completed: true, completed_at: new Date().toISOString() },
              ],
            }
          : prev
      );
      setCurrentLesson((prev) => (prev ? { ...prev, completed: true } : prev));
    } catch (err) {
      console.error('Failed to mark complete:', err);
    }
  };

  const goToLesson = (id: number) => {
    navigate(`/learn/${courseId}/${id}`);
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!course || !currentLesson) return <div style={styles.loading}>Content not available</div>;

  const currentIndex = allLessons.findIndex((l) => l.id === parseInt(lessonId!));
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div style={styles.container}>
      {/* Video Player Area */}
      <div style={styles.mainArea}>
        <div style={styles.videoWrapper}>
          <iframe
            key={currentLesson.youtube_video_id}
            src={`https://www.youtube.com/embed/${currentLesson.youtube_video_id}?rel=0`}
            title={currentLesson.title}
            style={styles.iframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div style={styles.videoInfo}>
          <h2 style={styles.lessonTitleMain}>{currentLesson.title}</h2>
          <p style={styles.sectionLabel}>{currentLesson.section_title}</p>

          <div style={styles.actions}>
            {!currentLesson.completed ? (
              <button onClick={markComplete} style={styles.completeBtn}>
                Mark as Completed
              </button>
            ) : (
              <span style={styles.completedBadge}>Completed</span>
            )}
          </div>

          <div style={styles.navButtons}>
            <button
              onClick={() => prevLesson && goToLesson(prevLesson.id)}
              disabled={!prevLesson}
              style={{
                ...styles.navBtn,
                opacity: prevLesson ? 1 : 0.4,
                cursor: prevLesson ? 'pointer' : 'default',
              }}
            >
              Previous
            </button>
            <button
              onClick={() => nextLesson && goToLesson(nextLesson.id)}
              disabled={!nextLesson}
              style={{
                ...styles.navBtn,
                ...styles.navBtnNext,
                opacity: nextLesson ? 1 : 0.4,
                cursor: nextLesson ? 'pointer' : 'default',
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.progressSection}>
          <h3 style={styles.sidebarTitle}>{course.title}</h3>
          <div style={styles.progressBarOuter}>
            <div
              style={{
                ...styles.progressBarInner,
                width: `${progress?.percentage || 0}%`,
              }}
            />
          </div>
          <p style={styles.progressText}>
            {progress?.completed_lessons || 0} / {progress?.total_lessons || 0} lessons ({progress?.percentage || 0}%)
          </p>
        </div>

        <div style={styles.lessonList}>
          {course.sections.map((section) => (
            <div key={section.id}>
              <h4 style={styles.sidebarSectionTitle}>{section.title}</h4>
              {section.lessons.map((lesson) => {
                const isActive = lesson.id === parseInt(lessonId!);
                const isCompleted = completedLessonIds.has(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    onClick={() => goToLesson(lesson.id)}
                    style={{
                      ...styles.lessonItem,
                      background: isActive ? '#0f3460' : 'transparent',
                      borderLeft: isActive ? '3px solid #e94560' : '3px solid transparent',
                    }}
                  >
                    <span style={{
                      ...styles.lessonStatus,
                      color: isCompleted ? '#4caf50' : '#555',
                    }}>
                      {isCompleted ? '\u2713' : '\u25CB'}
                    </span>
                    <span style={{
                      ...styles.lessonName,
                      color: isActive ? '#fff' : isCompleted ? '#888' : '#ccc',
                    }}>
                      {lesson.title}
                    </span>
                    <span style={styles.lessonDur}>{formatDuration(lesson.duration)}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: 'calc(100vh - 64px)',
    gap: 0,
  },
  loading: {
    color: '#888',
    textAlign: 'center',
    padding: 80,
    fontSize: 16,
  },
  mainArea: {
    flex: 1,
    padding: 0,
    overflow: 'auto',
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '56.25%',
    background: '#000',
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  videoInfo: {
    padding: '24px 32px',
  },
  lessonTitleMain: {
    fontSize: 22,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 13,
    color: '#888',
    marginBottom: 20,
  },
  actions: {
    marginBottom: 20,
  },
  completeBtn: {
    padding: '10px 24px',
    background: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  completedBadge: {
    display: 'inline-block',
    padding: '8px 20px',
    background: '#1b5e20',
    color: '#4caf50',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 600,
  },
  navButtons: {
    display: 'flex',
    gap: 12,
  },
  navBtn: {
    padding: '10px 24px',
    background: '#16213e',
    color: '#ccc',
    border: '1px solid #2a2a4a',
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  navBtnNext: {
    background: '#e94560',
    color: '#fff',
    border: 'none',
  },
  sidebar: {
    width: 340,
    background: '#16213e',
    borderLeft: '1px solid #2a2a4a',
    overflow: 'auto',
    flexShrink: 0,
    maxHeight: 'calc(100vh - 64px)',
  },
  progressSection: {
    padding: '20px 20px 16px',
    borderBottom: '1px solid #2a2a4a',
  },
  sidebarTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: '#fff',
    marginBottom: 12,
    lineHeight: 1.3,
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
  },
  lessonList: {
    padding: '8px 0',
  },
  sidebarSectionTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: '#e94560',
    padding: '12px 20px 6px',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lessonItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 20px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  lessonStatus: {
    fontSize: 14,
    flexShrink: 0,
    width: 18,
    textAlign: 'center',
  },
  lessonName: {
    fontSize: 13,
    flex: 1,
    lineHeight: 1.3,
  },
  lessonDur: {
    fontSize: 11,
    color: '#555',
    flexShrink: 0,
  },
};
