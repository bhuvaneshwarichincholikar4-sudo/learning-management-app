const express = require('express');
const { pool } = require('../config/db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const [courses] = await pool.query(`
      SELECT c.*,
        COUNT(DISTINCT l.id) AS total_lessons,
        COALESCE(SUM(l.duration), 0) AS total_duration
      FROM courses c
      LEFT JOIN lessons l ON l.course_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    const parsed = courses.map((c) => ({
      ...c,
      what_you_learn: typeof c.what_you_learn === 'string' ? JSON.parse(c.what_you_learn) : c.what_you_learn,
    }));

    res.json(parsed);
  } catch (err) {
    console.error('Get courses error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single course with sections and lessons
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const courseId = req.params.id;

    const [courses] = await pool.query(`
      SELECT c.*,
        COUNT(DISTINCT l.id) AS total_lessons,
        COALESCE(SUM(l.duration), 0) AS total_duration
      FROM courses c
      LEFT JOIN lessons l ON l.course_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
    `, [courseId]);

    if (courses.length === 0) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const course = courses[0];
    course.what_you_learn = typeof course.what_you_learn === 'string'
      ? JSON.parse(course.what_you_learn) : course.what_you_learn;

    const [sections] = await pool.query(
      'SELECT * FROM sections WHERE course_id = ? ORDER BY order_index',
      [courseId]
    );

    const [lessons] = await pool.query(
      'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index',
      [courseId]
    );

    // Check enrollment if user is authenticated
    let enrolled = false;
    if (req.user) {
      const [enrollment] = await pool.query(
        'SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?',
        [req.user.id, courseId]
      );
      enrolled = enrollment.length > 0;
    }

    const sectionsWithLessons = sections.map((section) => ({
      ...section,
      lessons: lessons.filter((l) => l.section_id === section.id),
    }));

    res.json({ ...course, sections: sectionsWithLessons, enrolled });
  } catch (err) {
    console.error('Get course error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
