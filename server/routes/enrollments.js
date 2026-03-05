const express = require('express');
const { pool } = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Enroll in a course
router.post('/:courseId', authenticate, async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const [course] = await pool.query('SELECT id FROM courses WHERE id = ?', [courseId]);
    if (course.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const [existing] = await pool.query(
      'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
      [userId, courseId]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: 'Already enrolled' });
    }

    await pool.query(
      'INSERT INTO enrollments (user_id, course_id) VALUES (?, ?)',
      [userId, courseId]
    );

    res.status(201).json({ message: 'Enrolled successfully' });
  } catch (err) {
    console.error('Enroll error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's enrollments
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const [enrollments] = await pool.query(`
      SELECT e.*, c.title, c.thumbnail, c.instructor_name, c.description,
        COUNT(DISTINCT l.id) AS total_lessons,
        COUNT(DISTINCT CASE WHEN p.completed = TRUE THEN p.id END) AS completed_lessons
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      LEFT JOIN lessons l ON l.course_id = c.id
      LEFT JOIN progress p ON p.lesson_id = l.id AND p.user_id = e.user_id
      WHERE e.user_id = ?
      GROUP BY e.id
      ORDER BY e.enrolled_at DESC
    `, [userId]);

    const result = enrollments.map((e) => ({
      ...e,
      progress_percentage: e.total_lessons > 0
        ? Math.round((e.completed_lessons / e.total_lessons) * 100) : 0,
    }));

    res.json(result);
  } catch (err) {
    console.error('Get enrollments error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
