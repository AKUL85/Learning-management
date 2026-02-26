# Learning Management System: Course Creation Flow

This document details the step-by-step process of how a course is created in our LMS, from the frontend interface to the backend storage and database interactions.

---

## 1. Frontend Interaction (UI)

### Trigger Component: `InstructorDashboard.jsx`
- **Location**: `src/pages/InstructorDashboard.jsx`
- **Function**: The instructor triggers the process by clicking the **"Create New Course"** button. This sets `showCreateModal` to `true`.

### Input Component: `CreateCourseModal.jsx`
- **Location**: `src/components/dashboard/CreateCourseModal.jsx`
- **Responsibility**: Provides a multi-part form to collect:
    - **Basic Info**: Title, Description, Price.
    - **Media**: Thumbnail Image, Introductory Video.
    - **Materials**: Downloadable files (PDF, ZIP, etc.).
    - **Curriculum**: MCQs (Multiple Choice) and CQs (Creative Questions).
- **Data Handling**: Uses local state (`newCourse`) to track inputs. Files are stored as `File` objects from input elements.

---

## 2. Request Initiation (API Call)

### Submission Handler: `createCourse` in `InstructorDashboard.jsx`
When the "CREATE COURSE" button is clicked:
1. **Validation**: Checks for required fields (Title, Description, Price, Image, Video).
2. **Form Data Construction**:
    - Uses `FormData` because the request includes multiple files.
    - `formData.append('image', newCourse.image)`
    - `formData.append('video', newCourse.video)`
    - `formData.append('materials', file)` (Handles multiple files).
    - Other JSON data like MCQs and CQs are stringified before appending.
3. **HTTP Call**:
    - **Method**: `POST`
    - **Endpoint**: `/api/courses/`
    - **Credentials**: `include` (for session/cookie authentication).

---

## 3. Backend Routing & Middleware

### Route Configuration: `routes/course.js`
- **Endpoint**: `POST /api/courses/`
- **Middleware Chain**:
    1. `auth`: Validates the user's JWT/session.
    2. `uploadCourseFiles`: A `multer` middleware that parses the multipart form data and saves files to temporary storage.
    3. `courseController.createCourse`: The final controller handling the logic.

---

## 4. Backend Processing (`courseController.js`)

The `createCourse` function executes the following sequence:

### A. Authorization & Cleanup
- Verifies the user's profile and confirms they have the `instructor` role.
- If validation fails, `cleanupFiles` is called to delete any temporary Multer uploads.

### B. Media Processing (Cloudinary)
- **Thumbnail Image**: Uploaded to Cloudinary in the `teaching_app/images` folder.
- **Intro Video**: Uploaded to Cloudinary in the `teaching_app/videos` folder (with `resource_type: "video"`).

### C. Materials Processing (Local Storage)
- Unlike media, materials are stored locally on the server at `uploads/materials/`.
- A unique filename is generated (`Date.now() + randomString`) to prevent collisions.
- The metadata (original title, size, URL) is saved in the database.

### D. Data Assembly
- MCQs and CQs are parsed back from JSON strings into objects.
- An initial `content` section is created containing the introductory video.

### E. Database Persistence (`Course` Model)
- A new `Course` document is created with a default status of **`pending`**.
- References the instructor's profile ID and name.
- **Save**: The course is saved to the MongoDB collection.

---

## 5. Storage Summary

| Asset Type | Storage Location | URL Scheme |
| :--- | :--- | :--- |
| **Thumbnail** | Cloudinary (Image) | `https://res.cloudinary.com/...` |
| **Intro Video** | Cloudinary (Video) | `https://res.cloudinary.com/...` |
| **Materials** | Local filesystem | `/api/courses/materials/:id/download` |
| **Data** | MongoDB Atlas | `Course` Collection |

---

## 📝 Developer Note: Reward System Discrepancy
There are currently two paths for course creation in the codebase:
1. **`/api/courses`** (`courseController.js`): Standard creation path.
2. **`/api/instructor/course`** (`instructorController.js`): Creation path that includes the **$500 reward system** (Transactions and Balance updates).

The `InstructorDashboard.jsx` is currently calling the first path, but the UI message mentions a reward. It is recommended to unify these or ensure the correct path is called to match the user's reward expectations.
