# LMS API Documentation

This document provides a comprehensive reference for the LMS application's API endpoints.

## Base URL
`/api`

---

## Authentication

### POST /api/auth/signup
**Purpose**: Register a new user and create their profile.

**Frontend Source**: 
- File: `src/context/AuthContext.jsx`
- Function: `signup` (Action: Form Submit)

**Backend Mapping**:
- Route: `routes/auth.js` -> `router.post('/signup', ...)`
- Controller: `controllers/authController.js` -> `signup`

**Request Details**:
- Body: 
  - `email` (string, required)
  - `password` (string, required)
  - `fullName` (string, required)
  - `role` (string, required: 'student' | 'instructor')

**Response Details**:
- Success (201): `{ user: { _id, email } }` + HTTP-only cookie `token`
- Error (400): `{ message: 'Missing required fields' }`
- Error (409): `{ message: 'Email already in use' }`

**Database Interaction**:
- `User`: Create new user.
- `Profile`: Create associated profile with initial bank balance.

---

### POST /api/auth/login
**Purpose**: Authenticate a user and issue a JWT token.

**Frontend Source**:
- File: `src/context/AuthContext.jsx`
- Function: `login` (Action: Form Submit)

**Backend Mapping**:
- Route: `routes/auth.js` -> `router.post('/login', ...)`
- Controller: `controllers/authController.js` -> `login`

**Request Details**:
- Body: `email`, `password`

**Response Details**:
- Success (200): `{ user: { _id, email } }` + HTTP-only cookie `token`
- Error (401): `{ message: 'Invalid credentials' }`

**Database Interaction**:
- `User`: Find user by email, verify password.

---

### POST /api/auth/logout
**Purpose**: Log out the current user by clearing the auth cookie.

**Frontend Source**:
- File: `src/context/AuthContext.jsx`
- Function: `logout` (Action: Button Click)

**Backend Mapping**:
- Route: `routes/auth.js` -> `router.post('/logout', ...)`
- Controller: `controllers/authController.js` -> `logout`

**Response Details**:
- Success (200): `{ message: 'Logged out' }`

---

### GET /api/auth/me
**Purpose**: Retrieve current authenticated user using the cookie token.

**Frontend Source**:
- File: `src/context/AuthContext.jsx`
- Function: `checkUserLoggedIn` (Action: Page Load)

**Backend Mapping**:
- Route: `routes/auth.js` -> `router.get('/me', ...)`
- Controller: `controllers/authController.js` -> `me`

**Response Details**:
- Success (200): `{ user: { ... } }` or `{ user: null }` if invalid/missing token.

---

## Profile

### GET /api/profile/:userId
**Purpose**: Fetch public profile details of a user.

**Frontend Source**:
- File: `src/pages/ProfilePage.jsx`
- Function: `useEffect` (Action: Page Load)

**Backend Mapping**:
- Route: `routes/profile.js` -> `router.get('/:userId', ...)`
- Controller: `controllers/profileController.js` -> `getProfile`

**Response Details**:
- Success (200): `{ profile: { ... } }`

**Database Interaction**:
- `Profile`: Find one by `user` ID.

### PUT /api/profile/:userId
**Purpose**: Update user profile information.

**Frontend Source**:
- File: `src/pages/ProfilePage.jsx`
- Function: `handleUpdate` (Action: Form Submit)

**Backend Mapping**:
- Route: `routes/profile.js` -> `router.put('/:userId', ...)`
- Controller: `controllers/profileController.js` -> `updateProfile`

**Request Details**:
- Body: Fields to update (e.g., `fullName`, `bio`, etc.)

**Response Details**:
- Success (200): `{ profile: { ... } }`

---

## Courses

### GET /api/courses
**Purpose**: Get a list of all approved/published courses.

**Frontend Source**:
- File: `src/pages/HomePage.jsx`
- Function: `fetchCourses` (Action: Page Load)

**Backend Mapping**:
- Route: `routes/course.js` -> `router.get('/', ...)`
- Controller: `controllers/courseController.js` -> `getPublishedCourses`

**Response Details**:
- Success (200): `{ courses: [...] }`

**Database Interaction**:
- `Course`: Find where `status: 'approved'`.

### POST /api/courses
**Purpose**: Create a new course (Instructor only).

**Frontend Source**:
- File: `src/pages/InstructorDashboard.jsx` (via `CreateCourseModal`)
- Function: `createCourse` (Action: Form Submit)

**Backend Mapping**:
- Route: `routes/course.js` -> `router.post('/', ...)`
- Controller: `controllers/courseController.js` -> `createCourse`
- Middleware: `auth`, `uploadCourseFiles`

**Request Details**:
- Form Data: `title`, `description`, `price`, `image` (file), `video` (file), `materials` (files), `mcqs` (json), `cqs` (json)

**Response Details**:
- Success (201): `{ ...courseData }`
- Error (403): If user is not instructor.

**Database Interaction**:
- `Course`: Create new document.
- `Transaction`: create reward transaction.
- `Profile`: Update instructor balance.

### GET /api/courses/:id
**Purpose**: Get details of a specific course.

