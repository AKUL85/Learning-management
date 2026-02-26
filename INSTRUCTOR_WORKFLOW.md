# Instructor Workflow

> Complete guide to how an instructor interacts with the LMS platform — pages, components, API calls, and step-by-step flows.

---

## Table of Contents

1. [Registration & Onboarding](#1-registration--onboarding)
2. [Instructor Dashboard](#2-instructor-dashboard)
3. [Course Creation](#3-course-creation)
4. [Course Editing](#4-course-editing)
5. [Transaction Validation](#5-transaction-validation)
6. [Course Management](#6-course-management)
7. [Q&A Interaction](#7-qa-interaction)
8. [Profile & Wallet](#8-profile--wallet)
9. [API Reference](#9-api-reference)
10. [Component Map](#10-component-map)
11. [Complete Step-by-Step Workflow](#11-complete-step-by-step-workflow)
12. [Business Rules](#12-business-rules)

---

## 1. Registration & Onboarding

### Pages

| Page | File | Route |
|------|------|-------|
| Register | `LMS-Client/src/pages/RegisterPage.jsx` | `/register` |
| Bank Setup | `LMS-Client/src/pages/BankSetupPage.jsx` | `/bank-setup` |

### Flow

```
Register (/register)
  │  Form: fullName, email, password, role = "instructor"
  │  API: POST /api/auth/signup  →  { email, password, fullName, role: "instructor" }
  │  Response: Sets httpOnly JWT cookie, returns { user }
  │  After: AuthContext fetches profile, navigates to /bank-setup
  ▼
Bank Setup (/bank-setup)
  │  Auto-generates: bankAccount (10-digit), bankSecret (16-char hex)
  │  API: PUT /api/profile/{userId}  →  { bankAccount, bankSecret }
  │  After: Navigates to /
  ▼
Home Page (/) — can browse courses, then go to /instructor-dashboard
```

---

## 2. Instructor Dashboard

### Page

| Page | File | Route |
|------|------|-------|
| Instructor Dashboard | `LMS-Client/src/pages/InstructorDashboard.jsx` | `/instructor-dashboard` |

### Data Fetching

```
InstructorDashboard mounts
  │
  │  API: GET /api/instructor/dashboard
  │  Returns: { courses[], transactions[], profile }
  │
  │  Frontend computes:
  │    ├─ totalCourses     = courses.filter(c => c.status === 'approved').length
  │    ├─ totalEarnings    = sum of all completed transaction amounts
  │    ├─ pendingPayouts   = count of transactions with status = 'pending'
  │    ├─ pendingCourses   = courses.filter(c => c.status === 'pending').length
  │    └─ totalAudience    = count of transactions with type = 'course_purchase'
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| `InstructorHeader` | `components/dashboard/InstructorHeader.jsx` | Welcome banner + "Create New Course" button |
| `InstructorStats` | `components/dashboard/InstructorStats.jsx` | 5 stat cards: Approved Courses, Revenue, Pending Payouts, Students, Pending Courses |
| `InstructorCharts` | `components/dashboard/InstructorCharts.jsx` | Bar chart: course pricing comparison. Bar chart: revenue breakdown (rewards vs enrollments vs total per course) |
| `PendingTransactions` | `components/dashboard/PendingTransactions.jsx` | List of pending purchase transactions with "Validate" button |
| `InstructorCourseList` | `components/dashboard/InstructorCourseList.jsx` | Course grid with View, Edit, Delete actions |
| `CreateCourseModal` | `components/dashboard/CreateCourseModal.jsx` | Full course creation form (see Section 3) |
| `InstructorDashboardLoader` | `components/dashboard/InstructorDashboardLoader.jsx` | Skeleton loading placeholder |

### Dashboard Layout

```
┌──────────────────────────────────────────────────────────┐
│  Welcome, {instructorName}!       [+ Create New Course]  │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│ Approved │ Revenue  │ Pending  │ Students │ Pending      │
│ Courses  │ $X,XXX   │ Payouts  │ XX       │ Courses      │
│ X        │          │ X        │          │ X            │
├──────────┴──────────┴──────────┴──────────┴──────────────┤
│  [Bar Chart: Pricing]         [Bar Chart: Revenue]       │
├──────────────────────────────────────────────────────────┤
│  Pending Transactions:                                   │
│  ┌─ Student bought "Course A" - $49.99 ── [Validate] ─┐ │
│  └─ Student bought "Course B" - $29.99 ── [Validate] ─┘ │
├──────────────────────────────────────────────────────────┤
│  Your Courses:                                           │
│  ┌─ Course A [approved] ── [View] [Edit] [Delete] ────┐ │
│  ├─ Course B [pending]  ── [View] [Edit] [Delete] ────┤ │
│  └─ Course C [rejected] ── [View] [Edit] [Delete] ────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Course Creation

### Component

| Component | File | Triggered From |
|-----------|------|----------------|
| `CreateCourseModal` | `components/dashboard/CreateCourseModal.jsx` | "Create New Course" button in InstructorHeader |

### Form Sections

```
CreateCourseModal
  ├── Basic Info
  │    ├─ Title (text)
  │    ├─ Description (textarea)
  │    └─ Price (number)
  │
  ├── Media
  │    ├─ Thumbnail Image (file upload, 1 file)
  │    └─ Course Video (file upload, 1 file)
  │
  ├── Materials
  │    └─ Multiple file uploads (PDFs, docs, etc.)
  │
  ├── MCQs (dynamic add/remove)
  │    ├─ Question text
  │    ├─ 4 Options
  │    └─ Correct option (radio selection)
  │
  └── CQs (dynamic add/remove)
       ├─ Question text
       └─ Answer text
```

### Submission Flow

```
Instructor fills form → Click "Create Course"
  │
  │  Frontend builds FormData:
  │    ├─ title, description, price (text fields)
  │    ├─ image (file — thumbnail)
  │    ├─ video (file — intro video)
  │    ├─ materials (files — multiple)
  │    ├─ mcqs (JSON string)
  │    └─ cqs (JSON string)
  │
  │  API: POST /api/courses
  │  (Alternative: POST /api/instructor/course — same handler)
  │
  │  Backend (courseController.createCourse):
  │    ├─ Verify auth + instructor role
  │    ├─ Upload image to Cloudinary → thumbnail_url
  │    ├─ Upload video to Cloudinary → video_url + actual duration from Cloudinary response
  │    ├─ Store materials locally in uploads/materials/ with unique filenames
  │    │   Download URL: /api/courses/materials/{uniqueName}/download
  │    ├─ Parse mcqs and cqs from JSON strings
  │    ├─ Create Course document:
  │    │   status: "pending" (needs admin approval)
  │    │   content[0] = { section: "Introduction", videos: [{ title, duration, video_url }] }
  │    │   materials = [{ id, title, type, size, url }]
  │    ├─ Create Transaction { type: "course_upload_reward", amount: 500, status: "completed" }
  │    └─ Add $500 to instructor's bankBalance
  │
  │  Response: { course, transaction, profile }
  │  After: Modal closes, dashboard refreshes
```

### File Upload Details (Multer Middleware)

```
Field: "image"     →  max 1 file   → uploaded to Cloudinary (images)
Field: "video"     →  max 10 files → uploaded to Cloudinary (videos)
Field: "materials" →  max 10 files → stored locally in LMS-Server/uploads/materials/

Max total size: 200 MB
Accepted image types: jpeg, jpg, png, gif, webp
Accepted video types: mp4, mpeg, quicktime, x-msvideo, webm
Accepted document types: pdf, doc, docx, ppt, pptx, xls, xlsx, txt
```

---

## 4. Course Editing

### Page

| Page | File | Route |
|------|------|-------|
| Edit Course | `LMS-Client/src/pages/EditCoursePage.jsx` | `/instructor/course/:id/edit` |

### Data Loading

```
EditCoursePage mounts
  │  API: GET /api/courses/{id}  (with credentials)
  │  Returns: { course, instructorStats }
  │  Extracts course data and pre-populates form:
  │    title, description, price, mcqs[], cqs[], requirements[], audience[]
```

### Editable Sections

```
EditCoursePage
  ├── Basic Info
  │    ├─ Title
  │    ├─ Description
  │    └─ Price
  │
  ├── Requirements (dynamic add/remove)
  │    └─ List of requirement strings
  │
  ├── Target Audience (dynamic add/remove)
  │    └─ List of audience strings
  │
  ├── New Resources (additive — appends to existing)
  │    ├─ Upload NEW Materials (with custom title per file)
  │    └─ Upload NEW Videos (with custom title per file)
  │
  ├── MCQs (full edit — add/remove/modify)
  │    ├─ Question + 4 options + correct option
  │    └─ Existing MCQs pre-loaded, new ones can be added
  │
  └── CQs (full edit — add/remove/modify)
       ├─ Question + Answer
       └─ Existing CQs pre-loaded, new ones can be added
```

### Submission Flow

```
Instructor edits fields → Click "Update Protocol Data"
  │
  │  Frontend builds FormData:
  │    ├─ title, description, price
  │    ├─ mcqs (JSON string — full replace)
  │    ├─ cqs (JSON string — full replace)
  │    ├─ requirements (JSON string)
  │    ├─ audience (JSON string)
  │    ├─ materials (new files)
  │    ├─ material_titles (JSON: { "filename.pdf": "Custom Title" })
  │    ├─ video (new video files)
  │    ├─ video_titles (JSON: { "video.mp4": "Lesson Title" })
  │    └─ image (new thumbnail, if changed)
  │
  │  API: PUT /api/courses/{id}
  │
  │  Backend (courseController.handleCourseUpdate):
  │    ├─ Verify auth + ownership (or admin)
  │    ├─ Parse text fields into $set updates
  │    ├─ Upload new image to Cloudinary (if provided)
  │    ├─ Upload new videos to Cloudinary → each becomes a new content section
  │    │   "Module N" with video title from video_titles + actual duration from Cloudinary
  │    ├─ Store new materials locally with custom titles from material_titles
  │    ├─ Replace mcqs[] and cqs[] entirely
  │    ├─ New materials → $push to existing materials[]
  │    ├─ New content blocks → $push to existing content[]
  │    └─ MongoDB findByIdAndUpdate with $set + $push
  │
  │  Response: Updated course
  │  After: Navigate to /instructor-dashboard
```

### Key Behavior: Additive vs Replacement

| Field | Behavior |
|-------|----------|
| title, description, price | Replaced |
| thumbnail | Replaced |
| mcqs, cqs | Fully replaced |
| requirements, audience | Fully replaced |
| videos | **Appended** (new videos become new content sections) |
| materials | **Appended** (new materials added to existing list) |

---

## 5. Transaction Validation

### Component

| Component | File |
|-----------|------|
| `PendingTransactions` | `components/dashboard/PendingTransactions.jsx` |

### Flow

```
When a student purchases a course:
  │  Transaction created: { type: "course_purchase", status: "pending", amount: price }
  │  Appears in instructor's PendingTransactions list
  ▼
Instructor clicks "Validate"
  │  API: POST /api/instructor/transaction/{transactionId}/validate
  │
  │  Backend (instructorController.validateTransaction):
  │    ├─ Find transaction by ID
  │    ├─ Set status = "completed"
  │    ├─ Set validated_at = new Date()
  │    ├─ Add transaction.amount to instructor's bankBalance
  │    └─ Return { transaction, profile }
  │
  │  After: Dashboard refreshes → transaction disappears from pending list,
  │         Revenue stats updated
```

### Why Validation Exists

The purchase transaction flow:
1. Student pays → money deducted from student immediately
2. Transaction created as `pending` → instructor must validate
3. Instructor validates → money credited to instructor balance

This gives the instructor control over confirming enrollments.

---

## 6. Course Management

### Viewing a Course

```
InstructorCourseList → Click "View"
  │  Navigate to /course/{courseId}
  │  CourseDetailPage loads with full access (instructor is recognized as owner)
  │  PurchaseCard shows "Edit Course" button instead of "Enroll"
```

### Editing a Course

```
InstructorCourseList → Click "Edit"
  │  Navigate to /instructor/course/{courseId}/edit
  │  EditCoursePage loads (see Section 4)
```

### Deleting a Course

```
InstructorCourseList → Click "Delete"
  │  SweetAlert2 confirmation dialog
  │  If confirmed:
  │    API: DELETE /api/courses/{id}
  │
  │    Backend (courseController.deleteCourse):
  │      ├─ Verify auth + ownership
  │      ├─ Delete thumbnail from Cloudinary (extract public_id from URL)
  │      ├─ Delete all videos from Cloudinary (iterate content sections)
  │      ├─ Delete all local material files from uploads/materials/
  │      └─ Remove Course document from MongoDB
  │
  │    After: Dashboard refreshes, course removed from list
```

### Course Status Lifecycle

```
Course Created → status: "pending"
  │
  ├─ Admin approves → status: "approved" → visible to students on /
  │
  └─ Admin rejects  → status: "rejected" → only visible to instructor and admin
```

Instructors can see all their courses regardless of status on the instructor dashboard. Students can only see `approved` courses on the home page.

---

## 7. Q&A Interaction

### Where

On the course detail page (`/course/{id}`), the Q&A section is in the Questions tab.

### Answering Questions

```
Student posts a question on Q&A
  │  API: POST /api/courses/{id}/qa
  │  Body: { question, description }
  │  Creates QA entry with: question, author, author_id, date
  ▼
Instructor visits course → Questions tab
  │  Sees unanswered questions
  │  Types answer → Click "Submit Answer"
  │
  │  API: PUT /api/courses/{courseId}/qa/{qaId}
  │  Body: { answer }
  │
  │  Backend: Only allows the course's instructor to answer
  │  Updates the QA entry with the answer text
```

---

## 8. Profile & Wallet

### Profile Page (`/profile`)

Instructors have additional fields compared to regular learners:

```
Profile Fields:
  ├─ fullName
  ├─ speciality    (e.g., "Machine Learning")
  ├─ profession    (e.g., "Senior Developer")
  ├─ bio           (text description)
  ├─ skills[]      (comma-separated, stored as array)
  ├─ bankAccount   (view only — set during bank setup)
  ├─ bankSecret    (view only — set during bank setup)
  └─ bankBalance   (view only — updated via transactions)

API: PUT /api/profile/{userId}
Body: { fullName, speciality, profession, bio, skills }
```

These fields appear on the `InstructorCard` component when students view the instructor's courses.

### Wallet

Same as student — can recharge via `POST /api/transactions/recharge`.
Balance increases from:
- $500 course upload reward (immediate on create)
- Transaction validation (when students purchase and instructor validates)
- Manual wallet recharge

---

## 9. API Reference

### Instructor-Specific Routes

| Method | Endpoint | Body/Params | Purpose |
|--------|----------|-------------|---------|
| `GET` | `/api/instructor/dashboard` | — | Dashboard data: courses, transactions, profile |
| `POST` | `/api/instructor/course` | FormData | Create course (alternative route) |
| `GET` | `/api/instructor/transactions/pending` | — | All pending transactions for this instructor |
| `POST` | `/api/instructor/transaction/:id/validate` | — | Mark transaction as completed, credit balance |

### Course Routes (used by instructors)

| Method | Endpoint | Body/Params | Purpose |
|--------|----------|-------------|---------|
| `POST` | `/api/courses` | FormData | Create course |
| `GET` | `/api/courses/:id` | — | Get course detail (full access as owner) |
| `PUT` | `/api/courses/:id` | FormData | Full update |
| `PATCH` | `/api/courses/:id` | FormData | Partial update (same handler as PUT) |
| `DELETE` | `/api/courses/:id` | — | Delete course + cleanup Cloudinary + local files |
| `PUT` | `/api/courses/:id/qa/:qaId` | `{ answer }` | Answer a student's question |

### Shared Routes

| Method | Endpoint | Body | Purpose |
|--------|----------|------|---------|
| `POST` | `/api/auth/signup` | `{ email, password, fullName, role }` | Register |
| `POST` | `/api/auth/login` | `{ email, password }` | Login |
| `POST` | `/api/auth/logout` | — | Logout |
| `GET` | `/api/auth/me` | — | Restore session |
| `GET` | `/api/profile/:userId` | — | Get profile |
| `PUT` | `/api/profile/:userId` | Profile fields | Update profile |
| `GET` | `/api/courses` | — | List approved courses |
| `POST` | `/api/transactions/recharge` | `{ userId, amount }` | Recharge wallet |

---

## 10. Component Map

```
InstructorDashboard
  ├── Navbar
  ├── InstructorDashboardLoader (while loading)
  ├── InstructorHeader
  │    └── "Create New Course" button → opens CreateCourseModal
  ├── InstructorStats (5 metric cards)
  ├── InstructorCharts (2 bar charts)
  ├── PendingTransactions
  │    └── Transaction row (×N) with [Validate] button
  ├── InstructorCourseList
  │    └── Course card (×N) with [View] [Edit] [Delete]
  └── CreateCourseModal
       ├── Basic Info form
       ├── Media uploads
       ├── Materials uploads
       ├── MCQ builder (dynamic)
       └── CQ builder (dynamic)

EditCoursePage
  ├── Navbar
  ├── LoadingSpinner (while loading)
  └── Edit Form
       ├── Basic Info (title, description, price)
       ├── Requirements (dynamic list)
       ├── Target Audience (dynamic list)
       ├── New Resources (material + video uploads with titles)
       ├── MCQ editor (dynamic)
       └── CQ editor (dynamic)

CourseDetailPage (instructor view)
  ├── Full course content access
  ├── PurchaseCard shows "Edit Course" button
  └── Q&A tab allows answering questions
```

---

## 11. Complete Step-by-Step Workflow

```
1.  REGISTER         →  POST /api/auth/signup (role: "instructor")
2.  BANK SETUP       →  PUT /api/profile/{userId} (bankAccount, bankSecret)
3.  CREATE COURSE    →  POST /api/courses (FormData: title, media, MCQs, CQs)
                        → $500 reward credited immediately
                        → Course status = "pending"
4.  WAIT FOR ADMIN   →  Admin reviews and approves/rejects
5.  EDIT COURSE      →  GET /api/courses/{id} → PUT /api/courses/{id}
                        → Add new videos/materials, modify MCQs/CQs
6.  VIEW DASHBOARD   →  GET /api/instructor/dashboard
                        → See stats, charts, pending transactions, course list
7.  VALIDATE SALES   →  POST /api/instructor/transaction/{id}/validate
                        → Confirms student purchase, credits amount to balance
8.  ANSWER QUESTIONS →  PUT /api/courses/{id}/qa/{qaId}
                        → Respond to student Q&A
9.  DELETE COURSE    →  DELETE /api/courses/{id}
                        → Removes course + Cloudinary files + local materials
10. MANAGE PROFILE   →  PUT /api/profile/{userId}
                        → Update bio, skills, profession, speciality
11. BROWSE COURSES   →  GET /api/courses → view other instructors' courses on /
```

---

## 12. Business Rules

| Rule | Detail |
|------|--------|
| **Upload Reward** | $500 credited immediately when a course is created |
| **Max Courses** | Instructor can have ≤ 5 approved courses (enforced at admin approval) |
| **Pending Status** | New courses start as `pending` — not visible to students |
| **Purchase Validation** | Student payment deducted immediately; instructor must validate to receive funds |
| **Deletion Cleanup** | Deleting a course removes Cloudinary images/videos and local material files |
| **Ownership** | Only the course owner (or admin) can edit/delete a course |
| **Default Balance** | All new users start with $1,000 bank balance |
| **Video Duration** | Actual duration is extracted from Cloudinary upload response and stored |
