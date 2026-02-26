# Student (Learner) Workflow

> Complete guide to how a learner interacts with the LMS platform — pages, components, API calls, and step-by-step flows.

---

## Table of Contents

1. [Registration & Onboarding](#1-registration--onboarding)
2. [Course Browsing](#2-course-browsing)
3. [Course Detail & Enrollment](#3-course-detail--enrollment)
4. [Learning Experience](#4-learning-experience)
5. [Dashboard](#5-learner-dashboard)
6. [Profile & Wallet](#6-profile--wallet)
7. [API Reference](#7-api-reference)
8. [Component Map](#8-component-map)
9. [Complete Step-by-Step Workflow](#9-complete-step-by-step-workflow)

---

## 1. Registration & Onboarding

### Pages

| Page | File | Route |
|------|------|-------|
| Login | `LMS-Client/src/pages/LoginPage.jsx` | `/login` |
| Register | `LMS-Client/src/pages/RegisterPage.jsx` | `/register` |
| Bank Setup | `LMS-Client/src/pages/BankSetupPage.jsx` | `/bank-setup` |

### Flow

```
Register (/register)
  │  Form: fullName, email, password, role = "learner"
  │  API: POST /api/auth/signup  →  { email, password, fullName, role }
  │  Response: Sets httpOnly JWT cookie (7-day expiry), returns { user }
  │  After: AuthContext fetches profile via GET /api/profile/{userId}
  ▼
Bank Setup (/bank-setup)
  │  Auto-generates: bankAccount (10-digit), bankSecret (16-char hex)
  │  API: PUT /api/profile/{userId}  →  { bankAccount, bankSecret }
  │  After: Navigates to /
  ▼
Home Page (/)
```

### Login Flow

```
Login (/login)
  │  Form: email, password
  │  API: POST /api/auth/login  →  { email, password }
  │  Response: Sets httpOnly JWT cookie, returns { user }
  │  After: AuthContext fetches profile, navigates to /
  ▼
Home Page (/)
```

### Session Restoration (on page refresh)

```
AuthContext mounts
  │  API: GET /api/auth/me  →  reads JWT from cookie
  │  If valid: returns { user }  →  fetches profile via GET /api/profile/{userId}
  │  If invalid: user = null  →  ProtectedRoute redirects to /login
```

---

## 2. Course Browsing

### Page

| Page | File | Route |
|------|------|-------|
| Home | `LMS-Client/src/pages/HomePage.jsx` | `/` |

### How It Works

```
HomePage mounts
  │  API: GET /api/courses
  │  Returns: { courses[] }  — only courses with status = "approved"
  ▼
Display course cards (thumbnail, title, description, instructor, price)
  │  Client-side search: filters by title or instructor_name
  │  Click "View Course"
  ▼
Navigate to /course/{courseId}
```

### Components Used

- `Navbar` — top navigation bar with wallet balance, dashboard link, profile link
- `LoadingSpinner` — shown while fetching courses

---

## 3. Course Detail & Enrollment

### Page

| Page | File | Route |
|------|------|-------|
| Course Detail | `LMS-Client/src/pages/CourseDetailPage.jsx` | `/course/:id` |

### Data Fetching

```
CourseDetailPage mounts
  │  API: GET /api/courses/{id}  (with credentials — optionalAuth)
  │  Returns: { course, instructorStats }
  │
  │  If learner is enrolled → full content returned (videos, materials, MCQs, CQs)
  │  If NOT enrolled → content is stripped (video URLs hidden, materials/MCQs/CQs removed)
  │
  │  Also checks: profile.enrolledCourses.includes(courseId) → sets isEnrolled
  │
  │  If enrolled:
  │    API: GET /api/progress/{userId}/{courseId}
  │    Returns: { progress } with completedVideos[], percentage, isCompleted
```

### Sub-Components

| Component | File | Purpose |
|-----------|------|---------|
| `CourseHeader` | `components/course-detail/CourseHeader.jsx` | Breadcrumb with course title |
| `CourseInfo` | `components/course-detail/CourseInfo.jsx` | Title, description, rating, last updated |
| `InstructorCard` | `components/course-detail/InstructorCard.jsx` | Instructor profile: name, bio, profession, stats |
| `PurchaseCard` | `components/course-detail/PurchaseCard.jsx` | Sidebar — see Purchase Flow below |
| `PurchaseModal` | `components/course-detail/PurchaseModal.jsx` | Payment confirmation modal |
| `CourseTabs` | `components/course-detail/CourseTabs.jsx` | Tab container for Overview, Content, Materials, Questions, Reviews |
| `RelatedCourses` | `components/course-detail/RelatedCourses.jsx` | Grid of related courses |
| `ReviewItem` | `components/course-detail/ReviewItem.jsx` | Individual review display |

### PurchaseCard States (for Learner)

```
Not Enrolled:
  ┌─────────────────────────────────┐
  │  Price: $XX.XX                  │
  │  [Enroll Now] button            │
  │  Course includes: video, files, │
  │  certificate, support           │
  └─────────────────────────────────┘

Enrolled (In Progress):
  ┌─────────────────────────────────┐
  │  ✓ Course Enrolled              │
  │  Progress: ██████░░░░ 60%       │
  │  Complete all videos to earn    │
  │  your certificate               │
  └─────────────────────────────────┘

Enrolled (Completed):
  ┌─────────────────────────────────┐
  │  ✓ Course Enrolled              │
  │  [🏆 Download Certificate]      │
  └─────────────────────────────────┘
```

### Purchase Flow (Enrollment)

```
1. Click "Enroll Now" on PurchaseCard
   ▼
2. PurchaseModal opens
   │  Shows: course price, current wallet balance
   │  If balance < price → "Recharge Wallet" button → opens WalletModal
   │  Input: bankSecret
   ▼
3. Click "Confirm Payment"
   │  API: POST /api/transactions/purchase
   │  Body: { userId, courseId, bankSecret }
   │
   │  Backend (in MongoDB transaction):
   │    ├─ Verify bankSecret matches profile.bankSecret
   │    ├─ Check not already enrolled
   │    ├─ Check balance >= price
   │    ├─ Deduct price from learner bankBalance
   │    ├─ Add courseId to learner enrolledCourses[]
   │    ├─ Create Transaction { type: "course_purchase", status: "completed", amount: price }
   │    └─ Create CourseProgress { user, course, completedVideos: [], isCompleted: false }
   ▼
4. refreshProfile() → navigate to /learner-dashboard
```

### Tab Components (Course Detail)

#### Overview Tab (`tabs/OverviewTab.jsx`)
- Displays: learning objectives, course content preview (sections + lecture counts + durations), requirements, target audience
- No API calls — uses data from the fetched course object

#### Content Tab (`tabs/ContentTab.jsx`)
- **Video Player**: Plays selected video (only if enrolled)
- **Curriculum Sections**: Expandable list of sections → lectures (videos)
- **Mark Complete**: Toggle a video as completed
  ```
  API: POST /api/progress/{userId}/{courseId}
  Body: { videoId }
  Backend: Adds/removes videoId in completedVideos[], recalculates percentage
           If percentage >= 100 → isCompleted = true, completedAt = now
  ```
- **Progress Bar**: Shows overall completion percentage
- **Not enrolled**: Videos show locked state, no playback

#### Materials Tab (`tabs/MaterialsTab.jsx`)
- Lists downloadable materials (PDFs, docs, etc.)
- **Download**:
  ```
  API: GET /api/courses/materials/{filename}/download
  Backend: Streams file from LMS-Server/uploads/materials/
  ```
- **Not enrolled**: Materials show locked state

#### Reviews Tab (`tabs/ReviewsTab.jsx`)
- Rating distribution chart
- List of reviews via `ReviewItem`
- **Submit Review** (only if enrolled learner):
  ```
  API: POST /api/courses/{courseId}/reviews
  Body: { rating (1-5), comment }
  ```

#### Questions Tab (`tabs/QuestionsTab.jsx`)
- **MCQ Quiz**: Interactive multiple-choice with instant correct/incorrect feedback
- **CQ Section**: Question displayed, answer hidden behind show/hide toggle
- **Not enrolled**: Shows locked state

---

## 4. Learning Experience

### Video Progress Tracking

```
Learner watches a video and clicks the completion toggle (circle icon)
  │
  │  API: POST /api/progress/{userId}/{courseId}
  │  Body: { videoId }
  │
  │  Backend:
  │    ├─ Find/create CourseProgress document
  │    ├─ Toggle videoId in completedVideos[]
  │    ├─ Count total videos from course.content
  │    ├─ percentage = (completedVideos.length / totalVideos) * 100
  │    ├─ If percentage >= 100 → isCompleted = true, completedAt = new Date()
  │    └─ Save and return updated progress
  │
  │  Frontend:
  │    ├─ Updates circle icon to green checkmark
  │    ├─ Updates section completion count
  │    └─ Updates progress bar
```

### Certificate Download

```
When isCompleted = true:
  │
  │  "Download Certificate" button appears in:
  │    - PurchaseCard (course detail sidebar)
  │    - CourseItem (learner dashboard)
  │
  │  Click button:
  │    API: GET /api/progress/{userId}/{courseId}/certificate
  │
  │    Backend (progressController.getCertificate):
  │      ├─ Verify progress.isCompleted = true
  │      ├─ Generate PDF with PDFKit:
  │      │   - Decorative border and corner accents
  │      │   - "CERTIFICATE OF COMPLETION"
  │      │   - Learner's full name
  │      │   - Course title
  │      │   - Instructor name
  │      │   - Completion date
  │      │   - Certificate ID
  │      │   - Signature lines
  │      └─ Stream PDF as response (Content-Type: application/pdf)
  │
  │    Frontend:
  │      ├─ Fetch as blob
  │      ├─ Create temporary download URL
  │      └─ Trigger browser download as "certificate_CourseName.pdf"
```

---

## 5. Learner Dashboard

### Page

| Page | File | Route |
|------|------|-------|
| Learner Dashboard | `LMS-Client/src/pages/LearnerDashboard.jsx` | `/learner-dashboard` |

### Data Flow

```
LearnerDashboard mounts
  │
  ├─ refreshProfile()  →  re-fetches profile (includes enrolledCourses populated)
  │
  ├─ API: GET /api/progress/{userId}/all
  │  Returns: { progress[] }  — all CourseProgress records for this user
  │
  └─ Merges enrolledCourses + progressData into enrollment objects:
     {
       course_id, course.title, course.description, course.instructor_name,
       is_completed, completion_percentage, certificate_url (if completed)
     }
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `DashboardHeader` | `components/dashboard/DashboardHeader.jsx` | Welcome message with learner name |
| `MetricCards` | `components/dashboard/MetricCards.jsx` | 3 stat cards: Total Enrolled, Completed, In Progress |
| `ProgressCharts` | `components/dashboard/ProgressCharts.jsx` | Pie chart (completed vs in-progress) + Bar chart (per-course %) |
| `CourseList` | `components/dashboard/CourseList.jsx` | Lists enrolled courses via CourseItem |
| `CourseItem` | `components/dashboard/CourseItem.jsx` | Course card with expand/collapse, status badge, certificate download |
| `DashboardLoader` | `components/dashboard/DashboardLoader.jsx` | Skeleton loading placeholder |

### Dashboard Layout

```
┌──────────────────────────────────────────────┐
│  Welcome back, {learnerName}!                │
│  Your Learning Journey                       │
├──────────┬──────────┬────────────────────────┤
│ Total: 5 │ Done: 2  │ In Progress: 3         │
├──────────┴──────────┴────────────────────────┤
│  [Pie Chart]              [Bar Chart]        │
├──────────────────────────────────────────────┤
│  Course: Cloud Fundamentals                  │
│  Instructor: Dr. Smith   [IN PROGRESS]       │
│  [View Content ▼]  [Download Certificate]    │
│  ────────────────────────────────────        │
│  Course: Serverless Dev                      │
│  Instructor: Ms. Lambda  [COMPLETED ✓]       │
│  [View Content ▼]  [Download Certificate]    │
└──────────────────────────────────────────────┘
```

---

## 6. Profile & Wallet

### Pages

| Page | File | Route |
|------|------|-------|
| Profile | `LMS-Client/src/pages/ProfilePage.jsx` | `/profile` |

### Profile Editing

```
ProfilePage:
  │  Displays: fullName, speciality, profession, bio, skills
  │  Also shows: wallet balance, bank account, bank secret
  │
  │  Edit & Save:
  │    API: PUT /api/profile/{userId}
  │    Body: { fullName, speciality, profession, bio, skills }
```

### Wallet Recharge

```
Click "Recharge Wallet" (on ProfilePage or in PurchaseModal)
  ▼
WalletModal opens (components/profile/WalletModal.jsx)
  │  Input: recharge amount
  │  Click "Recharge"
  │
  │  API: POST /api/transactions/recharge
  │  Body: { userId, amount }
  │
  │  Backend (in MongoDB transaction):
  │    ├─ Create Transaction { type: "wallet_recharge", status: "completed", amount }
  │    ├─ Add amount to profile.bankBalance
  │    └─ Return { success: true, newBalance }
  │
  │  After: refreshProfile() → updates displayed balance everywhere
```

---

## 7. API Reference

### Authentication

| Method | Endpoint | Body | Purpose |
|--------|----------|------|---------|
| `POST` | `/api/auth/signup` | `{ email, password, fullName, role }` | Register |
| `POST` | `/api/auth/login` | `{ email, password }` | Login |
| `POST` | `/api/auth/logout` | — | Logout |
| `GET` | `/api/auth/me` | — | Restore session from cookie |

### Profile

| Method | Endpoint | Body | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/profile/:userId` | — | Get profile + enrolled courses |
| `PUT` | `/api/profile/:userId` | Profile fields | Update profile |

### Courses (Student-relevant)

| Method | Endpoint | Body | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/courses` | — | List all approved courses |
| `GET` | `/api/courses/:id` | — | Get course detail (content stripped if not enrolled) |
| `POST` | `/api/courses/:id/reviews` | `{ rating, comment }` | Submit review |
| `GET` | `/api/courses/materials/:filename/download` | — | Download material file |

### Transactions

| Method | Endpoint | Body | Purpose |
|--------|----------|------|---------|
| `POST` | `/api/transactions/purchase` | `{ userId, courseId, bankSecret }` | Purchase/enroll in course |
| `POST` | `/api/transactions/recharge` | `{ userId, amount }` | Recharge wallet |

### Progress

| Method | Endpoint | Body | Purpose |
|--------|----------|------|---------|
| `GET` | `/api/progress/:userId/all` | — | All progress records |
| `GET` | `/api/progress/:userId/:courseId` | — | Single course progress |
| `POST` | `/api/progress/:userId/:courseId` | `{ videoId }` | Toggle video completion |
| `GET` | `/api/progress/:userId/:courseId/certificate` | — | Download PDF certificate |

---

## 8. Component Map

```
LearnerDashboard
  ├── Navbar
  ├── Toast
  ├── DashboardLoader (while loading)
  ├── DashboardHeader
  ├── MetricCards
  ├── ProgressCharts (Pie + Bar)
  └── CourseList
       └── CourseItem (×N)

CourseDetailPage
  ├── Navbar
  ├── Toast
  ├── LoadingSpinner (while loading)
  ├── CourseHeader
  ├── CourseInfo
  ├── InstructorCard
  ├── CourseTabs
  │    ├── OverviewTab
  │    ├── ContentTab (video player + curriculum + progress)
  │    ├── MaterialsTab (file downloads)
  │    ├── ReviewsTab (reviews + submit form)
  │    └── QuestionsTab (MCQs + CQs)
  ├── PurchaseCard (sidebar)
  ├── PurchaseModal (payment confirmation)
  └── WalletModal (recharge)

ProfilePage
  ├── Navbar
  └── WalletModal

HomePage
  ├── Navbar
  ├── LoadingSpinner
  └── Course Cards (×N)
```

---

## 9. Complete Step-by-Step Workflow

```
1.  REGISTER        →  POST /api/auth/signup (role: "learner")
2.  BANK SETUP      →  PUT /api/profile/{userId} (bankAccount, bankSecret)
3.  BROWSE COURSES  →  GET /api/courses → filter/search → click course
4.  VIEW COURSE     →  GET /api/courses/{id} → see overview, locked content
5.  RECHARGE WALLET →  POST /api/transactions/recharge (if needed)
6.  ENROLL          →  POST /api/transactions/purchase → deducts price
7.  WATCH VIDEOS    →  Play videos on Content tab
8.  MARK COMPLETE   →  POST /api/progress/{userId}/{courseId} → toggle video
9.  DOWNLOAD FILES  →  GET /api/courses/materials/{filename}/download
10. TAKE QUIZZES    →  Answer MCQs (instant feedback), read CQs
11. WRITE REVIEW    →  POST /api/courses/{id}/reviews
12. DASHBOARD       →  GET /api/progress/{userId}/all → view metrics + charts
13. CERTIFICATE     →  GET /api/progress/{userId}/{courseId}/certificate (at 100%)
14. EDIT PROFILE    →  PUT /api/profile/{userId}
```
