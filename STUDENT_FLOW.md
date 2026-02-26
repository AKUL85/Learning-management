# Student Flow - Complete API Documentation

This document outlines the complete journey of a student using the LMS platform, including every API call, functionality, and data flow.

---

## 📋 Table of Contents
1. [Authentication Phase](#authentication-phase)
2. [Home Page & Course Discovery](#home-page--course-discovery)
3. [Course Details & Interaction](#course-details--interaction)
4. [Payment & Course Purchase](#payment--course-purchase)
5. [Learning & Progress Tracking](#learning--progress-tracking)
6. [Profile & Account Management](#profile--account-management)

---

## 🔐 Authentication Phase

### 1. Sign Up (New Student)
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123",
  "fullName": "John Doe",
  "role": "learner"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "student@example.com"
  }
}
```

**What Happens:**
- User account is created in MongoDB
- User document stores email and hashed password
- Profile document is created with:
  - `fullName`: John Doe
  - `role`: learner
  - `bankBalance`: 1000.00 (starting wallet balance)
- JWT token is generated and stored in `httpOnly` cookie (expires in 7 days)
- Cookie sent to client for automatic auth on subsequent requests

---

### 2. Login (Existing Student)
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "student@example.com"
  }
}
```

**What Happens:**
- Server validates email exists
- Server verifies password hash matches
- JWT token is generated and stored in cookie
- Student is now authenticated for all protected routes

---

### 3. Get Current User Info
**Endpoint:** `GET /api/auth/me`

**Request Headers:**
```
Cookie: token=<jwt_token>
```

**Response (200 OK):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "student@example.com"
}
```

**When Used:** Verify user session on app load or refresh

---

### 4. Logout
**Endpoint:** `POST /api/auth/logout`

**Response (200 OK):**
```json
{
  "message": "Logged out"
}
```

**What Happens:**
- Cookie is cleared on client side
- User session ends

---

## 🏠 Home Page & Course Discovery

### 5. Get All Published Courses (No Auth Required)
**Endpoint:** `GET /api/courses`

**Response (200 OK):**
```json
[
  {
    "_id": "course_id_1",
    "title": "React for Beginners",
    "description": "Learn React from scratch",
    "instructor": {
      "_id": "instructor_id_1",
      "name": "Jane Smith"
    },
    "price": 49.99,
    "thumbnail": "https://cloudinary.com/...",
    "rating": 4.5,
    "reviewCount": 127,
    "enrolledCount": 342,
    "status": "published"
  },
  {
    "_id": "course_id_2",
    "title": "Advanced JavaScript",
    "description": "Master JavaScript concepts",
    "instructor": {
      "_id": "instructor_id_2",
      "name": "John Expert"
    },
    "price": 59.99,
    "thumbnail": "https://cloudinary.com/...",
    "rating": 4.8,
    "reviewCount": 245,
    "enrolledCount": 512,
    "status": "published"
  }
]
```

**When Used:** Display on home page / course listing page

**Data Shown to Student:**
- Course title, description, thumbnail
- Instructor name
- Price
- Average rating and number of reviews
- Number of enrolled students

---

## 📚 Course Details & Interaction

### 6. View Course Details
**Endpoint:** `GET /api/courses/:id`

**Example:** `GET /api/courses/course_id_1`

**Request Headers:**
```
Cookie: token=<jwt_token> (Optional - will show purchase status if logged in)
```

**Response (200 OK):**
```json
{
  "_id": "course_id_1",
  "title": "React for Beginners",
  "description": "Complete React course from basics to advanced",
  "instructor": {
    "_id": "instructor_id_1",
    "name": "Jane Smith",
    "bio": "Full-stack developer with 10 years experience",
    "avatar": "https://cloudinary.com/..."
  },
  "price": 49.99,
  "thumbnail": "https://cloudinary.com/...",
  "content": [
    {
      "sectionNumber": 1,
      "sectionTitle": "Introduction",
      "lessons": [
        {
          "lessonNumber": 1,
          "title": "What is React?",
          "duration": 15,
          "videoUrl": "https://cloudinary.com/..."
        }
      ]
    }
  ],
  "materials": [
    {
      "_id": "material_1",
      "title": "React Cheatsheet",
      "filename": "react-cheatsheet.pdf"
    }
  ],
  "reviews": [
    {
      "_id": "review_1",
      "studentName": "Mike Johnson",
      "rating": 5,
      "comment": "Excellent course!",
      "createdAt": "2025-02-20T10:30:00Z"
    }
  ],
  "questions": [
    {
      "_id": "qa_1",
      "studentName": "Sarah Lee",
      "question": "How do I set up React locally?",
      "answer": "Install Node.js and run npx create-react-app...",
      "createdAt": "2025-02-19T08:15:00Z"
    }
  ],
  "rating": 4.5,
  "reviewCount": 127,
  "enrolledCount": 342,
  "studentPurchased": true (only if logged in and purchased),
  "status": "published"
}
```

**When Used:** Display on course detail page when student clicks on a course

**For Logged-in Students:** Additional field `studentPurchased` indicates if they own this course

---

### 7. Add Review to Course
**Endpoint:** `POST /api/courses/:id/reviews`

**Authentication:** Required (JWT cookie)

**Request Body:**
```json
{
  "rating": 5,
  "comment": "This course is amazing! I learned so much!"
}
```

**Response (201 Created):**
```json
{
  "_id": "review_1",
  "courseId": "course_id_1",
  "studentId": "507f1f77bcf86cd799439011",
  "studentName": "John Doe",
  "rating": 5,
  "comment": "This course is amazing! I learned so much!",
  "createdAt": "2025-02-26T14:30:00Z"
}
```

**Validations:**
- Only authenticated students can add reviews
- Only students who purchased the course can add reviews
- Rating must be between 1-5

**When Used:** After course completion, student can leave feedback

---

### 8. Ask Question on Course
**Endpoint:** `POST /api/courses/:id/qa`

**Authentication:** Required (JWT cookie)

**Request Body:**
```json
{
  "question": "How do I deploy a React app to production?"
}
```

**Response (201 Created):**
```json
{
  "_id": "qa_1",
  "courseId": "course_id_1",
  "studentId": "507f1f77bcf86cd799439011",
  "studentName": "John Doe",
  "question": "How do I deploy a React app to production?",
  "answer": null,
  "createdAt": "2025-02-26T14:35:00Z"
}
```

**When Used:** Student wants clarification on course content

**Note:** Initially `answer` is `null`. Instructor can answer via `PUT /api/courses/:id/qa/:qaId`

---

## 💳 Payment & Course Purchase

### 9. Recharge Wallet (Add Funds)
**Endpoint:** `POST /api/transactions/recharge`

**Authentication:** Required (JWT cookie)

**Request Body:**
```json
{
  "amount": 100.00,
  "paymentMethod": "credit_card",
  "paymentId": "stripe_payment_id_xxxxx"
}
```

**Response (201 Created):**
```json
{
  "_id": "transaction_1",
  "userId": "507f1f77bcf86cd799439011",
  "type": "recharge",
  "amount": 100.00,
  "previousBalance": 1000.00,
  "newBalance": 1100.00,
  "status": "completed",
  "paymentMethod": "credit_card",
  "createdAt": "2025-02-26T14:40:00Z"
}
```

**What Happens:**
- Student's wallet balance increases
- Transaction is recorded in database
- Payment is processed through payment gateway (Stripe, etc.)

**When Used:** Student runs out of wallet balance

---

### 10. Purchase Course
**Endpoint:** `POST /api/transactions/purchase`

**Authentication:** Required (JWT cookie)

**Request Body:**
```json
{
  "courseId": "course_id_1",
  "amount": 49.99
}
```

**Response (201 Created):**
```json
{
  "_id": "transaction_1",
  "userId": "507f1f77bcf86cd799439011",
  "courseId": "course_id_1",
  "type": "purchase",
  "amount": 49.99,
  "previousBalance": 1100.00,
  "newBalance": 1050.01,
  "status": "completed",
  "createdAt": "2025-02-26T14:45:00Z"
}
```

**What Happens:**
- System checks if student has sufficient wallet balance
- Wallet balance is deducted
- Transaction record created
- Course is added to student's "My Courses" list
- Instructor receives payment notification

**Validations:**
- Student must have enough wallet balance
- Cannot purchase same course twice
- Course must be published and available

---

## 📖 Learning & Progress Tracking

### 11. Update Course Progress
**Endpoint:** `POST /api/progress/:userId/:courseId`

**Authentication:** Required (JWT cookie)

**Request Body:**
```json
{
  "currentLesson": 1,
  "currentSection": 1,
  "videoWatched": true,
  "completionPercentage": 5
}
```

**Response (200 OK):**
```json
{
  "_id": "progress_1",
  "userId": "507f1f77bcf86cd799439011",
  "courseId": "course_id_1",
  "currentLesson": 1,
  "currentSection": 1,
  "videoWatched": true,
  "completionPercentage": 5,
  "lastAccessedAt": "2025-02-26T15:00:00Z"
}
```

**What Happens:**
- Student's progress is saved as they watch videos
- System tracks:
  - Current section and lesson
  - Percentage of course completed
  - Last access time
  - Videos watched

**When Used:** Every time student completes a lesson or watches a video

---

### 12. Get All Course Progress (Student Dashboard)
**Endpoint:** `GET /api/progress/:userId/all`

**Authentication:** Required (JWT cookie)

**Example:** `GET /api/progress/507f1f77bcf86cd799439011/all`

**Response (200 OK):**
```json
[
  {
    "_id": "progress_1",
    "courseId": "course_id_1",
    "courseName": "React for Beginners",
    "thumbnail": "https://cloudinary.com/...",
    "instructor": "Jane Smith",
    "currentLesson": 5,
    "currentSection": 2,
    "completionPercentage": 25,
    "lastAccessedAt": "2025-02-26T15:00:00Z",
    "courseStatus": "completed"
  },
  {
    "_id": "progress_2",
    "courseId": "course_id_2",
    "courseName": "Advanced JavaScript",
    "thumbnail": "https://cloudinary.com/...",
    "instructor": "John Expert",
    "currentLesson": 2,
    "currentSection": 1,
    "completionPercentage": 10,
    "lastAccessedAt": "2025-02-25T10:30:00Z",
    "courseStatus": "in_progress"
  }
]
```

**When Used:** Display on student dashboard to show all enrolled courses and progress

---

### 13. Get Specific Course Progress
**Endpoint:** `GET /api/progress/:userId/:courseId`

**Authentication:** Required (JWT cookie)

**Example:** `GET /api/progress/507f1f77bcf86cd799439011/course_id_1`

**Response (200 OK):**
```json
{
  "_id": "progress_1",
  "userId": "507f1f77bcf86cd799439011",
  "courseId": "course_id_1",
  "currentLesson": 5,
  "currentSection": 2,
  "completionPercentage": 25,
  "videoWatched": ["lesson_1", "lesson_2", "lesson_3", "lesson_4", "lesson_5"],
  "quizzesTaken": [],
  "certificateEarned": false,
  "startedAt": "2025-02-20T10:00:00Z",
  "lastAccessedAt": "2025-02-26T15:00:00Z"
}
```

**When Used:** Display progress details on course detail page for courses student is taking

---

### 14. Download Course Material
**Endpoint:** `GET /api/courses/materials/:filename/download`

**Authentication:** Required (JWT cookie)

**Example:** `GET /api/courses/materials/react-cheatsheet.pdf/download`

**Response:** PDF file binary data

**What Happens:**
- Server verifies student purchased the course
- File is downloaded from server storage
- Download is logged in progress tracking

**When Used:** Student wants to download study materials, PDFs, or resources from course

---

### 15. Get Certificate
**Endpoint:** `GET /api/progress/:userId/:courseId/certificate`

**Authentication:** Required (JWT cookie)

**Example:** `GET /api/progress/507f1f77bcf86cd799439011/course_id_1/certificate`

**Conditions to Earn Certificate:**
- Course completion percentage >= 80%
- All required quizzes passed
- Student has not received certificate before

**Response (200 OK):**
```json
{
  "_id": "certificate_1",
  "userId": "507f1f77bcf86cd799439011",
  "studentName": "John Doe",
  "courseId": "course_id_1",
  "courseName": "React for Beginners",
  "instructorName": "Jane Smith",
  "completionDate": "2025-02-26T16:00:00Z",
  "certificateNumber": "CERT-2025-12345",
  "certificateUrl": "https://cloudinary.com/certificates/..."
}
```

**When Used:** After completing course, student can view certificate

---

## 👤 Profile & Account Management

### 16. Get Student Profile
**Endpoint:** `GET /api/profile/:userId`

**Authentication:** Optional (works with or without login)

**Example:** `GET /api/profile/507f1f77bcf86cd799439011`

**Response (200 OK):**
```json
{
  "_id": "profile_1",
  "user": "507f1f77bcf86cd799439011",
  "fullName": "John Doe",
  "role": "learner",
  "email": "student@example.com",
  "bio": "Enthusiastic learner passionate about web development",
  "avatar": "https://cloudinary.com/avatars/...",
  "bankBalance": 1050.01,
  "coursesPurchased": 5,
  "coursesCompleted": 2,
  "averageRating": 4.5,
  "totalReviews": 8,
  "joinedAt": "2025-01-15T10:00:00Z"
}
```

**When Used:** Display on profile page

---

### 17. Update Student Profile
**Endpoint:** `PUT /api/profile/:userId`

**Authentication:** Required (JWT cookie)

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "bio": "Updated bio - Learning web development",
  "avatar": "https://cloudinary.com/new-avatar.jpg"
}
```

**Response (200 OK):**
```json
{
  "_id": "profile_1",
  "user": "507f1f77bcf86cd799439011",
  "fullName": "John Doe Updated",
  "role": "learner",
  "email": "student@example.com",
  "bio": "Updated bio - Learning web development",
  "avatar": "https://cloudinary.com/new-avatar.jpg",
  "bankBalance": 1050.01,
  "coursesPurchased": 5,
  "coursesCompleted": 2,
  "averageRating": 4.5,
  "totalReviews": 8,
  "joinedAt": "2025-01-15T10:00:00Z"
}
```

**When Used:** Student updates profile information, changes avatar, or updates bio

---

## 🔄 Complete Student Journey Timeline

```
┌─────────────────────────────────────────────────────────────────┐
│                     STUDENT JOURNEY FLOW                        │
└─────────────────────────────────────────────────────────────────┘

1. REGISTRATION
   └─ POST /api/auth/signup
      └─ Creates User & Profile
      └─ Sets JWT token in cookie
      └─ Initial wallet balance: $1000

2. HOME PAGE
   └─ GET /api/courses (Public)
      └─ Browse all published courses
      └─ View course basic info

3. COURSE DISCOVERY
   └─ GET /api/courses/:id (Optional Auth)
      └─ View full course details
      └─ See reviews and Q&A
      └─ View instructor info

4. PRE-PURCHASE INTERACTION
   └─ POST /api/courses/:id/reviews (if owner)
   └─ POST /api/courses/:id/qa (ask questions)

5. WALLET MANAGEMENT
   ├─ GET /api/profile/:userId (check balance)
   └─ POST /api/transactions/recharge (if needed)

6. COURSE PURCHASE
   └─ POST /api/transactions/purchase
      └─ Wallet deducted
      └─ Course added to student's library

7. LEARNING PHASE
   ├─ GET /api/progress/:userId/:courseId (track progress)
   ├─ POST /api/progress/:userId/:courseId (update viewing)
   ├─ GET /api/courses/materials/:filename/download
   └─ Multiple POST updates as student watches videos

8. ENGAGEMENT
   ├─ POST /api/courses/:id/reviews (post review)
   └─ POST /api/courses/:id/qa (ask questions)

9. COMPLETION
   ├─ POST /api/progress/:userId/:courseId (final update)
   ├─ GET /api/progress/:userId/:courseId/certificate (earn)
   └─ GET /api/progress/:userId/all (view all progress)

10. DASHBOARD
    └─ GET /api/progress/:userId/all
       └─ View all courses and progress
       └─ Resume learning

11. PROFILE MANAGEMENT
    ├─ GET /api/profile/:userId (view profile)
    └─ PUT /api/profile/:userId (update profile)

12. LOGOUT
    └─ POST /api/auth/logout
       └─ Clear token cookie
```

---

## 🔒 Authentication & Security

### Cookie-Based Authentication
- JWT token stored in **httpOnly** cookie (prevents XSS attacks)
- Token expires in 7 days
- `secure` flag set in production (HTTPS only)
- `sameSite: 'lax'` prevents CSRF attacks

### Protected Routes
Routes requiring authentication:
- `POST /api/auth/logout`
- `POST /api/courses` (create course - instructors only)
- `PUT /api/courses/:id` (update course - instructors only)
- `PATCH /api/courses/:id` (partial update - instructors only)
- `DELETE /api/courses/:id` (delete course - instructors only)
- `GET /api/courses/materials/:filename/download` (download materials)
- `POST /api/courses/:id/reviews` (add review)
- `POST /api/courses/:id/qa` (ask question)
- `PUT /api/courses/:id/qa/:qaId` (answer question)
- `GET /api/progress/*` (all progress endpoints)
- `POST /api/progress/*` (update progress)
- `POST /api/transactions/*` (recharge and purchase)
- `GET /api/profile/:userId` (if updated recently)
- `PUT /api/profile/:userId` (update profile)

### Optional Authentication
- `GET /api/courses/:id` (works with or without token)
  - If user is logged in: shows `studentPurchased` flag
  - If not logged in: shows basic course info

---

## 📊 Database Models Involved

### User Model
```
{
  email: String (unique),
  passwordHash: String,
  createdAt: Date
}
```

### Profile Model
```
{
  user: ObjectId (ref: User),
  fullName: String,
  role: String (learner/instructor),
  bio: String,
  avatar: String,
  bankBalance: Number,
  coursesPurchased: Number,
  coursesCompleted: Number
}
```

### Course Model
```
{
  title: String,
  description: String,
  instructor: ObjectId,
  price: Number,
  thumbnail: String,
  content: [{section, lessons}],
  materials: [{filename, title}],
  reviews: [{rating, comment, studentId}],
  questions: [{question, answer, studentId}],
  status: String (published/draft),
  enrolledStudents: [ObjectId]
}
```

### CourseProgress Model
```
{
  userId: ObjectId,
  courseId: ObjectId,
  currentLesson: Number,
  currentSection: Number,
  completionPercentage: Number,
  videoWatched: [ObjectId],
  certificateEarned: Boolean
}
```

### Transaction Model
```
{
  userId: ObjectId,
  courseId: ObjectId (for purchases),
  type: String (recharge/purchase),
  amount: Number,
  previousBalance: Number,
  newBalance: Number,
  status: String (pending/completed)
}
```

---

## 🚨 Error Handling

### Common HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Resource successfully created |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid credentials / No token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Course or user doesn't exist |
| 409 | Conflict | Email already registered |
| 500 | Server Error | Database or server error |

### Error Response Format
```json
{
  "message": "Error description"
}
```

---

## 📝 Summary of All API Endpoints Used by Students

| Method | Endpoint | Auth Required | Purpose |
|--------|----------|----------------|---------|
| POST | `/api/auth/signup` | No | Register new account |
| POST | `/api/auth/login` | No | Login to account |
| GET | `/api/auth/me` | Yes | Get current user |
| POST | `/api/auth/logout` | Yes | Logout |
| GET | `/api/courses` | No | Browse courses |
| GET | `/api/courses/:id` | Optional | View course details |
| POST | `/api/courses/:id/reviews` | Yes | Add course review |
| POST | `/api/courses/:id/qa` | Yes | Ask question |
| POST | `/api/transactions/recharge` | Yes | Add wallet funds |
| POST | `/api/transactions/purchase` | Yes | Purchase course |
| GET | `/api/progress/:userId/all` | Yes | View all progress |
| GET | `/api/progress/:userId/:courseId` | Yes | View course progress |
| POST | `/api/progress/:userId/:courseId` | Yes | Track progress |
| GET | `/api/progress/:userId/:courseId/certificate` | Yes | Get certificate |
| GET | `/api/courses/materials/:filename/download` | Yes | Download materials |
| GET | `/api/profile/:userId` | Optional | View profile |
| PUT | `/api/profile/:userId` | Yes | Update profile |

**Total Student API Endpoints: 17**

---

Last Updated: February 26, 2026
