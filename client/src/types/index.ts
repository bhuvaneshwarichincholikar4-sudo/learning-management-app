export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail: string;
  instructor_name: string;
  what_you_learn: string[];
  total_lessons: number;
  total_duration: number;
  created_at: string;
}

export interface Section {
  id: number;
  course_id: number;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  section_id: number;
  course_id: number;
  title: string;
  youtube_video_id: string;
  duration: number;
  order_index: number;
  section_title?: string;
  completed?: boolean;
  prev_lesson?: { id: number; title: string } | null;
  next_lesson?: { id: number; title: string } | null;
}

export interface CourseDetail extends Course {
  sections: Section[];
  enrolled: boolean;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  title: string;
  thumbnail: string;
  instructor_name: string;
  description: string;
  total_lessons: number;
  completed_lessons: number;
  progress_percentage: number;
  enrolled_at: string;
}

export interface CourseProgress {
  total_lessons: number;
  completed_lessons: number;
  percentage: number;
  lessons: { lesson_id: number; completed: boolean; completed_at: string }[];
  last_watched: { lesson_id: number; title: string; youtube_video_id: string } | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}
