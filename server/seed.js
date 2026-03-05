const bcrypt = require('bcryptjs');
require('dotenv').config();
const { pool, initializeDatabase } = require('./config/db');

async function seed() {
  await initializeDatabase();
  const conn = await pool.getConnection();
  try {
    console.log('Seeding database...');

    // Create demo student
    const hashedPassword = await bcrypt.hash('password123', 10);
    await conn.query(`
      INSERT IGNORE INTO users (name, email, password, role)
      VALUES ('Demo Student', 'student@demo.com', ?, 'student')
    `, [hashedPassword]);

    // Create courses
    const courses = [
      {
        title: 'Java Programming Masterclass',
        description: 'Learn Java from scratch to advanced level. This comprehensive course covers core Java, OOP concepts, collections, multithreading, and more. Perfect for beginners who want to become professional Java developers.',
        thumbnail: 'https://img.youtube.com/vi/eIrMbAQSU34/maxresdefault.jpg',
        instructor_name: 'Tim Buchalka',
        what_you_learn: JSON.stringify([
          'Core Java fundamentals and syntax',
          'Object-Oriented Programming concepts',
          'Collections framework and generics',
          'Exception handling and file I/O',
          'Multithreading and concurrency',
          'Lambda expressions and streams'
        ]),
      },
      {
        title: 'Python for Beginners',
        description: 'A beginner-friendly Python course that takes you from zero to hero. Learn Python programming with hands-on projects including web scraping, automation, and data analysis.',
        thumbnail: 'https://img.youtube.com/vi/kqtD5dpn9C8/maxresdefault.jpg',
        instructor_name: 'Mosh Hamedani',
        what_you_learn: JSON.stringify([
          'Python basics and data types',
          'Control flow and functions',
          'Working with files and APIs',
          'Object-oriented programming in Python',
          'Web scraping with BeautifulSoup',
          'Automation scripts'
        ]),
      },
      {
        title: 'Machine Learning A-Z',
        description: 'Master Machine Learning with Python and R. Learn to create ML algorithms from scratch and apply them to real-world problems including regression, classification, clustering, and deep learning.',
        thumbnail: 'https://img.youtube.com/vi/GwIo3gDZCVQ/maxresdefault.jpg',
        instructor_name: 'Kirill Eremenko',
        what_you_learn: JSON.stringify([
          'Data preprocessing techniques',
          'Regression models (Linear, Polynomial, SVR)',
          'Classification algorithms (SVM, KNN, Random Forest)',
          'Clustering techniques (K-Means, Hierarchical)',
          'Deep Learning and Neural Networks',
          'Model evaluation and selection'
        ]),
      },
      {
        title: 'React - The Complete Guide',
        description: 'Dive into React.js and learn how to build powerful, modern web applications. Covers hooks, context, Redux, routing, Next.js, and more with hands-on projects.',
        thumbnail: 'https://img.youtube.com/vi/Ke90Tje7VS0/maxresdefault.jpg',
        instructor_name: 'Maximilian Schwarzmuller',
        what_you_learn: JSON.stringify([
          'React fundamentals and JSX',
          'Components, props, and state management',
          'React Hooks in depth',
          'Context API and Redux',
          'React Router for navigation',
          'Building and deploying React apps'
        ]),
      },
    ];

    for (const course of courses) {
      const [existing] = await conn.query('SELECT id FROM courses WHERE title = ?', [course.title]);
      if (existing.length > 0) continue;

      const [result] = await conn.query(
        'INSERT INTO courses (title, description, thumbnail, instructor_name, what_you_learn) VALUES (?, ?, ?, ?, ?)',
        [course.title, course.description, course.thumbnail, course.instructor_name, course.what_you_learn]
      );
      const courseId = result.insertId;
      console.log(`Created course: ${course.title} (ID: ${courseId})`);
    }

    // Get course IDs
    const [allCourses] = await conn.query('SELECT id, title FROM courses ORDER BY id');
    const courseMap = {};
    for (const c of allCourses) {
      courseMap[c.title] = c.id;
    }

    // Sections and lessons for Java course
    const javaId = courseMap['Java Programming Masterclass'];
    if (javaId) {
      const javaSections = [
        {
          title: 'Getting Started with Java',
          order_index: 0,
          lessons: [
            { title: 'Introduction to Java', youtube_video_id: 'eIrMbAQSU34', duration: 600, order_index: 0 },
            { title: 'Setting Up Your Environment', youtube_video_id: 'GoXwIVyNvX0', duration: 720, order_index: 1 },
            { title: 'Your First Java Program', youtube_video_id: 'czrjQ3KZjWo', duration: 540, order_index: 2 },
          ],
        },
        {
          title: 'Java Fundamentals',
          order_index: 1,
          lessons: [
            { title: 'Variables and Data Types', youtube_video_id: 'so1iUBXjHng', duration: 900, order_index: 3 },
            { title: 'Operators and Expressions', youtube_video_id: 'VPmDHGMl7OM', duration: 660, order_index: 4 },
            { title: 'Control Flow Statements', youtube_video_id: 'ldYLYRNaucM', duration: 840, order_index: 5 },
          ],
        },
        {
          title: 'Object-Oriented Programming',
          order_index: 2,
          lessons: [
            { title: 'Classes and Objects', youtube_video_id: 'IUqKuGNasdM', duration: 780, order_index: 6 },
            { title: 'Inheritance and Polymorphism', youtube_video_id: '3v4d4vOGKxI', duration: 900, order_index: 7 },
          ],
        },
      ];
      await insertSectionsAndLessons(conn, javaId, javaSections);
    }

    // Sections and lessons for Python course
    const pythonId = courseMap['Python for Beginners'];
    if (pythonId) {
      const pythonSections = [
        {
          title: 'Python Basics',
          order_index: 0,
          lessons: [
            { title: 'What is Python?', youtube_video_id: 'kqtD5dpn9C8', duration: 600, order_index: 0 },
            { title: 'Installing Python', youtube_video_id: 'YYXdXT2l-Gg', duration: 480, order_index: 1 },
            { title: 'Variables and Strings', youtube_video_id: 'cQT33yu9pY8', duration: 720, order_index: 2 },
          ],
        },
        {
          title: 'Control Flow',
          order_index: 1,
          lessons: [
            { title: 'If Statements', youtube_video_id: 'FvMPfrgGeKs', duration: 600, order_index: 3 },
            { title: 'Loops in Python', youtube_video_id: '94UHCEmprCY', duration: 780, order_index: 4 },
            { title: 'Functions', youtube_video_id: '9Os0o3wzS_I', duration: 840, order_index: 5 },
          ],
        },
        {
          title: 'Advanced Topics',
          order_index: 2,
          lessons: [
            { title: 'Working with Files', youtube_video_id: 'Uh2ebFW8OYM', duration: 660, order_index: 6 },
            { title: 'Error Handling', youtube_video_id: 'nlCKrKGHSSk', duration: 540, order_index: 7 },
          ],
        },
      ];
      await insertSectionsAndLessons(conn, pythonId, pythonSections);
    }

    // Sections and lessons for ML course
    const mlId = courseMap['Machine Learning A-Z'];
    if (mlId) {
      const mlSections = [
        {
          title: 'Introduction to ML',
          order_index: 0,
          lessons: [
            { title: 'What is Machine Learning?', youtube_video_id: 'GwIo3gDZCVQ', duration: 720, order_index: 0 },
            { title: 'Types of Machine Learning', youtube_video_id: 'xtOg44r6dsE', duration: 600, order_index: 1 },
            { title: 'Setting Up Python for ML', youtube_video_id: 'WbDQXFMadm0', duration: 540, order_index: 2 },
          ],
        },
        {
          title: 'Regression',
          order_index: 1,
          lessons: [
            { title: 'Simple Linear Regression', youtube_video_id: 'nk2CQITm_eo', duration: 900, order_index: 3 },
            { title: 'Multiple Linear Regression', youtube_video_id: 'zITIFTsivN8', duration: 840, order_index: 4 },
          ],
        },
        {
          title: 'Classification',
          order_index: 2,
          lessons: [
            { title: 'Logistic Regression', youtube_video_id: 'yIYKR4sgzI8', duration: 780, order_index: 5 },
            { title: 'K-Nearest Neighbors', youtube_video_id: 'HVXime0nQeI', duration: 660, order_index: 6 },
          ],
        },
      ];
      await insertSectionsAndLessons(conn, mlId, mlSections);
    }

    // Sections and lessons for React course
    const reactId = courseMap['React - The Complete Guide'];
    if (reactId) {
      const reactSections = [
        {
          title: 'React Fundamentals',
          order_index: 0,
          lessons: [
            { title: 'What is React?', youtube_video_id: 'Ke90Tje7VS0', duration: 600, order_index: 0 },
            { title: 'Setting Up a React Project', youtube_video_id: 'bMknfKXIFA8', duration: 720, order_index: 1 },
            { title: 'JSX and Components', youtube_video_id: 'Rh3tobg7hEo', duration: 840, order_index: 2 },
          ],
        },
        {
          title: 'State and Props',
          order_index: 1,
          lessons: [
            { title: 'Understanding State', youtube_video_id: 'O6P86uwfdR0', duration: 780, order_index: 3 },
            { title: 'Props and Data Flow', youtube_video_id: 'PHaECbrKgs0', duration: 660, order_index: 4 },
            { title: 'React Hooks', youtube_video_id: 'TNhaISOUy6Q', duration: 900, order_index: 5 },
          ],
        },
        {
          title: 'Advanced React',
          order_index: 2,
          lessons: [
            { title: 'Context API', youtube_video_id: '35lXWvCuM8o', duration: 720, order_index: 6 },
            { title: 'React Router', youtube_video_id: 'Law7wfdg_ls', duration: 840, order_index: 7 },
          ],
        },
      ];
      await insertSectionsAndLessons(conn, reactId, reactSections);
    }

    console.log('Seeding completed successfully!');
    console.log('Demo credentials: student@demo.com / password123');
  } finally {
    conn.release();
    process.exit(0);
  }
}

async function insertSectionsAndLessons(conn, courseId, sections) {
  for (const section of sections) {
    const [existingSection] = await conn.query(
      'SELECT id FROM sections WHERE course_id = ? AND title = ?',
      [courseId, section.title]
    );

    let sectionId;
    if (existingSection.length > 0) {
      sectionId = existingSection[0].id;
    } else {
      const [result] = await conn.query(
        'INSERT INTO sections (course_id, title, order_index) VALUES (?, ?, ?)',
        [courseId, section.title, section.order_index]
      );
      sectionId = result.insertId;
    }

    for (const lesson of section.lessons) {
      const [existingLesson] = await conn.query(
        'SELECT id FROM lessons WHERE section_id = ? AND title = ?',
        [sectionId, lesson.title]
      );
      if (existingLesson.length > 0) continue;

      await conn.query(
        'INSERT INTO lessons (section_id, course_id, title, youtube_video_id, duration, order_index) VALUES (?, ?, ?, ?, ?, ?)',
        [sectionId, courseId, lesson.title, lesson.youtube_video_id, lesson.duration, lesson.order_index]
      );
    }
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
