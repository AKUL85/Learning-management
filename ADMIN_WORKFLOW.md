# Admin Workflow

> Complete guide to how an admin interacts with the LMS platform — pages, components, API calls, and step-by-step flows.

---

## Table of Contents

1. [Admin Account Setup](#1-admin-account-setup)
2. [Admin Dashboard Overview](#2-admin-dashboard-overview)
3. [Overview Tab](#3-overview-tab)
4. [Courses Tab — Review & Manage](#4-courses-tab--review--manage)
5. [Instructors Tab](#5-instructors-tab)
6. [Students Tab](#6-students-tab)
7. [Financials Tab](#7-financials-tab)
8. [User Inspection Modal](#8-user-inspection-modal)
9. [API Reference](#9-api-reference)
10. [Component Map](#10-component-map)
11. [Complete Step-by-Step Workflow](#11-complete-step-by-step-workflow)
12. [Business Rules & Access Control](#12-business-rules--access-control)

---

## 1. Admin Account Setup

The admin account is **not** created through the registration page. It is seeded directly into the database via a script.

### Seed Script

| File | Command |
|------|---------|
| `LMS-Server/scripts/seedAdmin.js` | `node scripts/seedAdmin.js` |

### What the Script Does

```
seedAdmin.js
  │  Connect to MongoDB Atlas (TeachingManager database)
  │
  ├─ If user with email "admin@lms.com" exists:
  │    ├─ Reset password to "admin123"
  │    ├─ If no profile → create admin profile (bankBalance: $1,000,000)
  │    └─ If profile exists but not admin → upgrade to admin role
  │
  └─ If user does not exist:
       ├─ Create User { email: "admin@lms.com", password: "admin123" }
       └─ Create Profile { fullName: "System Admin", role: "admin", bankBalance: 1,000,000 }
```

### Default Credentials

| Field | Value |
|-------|-------|
| Email | `admin@lms.com` |
| Password | `admin123` |
| Initial Balance | $1,000,000 |

### Login Flow

```
Admin visits /login
  │  POST /api/auth/login  →  { email: "admin@lms.com", password: "admin123" }
  │  Returns: httpOnly JWT cookie + { user }
  │  AuthContext fetches profile → role = "admin"
  │  Navigate to /admin-dashboard
```

---

## 2. Admin Dashboard Overview

### Page

| Page | File | Route |
|------|------|-------|
| Admin Dashboard | `LMS-Client/src/pages/AdminDashboard.jsx` | `/admin-dashboard` |

### Service Layer

| File | Purpose |
|------|---------|
| `LMS-Client/src/services/adminService.js` | Axios wrapper for all admin API calls |

### Route Protection

All `/api/admin/*` routes are protected by two middleware layers:

```
Request → auth (JWT verification) → isAdmin (check profile.role === "admin") → Controller
```

### Data Fetching on Mount

```
AdminDashboard mounts
  │
  │  Parallel API calls (all via adminService):
  │    ├─ GET /api/admin/stats         → stats (revenue, earnings, counts)
  │    ├─ GET /api/admin/balances      → balances (system, instructor, learner)
  │    ├─ GET /api/admin/courses/pending → pendingCourses[]
  │    ├─ GET /api/admin/courses/all   → allCourses[]
  │    └─ GET /api/admin/users         → users[] (all profiles with email)
  │
  │  After: setState for all, render dashboard
```

### Tab Structure

| Tab | Icon | Content |
|-----|------|---------|
| Overview | `LayoutDashboard` | 5 stat cards |
| Courses | `BookOpen` | Pending approvals + Course catalog table |
| Instructors | `Users` | Instructor directory table + inspection |
| Students | `GraduationCap` | Student directory table + inspection |
| Financials | `Wallet` | System balance + instructor/learner balance lists |

### Dashboard Layout

```
┌──────────────────────────────────────────────────────────┐
│  Admin Dashboard                                         │
│  System Overview & Management                            │
├──────────────────────────────────────────────────────────┤
│  [Overview] [Courses] [Instructors] [Students] [Finance] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│               < Tab content renders here >               │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 3. Overview Tab

Displays 5 metric cards computed from the stats API response:

| Card | Source | Description |
|------|--------|-------------|
| Total Revenue | `stats.totalRevenue` | Sum of all completed `course_purchase` transactions |
| Instructor Earnings | `stats.instructorEarnings` | Sum of all completed `course_upload_reward` transactions |
| Total Purchases | `stats.purchaseCount` | Count of completed purchase transactions |
| Instructors | `stats.totalInstructors` | Count of profiles with role "instructor" |
| Active Courses | Frontend computed | `allCourses.filter(c => c.status === 'approved').length` |

### Component

| Component | File |
|-----------|------|
| `StatCard` | Inline in `AdminDashboard.jsx` |

---

## 4. Courses Tab — Review & Manage

The Courses tab has two sections:

### Section 1: Pending Approvals

Shows all courses with `status: "pending"`. Each card displays:
- Course title, instructor name, price
- Three action buttons: **View**, **Approve**, **Reject**

#### Approve Flow

```
Admin clicks "Approve" on a pending course
  │  SweetAlert2 confirmation: "Payment will be released to the instructor."
  │
  │  API: POST /api/admin/courses/{courseId}/approve
  │
  │  Backend (adminController.approveCourse):
  │    ├─ Check: active courses ≤ 5 (system-wide approved limit)
  │    ├─ Check: course exists and isn't already approved
  │    ├─ Find admin profile
  │    ├─ Check: admin bankBalance ≥ $500
  │    ├─ Deduct $500 from admin bankBalance
  │    ├─ Add $500 to instructor bankBalance
  │    ├─ Create Transaction:
  │    │   { type: "course_upload_reward", amount: 500, status: "completed",
  │    │     to_user_id: instructor._id, course_id, validated_at }
  │    ├─ Set course.status = "approved"
  │    └─ Set course.published_at = new Date()
  │
  │  After: Dashboard refreshes, course moves from Pending to Catalog
```

#### Reject Flow

```
Admin clicks "Reject" on a pending course
  │  SweetAlert2 confirmation: "The instructor will need to resubmit."
  │
  │  API: POST /api/admin/courses/{courseId}/reject
  │
  │  Backend (adminController.rejectCourse):
  │    ├─ Find course by ID
  │    ├─ Set course.status = "rejected"
  │    └─ Save
  │
  │  After: Dashboard refreshes, course removed from Pending list
```

#### View Flow

```
Admin clicks "View" on any course
  │  Navigate to /course/{courseId}
  │  CourseDetailPage loads with full access (via OptionalAuth middleware)
```

### Section 2: Course Catalog

A table listing **all** courses (any status) with columns:
- Course Title
- Instructor Name
- Status (badge: approved/pending/rejected)
- Actions: **View** (eye icon), **Delete** (trash icon)

#### Delete Flow (Admin)

```
Admin clicks "Delete" on a course
  │  SweetAlert2 confirmation: "You won't be able to revert this!"
  │
  │  API: DELETE /api/admin/courses/{courseId}
  │
  │  Backend (adminController.deleteCourseByAdmin):
  │    ├─ Find and delete the Course document
  │    └─ (Note: Does NOT clean up Cloudinary files — simpler admin delete)
  │
  │  After: Dashboard refreshes, course removed from table
```

> **Note:** The admin delete route (`DELETE /api/admin/courses/:courseId`) does a simpler deletion — just removes the MongoDB document. Contrast with the instructor's `DELETE /api/courses/:id` which also cleans up Cloudinary images/videos and local material files.

---

## 5. Instructors Tab

Displays a `UserTable` component filtered to `role === 'instructor'`.

### Table Columns

| Column | Data |
|--------|------|
| Full Name | `profile.fullName` |
| Email | `profile.user.email` |
| Role | "instructor" |
| Balance | `profile.bankBalance` |
| Actions | "View Details" button |

Clicking **View Details** opens the Inspection Modal (see Section 8).

---

## 6. Students Tab

Displays a `UserTable` component filtered to `role === 'learner'`.

### Table Columns

Same as Instructors tab, but filtered to learner role. Clicking **View Details** opens the Inspection Modal with learner-specific data.

---

## 7. Financials Tab

Displays three sections:

### 7.1 System Balance (Admin)

A large highlighted card showing the admin's `bankBalance` — the "system fund" used to pay instructor rewards.

```
Source: GET /api/admin/balances → balances.systemBalance
```

### 7.2 Instructor Balances

A scrollable list of all instructors with their current `bankBalance`.

```
Source: GET /api/admin/balances → balances.instructors[]
Each entry: { fullName, bankBalance }
```

### 7.3 Learner Balances

A scrollable list of all learners with their current `bankBalance`.

```
Source: GET /api/admin/balances → balances.learners[]
Each entry: { fullName, bankBalance }
```

### Financials Layout

```
┌─────────────────────────────────────────────────────────┐
│  System Balance (Admin)                                  │
│  $999,000.00                                    [Wallet] │
├───────────────────────────┬─────────────────────────────┤
│  Instructor Balances      │  Learner Balances           │
│  ┌─ John Doe   $2,500 ─┐ │  ┌─ Jane Doe   $750.00  ─┐ │
│  ├─ Alice B    $1,000 ─┤ │  ├─ Bob C      $450.00  ─┤ │
│  └─ Chris D    $3,200 ─┘ │  └─ Mary E     $200.00  ─┘ │
└───────────────────────────┴─────────────────────────────┘
```

---

## 8. User Inspection Modal

When the admin clicks **View Details** on any user (instructor or learner), a modal opens showing detailed information.

### Trigger

```
handleInspectUser(user)
  │  user.role === "instructor"?
  │    → API: GET /api/admin/users/instructor/{profileId}
  │  user.role === "learner"?
  │    → API: GET /api/admin/users/learner/{profileId}
```

### Instructor Detail Modal

```
┌──────────────────────────────────────────┐
│  [UserCheck]  John Doe                   │
│               INSTRUCTOR            [X]  │
├──────────────────────────────────────────┤
│  Email              │  Wallet Balance    │
│  john@example.com   │  $2,500.00         │
├──────────────────────────────────────────┤
│  Total Earnings     │  Total Students    │
│  $1,500.00          │  15                │
├──────────────────────────────────────────┤
│  Courses (3)                             │
│  ├─ React Masterclass    [approved]      │
│  ├─ Node.js Basics       [pending]       │
│  └─ Python 101           [rejected]      │
└──────────────────────────────────────────┘
```

**Backend data returned:**
- `profile` (with populated email)
- `courses[]` (all courses by this instructor)
- `totalEarnings` (sum of `course_upload_reward` transactions)
- `studentsCount` (unique learners enrolled in instructor's courses)

### Learner Detail Modal

```
┌──────────────────────────────────────────┐
│  [UserCheck]  Jane Doe                   │
│               LEARNER               [X]  │
├──────────────────────────────────────────┤
│  Email              │  Wallet Balance    │
│  jane@example.com   │  $750.00           │
├──────────────────────────────────────────┤
│  Enrolled Courses                        │
│  ┌─ React Masterclass    ████████░░ 80%  │
│  ├─ Node.js Basics       ███░░░░░░░ 30%  │
│  └─ Python 101           ██████████ 100% │
└──────────────────────────────────────────┘
```

**Backend data returned:**
- `profile` (with populated email + populated enrolledCourses)
- `enrolledCourses[]` with computed `progressPercent` and `lastAccessed`

Progress computation:
```
For each enrolled course:
  totalVideos = sum of videos across all content sections
  completedVideos = courseProgress.completedVideos.length
  progressPercent = Math.round((completed / total) * 100)
```

---

## 9. API Reference

### Admin Routes (all protected by auth + isAdmin middleware)

| Method | Endpoint | Response | Purpose |
|--------|----------|----------|---------|
| `GET` | `/api/admin/stats` | `{ totalRevenue, instructorEarnings, purchaseCount, totalLearners, totalInstructors }` | Platform statistics |
| `GET` | `/api/admin/balances` | `{ systemBalance, instructors[], learners[] }` | All wallet balances |
| `GET` | `/api/admin/users` | `Profile[]` (with user.email) | All user profiles |
| `GET` | `/api/admin/courses/pending` | `Course[]` (with instructor name) | Pending courses for review |
| `GET` | `/api/admin/courses/all` | `Course[]` (with instructor name, sorted by date) | Complete course catalog |
| `POST` | `/api/admin/courses/:courseId/approve` | `{ message, course }` | Approve course + pay $500 |
| `POST` | `/api/admin/courses/:courseId/reject` | `{ message, course }` | Reject course |
| `DELETE` | `/api/admin/courses/:courseId` | `{ message, courseId }` | Delete course (no file cleanup) |
| `GET` | `/api/admin/users/instructor/:profileId` | `{ profile, courses, totalEarnings, studentsCount }` | Instructor detail |
| `GET` | `/api/admin/users/learner/:profileId` | `{ profile, enrolledCourses[] }` | Learner detail + progress |

### Admin Service (Frontend)

| Service Method | API Call |
|----------------|----------|
| `adminService.getStats()` | `GET /api/admin/stats` |
| `adminService.getBalances()` | `GET /api/admin/balances` |
| `adminService.getPendingCourses()` | `GET /api/admin/courses/pending` |
| `adminService.getAllCourses()` | `GET /api/admin/courses/all` |
| `adminService.getAllUsers()` | `GET /api/admin/users` |
| `adminService.approveCourse(courseId)` | `POST /api/admin/courses/:courseId/approve` |
| `adminService.rejectCourse(courseId)` | `POST /api/admin/courses/:courseId/reject` |
| `adminService.deleteCourse(courseId)` | `DELETE /api/admin/courses/:courseId` |
| `adminService.getInstructorDetails(profileId)` | `GET /api/admin/users/instructor/:profileId` |
| `adminService.getLearnerDetails(profileId)` | `GET /api/admin/users/learner/:profileId` |

### Shared Routes (used by admin for login)

| Method | Endpoint | Body | Purpose |
|--------|----------|------|---------|
| `POST` | `/api/auth/login` | `{ email, password }` | Login |
| `POST` | `/api/auth/logout` | — | Logout |
| `GET` | `/api/auth/me` | — | Restore session |

---

## 10. Component Map

```
AdminDashboard
  ├── Navbar
  ├── LoadingSpinner (while loading)
  │
  ├── Tab Bar
  │    ├── Overview  (LayoutDashboard icon)
  │    ├── Courses   (BookOpen icon)
  │    ├── Instructors (Users icon)
  │    ├── Students  (GraduationCap icon)
  │    └── Financials (Wallet icon)
  │
  ├── Overview Tab Content
  │    └── StatCard (×5) — inline sub-component
  │
  ├── Courses Tab Content
  │    ├── Pending Approvals Section
  │    │    └── Course card (×N) with [View] [Approve] [Reject]
  │    │         └── ActionBtn — inline sub-component
  │    └── Course Catalog Table
  │         └── Row (×N) with StatusBadge, [View], [Delete]
  │              └── StatusBadge — inline sub-component
  │
  ├── Instructors Tab Content
  │    └── UserTable — inline sub-component (instructor filter)
  │
  ├── Students Tab Content
  │    └── UserTable — inline sub-component (learner filter)
  │
  ├── Financials Tab Content
  │    ├── System Balance Card
  │    ├── BalanceList (instructors) — inline sub-component
  │    └── BalanceList (learners) — inline sub-component
  │
  └── User Inspection Modal (AnimatePresence)
       ├── Header (name, role, close button)
       ├── DetailCard (email, balance) — inline sub-component
       ├── Instructor view: earnings, students, course list
       └── Learner view: enrolled courses with progress bars

Service Layer:
  └── adminService.js  (10 methods wrapping axios calls)
```

### Inline Sub-Components (defined in AdminDashboard.jsx)

| Component | Purpose |
|-----------|---------|
| `StatCard` | Metric card with icon, title, value, color |
| `UserTable` | Reusable table for instructors/students |
| `BalanceList` | Scrollable list of user names + balances |
| `StatusBadge` | Colored badge for course status (approved/pending/rejected) |
| `ActionBtn` | Styled button with icon for approve/reject actions |
| `DetailCard` | Key-value card in inspection modal |

---

## 11. Complete Step-by-Step Workflow

```
1.  SEED ADMIN          →  node scripts/seedAdmin.js
                            Creates admin@lms.com with $1,000,000 balance

2.  LOGIN               →  POST /api/auth/login
                            Navigate to /admin-dashboard

3.  VIEW OVERVIEW       →  GET /api/admin/stats + GET /api/admin/balances
                            See platform-wide metrics: revenue, earnings, user counts

4.  REVIEW COURSES      →  GET /api/admin/courses/pending
                            View pending courses, inspect content

5a. APPROVE COURSE      →  POST /api/admin/courses/{id}/approve
                            $500 deducted from admin → credited to instructor
                            Course status → "approved", becomes visible to students

5b. REJECT COURSE       →  POST /api/admin/courses/{id}/reject
                            Course status → "rejected", instructor needs to resubmit

6.  MANAGE CATALOG      →  GET /api/admin/courses/all
                            View all courses, delete any via DELETE /api/admin/courses/{id}

7.  INSPECT INSTRUCTORS →  GET /api/admin/users → filter role:instructor
                            Click "View Details" → GET /api/admin/users/instructor/{id}
                            See: email, balance, earnings, student count, course list

8.  INSPECT STUDENTS    →  GET /api/admin/users → filter role:learner
                            Click "View Details" → GET /api/admin/users/learner/{id}
                            See: email, balance, enrolled courses with progress %

9.  MONITOR FINANCES    →  GET /api/admin/balances
                            System balance, all instructor balances, all learner balances

10. LOGOUT              →  POST /api/auth/logout
```

---

## 12. Business Rules & Access Control

### Access Control

| Rule | Implementation |
|------|---------------|
| **Route guard** | `LMS-Server/routes/admin.js` applies `auth` + `isAdmin` middleware to ALL routes |
| **isAdmin check** | Queries `Profile.findOne({ user: req.user.userId })` and verifies `role === 'admin'` |
| **Frontend guard** | `ProtectedRoute` component checks `profile.role` before rendering `/admin-dashboard` |
| **403 response** | Non-admin users receive `{ message: "Access denied. Admins only." }` |

### Financial Rules

| Rule | Detail |
|------|--------|
| **Approval cost** | Each course approval costs admin $500 (transferred to instructor) |
| **Insufficient funds** | If admin balance < $500, approval fails with error message |
| **Initial balance** | Admin starts with $1,000,000 via seed script |
| **Balance tracking** | Admin can monitor all user balances in the Financials tab |

### Course Limits

| Rule | Detail |
|------|--------|
| **Max approved courses** | System can have a maximum of 5 approved courses at any time |
| **Enforcement** | Checked in `approveCourse`: `Course.countDocuments({ status: 'approved' }) >= 5` → error |
| **Admin delete** | Only removes MongoDB document (no Cloudinary cleanup) |

### Admin vs Instructor Delete

| Feature | Admin Delete | Instructor Delete |
|---------|-------------|-------------------|
| Endpoint | `DELETE /api/admin/courses/:courseId` | `DELETE /api/courses/:id` |
| MongoDB doc | ✅ Removed | ✅ Removed |
| Cloudinary images | ❌ Not cleaned | ✅ Cleaned |
| Cloudinary videos | ❌ Not cleaned | ✅ Cleaned |
| Local materials | ❌ Not cleaned | ✅ Cleaned |

### Single Admin Design

The system is designed for a **single admin account** seeded via script. There is no admin registration flow. The admin cannot create courses or enroll — the admin role is purely for platform management.
