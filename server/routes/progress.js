const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Get progress for a course
router.get('/course/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check enrollment
    const [enrollment] = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );
    if (enrollment.length === 0) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    const [totalLessons] = await pool.query(
      'SELECT COUNT(*) AS count FROM lessons WHERE course_id = ?',
      [courseId]
    );

    const [completedLessons] = await pool.query(
      'SELECT COUNT(*) AS count FROM progress WHERE user_id = ? AND course_id = ? AND completed = TRUE',
      [userId, courseId]
    );

    const [progressRows] = await pool.query(
      'SELECT lesson_id, completed, completed_at FROM progress WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );

    // Find last watched lesson for resume functionality
    const [lastWatched] = await pool.query(`
      SELECT p.lesson_id, l.title, l.youtube_video_id
      FROM progress p
      JOIN lessons l ON l.id = p.lesson_id
      WHERE p.user_id = ? AND p.course_id = ?
      ORDER BY p.completed_at DESC
      LIMIT 1
    `, [userId, courseId]);

    const total = totalLessons[0].count;
    const completed = completedLessons[0].count;

    res.json({
      total_lessons: total,
      completed_lessons: completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      lessons: progressRows,
      last_watched: lastWatched.length > 0 ? lastWatched[0] : null,
    });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark lesson as completed
router.post('/lesson/:lessonId/complete', authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    // Get lesson info
    const [lessons] = await pool.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);
    if (lessons.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const lesson = lessons[0];

    // Check enrollment
    const [enrollment] = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, lesson.course_id]
    );
    if (enrollment.length === 0) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Upsert progress
    await pool.query(`
      INSERT INTO progress (user_id, lesson_id, course_id, completed, completed_at)
      VALUES (?, ?, ?, TRUE, NOW())
      ON DUPLICATE KEY UPDATE completed = TRUE, completed_at = NOW()
    `, [userId, lessonId, lesson.course_id]);

    // Return updated course progress
    const [totalLessons] = await pool.query(
      'SELECT COUNT(*) AS count FROM lessons WHERE course_id = ?',
      [lesson.course_id]
    );
    const [completedLessons] = await pool.query(
      'SELECT COUNT(*) AS count FROM progress WHERE user_id = ? AND course_id = ? AND completed = TRUE',
      [userId, lesson.course_id]
    );

    const total = totalLessons[0].count;
    const completed = completedLessons[0].count;

    res.json({
      message: 'Lesson marked as completed',
      total_lessons: total,
      completed_lessons: completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    });
  } catch (err) {
    console.error('Complete lesson error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get lesson data (for video player)
router.get('/lesson/:lessonId', authenticate, async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    const [lessons] = await pool.query(`
      SELECT l.*, s.title AS section_title
      FROM lessons l
      JOIN sections s ON s.id = l.section_id
      WHERE l.id = ?
    `, [lessonId]);

    if (lessons.length === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    const lesson = lessons[0];

    // Check enrollment
    const [enrollment] = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, lesson.course_id]
    );
    if (enrollment.length === 0) {
      return res.status(403).json({ message: 'Not enrolled in this course' });
    }

    // Check if completed
    const [progress] = await pool.query(
      'SELECT completed FROM progress WHERE user_id = ? AND lesson_id = ?',
      [userId, lessonId]
    );

    // Get next and previous lessons
    const [allLessons] = await pool.query(
      'SELECT id, title, order_index FROM lessons WHERE course_id = ? ORDER BY order_index',
      [lesson.course_id]
    );

    const currentIndex = allLessons.findIndex((l) => l.id === parseInt(lessonId));
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

    res.json({
      ...lesson,
      completed: progress.length > 0 ? progress[0].completed : false,
      prev_lesson: prevLesson,
      next_lesson: nextLesson,
    });
  } catch (err) {
    console.error('Get lesson error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