**Frontend Source**:
- File: `src/pages/CourseDetailPage.jsx`
- Function: `fetchCourse` (Action: Page Load)

**Backend Mapping**:
- Route: `routes/course.js` -> `router.get('/:id', ...)`
- Controller: `controllers/courseController.js` -> `getCourseById`
- Middleware: `optionalAuth`

**Response Details**:
- Success (200): `{ course: {...}, instructorStats: {...} }`
- Note: Hides content materials/videos if user checks fail (not enrolled/admin/owner).

### PUT /api/courses/:id
**Purpose**: Full update of a course.

**Frontend Source**:
- File: `src/pages/EditCoursePage.jsx`
- Function: `handleUpdate` (Action: Form Submit)

**Backend Mapping**:
- Route: `routes/course.js` -> `router.put('/:id', ...)`
- Controller: `controllers/courseController.js` -> `handleCourseUpdate`

### DELETE /api/courses/:id
**Purpose**: Delete a course.

**Frontend Source**:
- File: `src/pages/InstructorDashboard.jsx`
- Function: `handleDeleteCourse` (Action: Button Click)

**Backend Mapping**:
- Route: `routes/course.js` -> `router.delete('/:id', ...)`
- Controller: `controllers/courseController.js` -> `deleteCourse`

---

## Instructor

### GET /api/instructor/dashboard
**Purpose**: Get instructor's courses and transaction history.

**Frontend Source**:
- File: `src/pages/InstructorDashboard.jsx`
- Function: `fetchData` (Action: Page Load)

**Backend Mapping**:
- Route: `routes/instructor.js` -> `router.get('/dashboard', ...)`
- Controller: `controllers/instructorController.js` -> `getDashboard`
- Middleware: `auth`

**Response Details**:
- Success (200): `{ profile, courses, transactions }`

### GET /api/instructor/transactions/pending
**Purpose**: Get transactions waiting for validation.

**Frontend Source**:
- File: `src/pages/InstructorDashboard.jsx` (implicitly via dashboard fetch or separate component)
- Backend Route logic separation suggests it can be called independently.

**Backend Mapping**:
- Route: `routes/instructor.js` -> `router.get('/transactions/pending', ...)`
- Controller: `controllers/instructorController.js` -> `getPendingTransactions`

### POST /api/instructor/transaction/:id/validate
**Purpose**: Validate a pending transaction (e.g. claim reward).

**Frontend Source**:
- File: `src/pages/InstructorDashboard.jsx`
- Function: `validateTransaction` (Action: Button Click)

**Backend Mapping**:
- Route: `routes/instructor.js` -> `router.post('/transaction/:id/validate', ...)`
- Controller: `controllers/instructorController.js` -> `validateTransaction`

---

## Transactions

### POST /api/transactions/recharge
**Purpose**: Top up user wallet.

**Frontend Source**:
- File: `src/components/profile/WalletModal.jsx`
- Function: `handleRecharge` (Action: Form Submit)

**Backend Mapping**:
- Route: `routes/transaction.js` -> `router.post('/recharge', ...)`
- Controller: `controllers/transactionController.js` -> `rechargeWallet`

**Request Details**:
- Body: `userId`, `amount`

---

### POST /api/transactions/purchase
**Purpose**: Purchase a course.

**Frontend Source**:
- File: `src/pages/CourseDetailPage.jsx`
- Function: `handlePurchase` (Action: Button Click)

**Backend Mapping**:
- Route: `routes/transaction.js` -> `router.post('/purchase', ...)`
- Controller: `controllers/transactionController.js` -> `purchaseCourse`

**Request Details**:
- Body: `userId`, `courseId`

**Database Interaction**:
- `Profile`: Deduct balance, add to enrolledCourses.
- `Transaction`: Create purchase record.
- `CourseProgress`: Initialize progress.

---

## Progress

### GET /api/progress/:userId/all
**Purpose**: Get all course progress for a user.

**Backend Mapping**:
- Route: `routes/progress.js`
- Controller: `controllers/progressController.js` -> `getAllProgress`

### GET /api/progress/:userId/:courseId
**Purpose**: Get progress for significant course.

**Frontend Source**:
- File: `src/pages/LearnerDashboard.jsx` (or ContentTab)
- Function: `fetchProgress`

### POST /api/progress/:userId/:courseId
**Purpose**: Update progress (mark video as watched).

**Frontend Source**:
- File: `src/components/course-detail/tabs/ContentTab.jsx`
- Function: `markAsCompleted`

---

## Admin

### GET /api/admin/stats
**Purpose**: Get system-wide statistics.

**Frontend Source**:
- File: `src/pages/AdminDashboard.jsx`

**Backend Mapping**:
- Route: `routes/admin.js` -> `getStats`

### GET /api/admin/courses/pending
**Purpose**: Get courses waiting for approval.

**Backend Mapping**:
- Route: `routes/admin.js` -> `getPendingCourses`

### POST /api/admin/courses/:courseId/approve
**Purpose**: Approve a course.

**Frontend Source**:
- File: `src/services/adminService.js` / `AdminDashboard.jsx`

**Backend Mapping**:
- Route: `routes/admin.js` -> `approveCourse`
