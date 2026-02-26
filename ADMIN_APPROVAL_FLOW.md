# Learning Management System: Admin Approval Flow

This document details the process of how a course is reviewed and approved by the administrator, including the financial transaction and state changes.

---

## 1. Discovery (Pending Queue)

### View: `AdminDashboard.jsx`
- **Location**: `src/pages/AdminDashboard.jsx`
- **Data Hook**: On component mount or tab switch, the dashboard fetches pending courses.
- **API Call**: `GET /api/admin/courses/pending`
- **Controller**: `adminController.getPendingCourses`  
  Returns all courses where `status === 'pending'`, populating instructor names for context.

---

## 2. Review & Action

### Reviewing Content
- Admin can click the **"View"** icon to navigate to the live `CourseDetailPage` for that specific course.
- Even in `pending` status, the Admin has full access to view all curriculum, videos, and materials.

### Resolution Buttons
- Located in the "Pending Approval" card for each course:
    - **Approve**: Success path (Green button).
    - **Reject**: Failure path (Red button).

---

## 3. The Approval Execution

When the Admin clicks **"Approve"**:

### A. Frontend Confirmation
- A **SweetAlert2** dialog appears: *"Approve Course? Payment will be released to instructor."*
- Calls `adminService.approveCourse(courseId)`.
- **API Method**: `POST`
- **Endpoint**: `/api/admin/courses/:courseId/approve`

### B. Backend Controller Logic (`adminController.approveCourse`)

1. **Safety Constraints**: Checks if the system already has **5 approved courses**. If the limit is reached, it returns a `400 Bad Request` to maintain platform quality/quota.
2. **Balance Check**: Ensures the **Admin System Balance** has at least **$500.00** to fund the reward.
3. **Double Ledger Update**:
    - **Deduct**: Subtracts $500.00 from the Admin's `bankBalance`.
    - **Credit**: Adds $500.00 to the Instructor's `bankBalance`.
4. **Transaction Logging**:
    - Creates a new `Transaction` record with type `course_upload_reward`.
    - Marks it as `status: 'completed'`.
5. **Course Activation**:
    - Updates `status` to `approved`.
    - Sets `published_at` to the current timestamp.
    - **Result**: The course is now visible to all students in the **Course Marketplace**.

---

## 4. Rejection Logic

If the Admin clicks **"Reject"**:
- **API Endpoint**: `POST /api/admin/courses/:courseId/reject`
- **Effect**: Updates course `status` to `rejected`.
- **Result**: The course remains in the Instructor's dashboard with a "Rejected" tag, allowing them to edit and resubmit. (No funds are exchanged).

---

## 5. Flow Summary Table

| Action | API Route | State Change | Financial Impact |
| :--- | :--- | :--- | :--- |
| **View Pending** | `GET /pending` | No change | None |
| **Approve** | `POST /approve` | `pending` → `approved` | -$500 Admin / +$500 Instructor |
| **Reject** | `POST /reject` | `pending` → `rejected` | None |
| **Delete** | `DELETE /:id` | Permanently removed | None |
