Redesign and rebuild ONLY the Teacher Portal module.

IMPORTANT:
Do NOT modify:
- Super Admin Portal
- School Admin Portal
- Student Portal
- Parent Portal
- Authentication module

Focus ONLY on Teacher Login Portal UI/UX, navigation, workflows, and teacher-related functionality.

GOAL:
Create a premium, enterprise-grade Teacher Portal similar to modern school ERP systems with clean UX, fast workflows, responsive design, and production-level architecture.

====================================================
TEACHER PORTAL NAVIGATION
====================================================

Create modern sidebar navigation for teachers.

Navigation items:

- Dashboard
- Students
- Teachers
- Academic
- Homework
- Timetable
- Attendance
- Fees
- Marks
- Profile

IMPORTANT:
Teacher access should be role-based.

Teachers should only see:
- data related to assigned classes
- assigned subjects
- assigned students

Do NOT expose admin-level controls.

====================================================
SIDEBAR DESIGN REQUIREMENTS
====================================================

Sidebar should be:

- modern
- collapsible
- responsive
- icon-based
- smooth animated transitions
- mobile friendly

Include:

- school logo
- teacher profile card
- notification indicator
- active menu highlight
- quick collapse/expand

Use clean enterprise UI styling.

====================================================
DASHBOARD PAGE
====================================================

Teacher dashboard should show:

====================================================
TOP SUMMARY CARDS
====================================================

- Today's Classes
- Pending Attendance
- Homework Pending Review
- Upcoming Exams
- Student Strength

====================================================
TODAY'S SCHEDULE SECTION
====================================================

Display teacher timetable:

| Time | Class | Subject | Room |
|------|-------|---------|------|

Highlight:
- current period
- upcoming period

====================================================
QUICK ACTIONS
====================================================

Provide buttons:

- Start Attendance
- Add Homework
- Enter Marks
- View Timetable

====================================================
ALERTS & NOTIFICATIONS
====================================================

Show:

- attendance pending alerts
- homework submission alerts
- exam reminders
- student leave requests

====================================================
STUDENTS MODULE
====================================================

Teacher should only access assigned students.

Features:

- class-wise student listing
- search students
- view student profile
- attendance summary
- marks overview
- academic performance

Student profile should include:

- photo
- admission number
- parent details
- attendance %
- marks
- homework status

====================================================
TEACHERS MODULE
====================================================

Teacher can:

- view faculty directory
- contact other teachers
- see department members

Do NOT allow:
- teacher creation
- role management
- salary access

====================================================
ACADEMIC MODULE
====================================================

Features:

- syllabus progress tracking
- lesson planning
- curriculum mapping
- teaching notes
- exam schedules

Teacher should update:
- completed topics
- pending topics
- classroom notes

====================================================
HOMEWORK MODULE
====================================================

Teacher should:

- create homework
- assign by class/section
- set submission deadline
- upload attachments
- review submissions
- mark completed/pending

Features:

- bulk assignment
- rich text editor
- attachment uploads
- homework analytics

====================================================
TIMETABLE MODULE
====================================================

Show:

- daily timetable
- weekly timetable
- upcoming periods
- room allocation

Features:

- color-coded subjects
- responsive calendar layout
- current active period highlight

====================================================
ATTENDANCE MODULE
====================================================

Replace current form-based attendance with enterprise-grade attendance workflow.

====================================================
ATTENDANCE FLOW
====================================================

Teacher should NOT:
- manually select class repeatedly
- manually select date
- search student one by one

System should auto-detect:
- assigned class
- assigned section
- current period
- current date

====================================================
ATTENDANCE SESSION SCREEN
====================================================

Show:

- class
- section
- subject
- teacher name
- date
- period
- attendance window
- countdown timer

====================================================
ATTENDANCE TABLE
====================================================

Use attendance sheet/grid UI.

Columns:

- Roll Number
- Student Photo
- Student Name
- Attendance Status
- Remarks

Statuses:

- Present
- Absent
- Late
- Medical Leave
- Excused
- Sports Duty

====================================================
IMPORTANT DEFAULT LOGIC
====================================================

All students should automatically be marked PRESENT by default.

Teacher only changes exceptions.

====================================================
BULK ACTIONS
====================================================

Add:

- Mark All Present
- Mark All Absent
- Copy Yesterday Attendance
- Reset Attendance

====================================================
AUTO SAVE
====================================================

Implement draft auto-save every 5–10 seconds.

Show:
✅ Draft Saved

====================================================
TIME LIMIT SYSTEM
====================================================

Attendance submission allowed only within configured time window.

Example:
8:00 AM → 8:20 AM

After expiry:
- attendance locks
- submit disabled
- teacher can request override

====================================================
POST SUBMISSION
====================================================

After submit:

Show summary:

✅ Attendance Submitted Successfully

Present: 42
Absent: 3
Late: 1

Lock attendance after submission.

====================================================
MONTHLY ATTENDANCE VIEW
====================================================

Provide monthly attendance matrix/grid.

====================================================
FEES MODULE
====================================================

Teacher access should be READ ONLY.

Teacher can:

- view fee status
- check fee defaulters
- identify students with pending dues

Do NOT allow:
- fee collection
- payment editing
- transaction modification

====================================================
MARKS MODULE
====================================================

Teacher should:

- enter marks
- edit marks
- upload exam scores
- generate result summaries

Features:

- subject-wise marks entry
- grade calculation
- remarks
- bulk upload
- exam filters

====================================================
PROFILE MODULE
====================================================

Teacher profile should include:

- profile photo
- employee ID
- department
- subjects handled
- assigned classes
- contact details

Allow teacher to:
- update password
- update profile picture
- manage notification preferences

====================================================
GLOBAL UX REQUIREMENTS
====================================================

Use:

- clean enterprise UI
- modern cards
- soft shadows
- rounded corners
- professional typography
- smooth animations
- responsive layouts
- loading skeletons
- empty states
- optimized tables

Avoid:

- cluttered admin UI
- excessive forms
- multiple unnecessary clicks
- page reloads
- outdated styling

====================================================
RESPONSIVE DESIGN
====================================================

Fully optimize for:

- desktop
- laptop
- tablet
- mobile devices

Sidebar should collapse properly on small screens.

====================================================
PERFORMANCE REQUIREMENTS
====================================================

Optimize for:

- large datasets
- low internet schools
- fast page load
- minimal API calls
- scalable architecture

Use:
- lazy loading
- pagination
- optimistic updates
- efficient state management

====================================================
SECURITY & ACCESS CONTROL
====================================================

Teachers should only access:
- assigned classes
- assigned students
- assigned subjects

Implement:
- role-based access
- API authorization
- audit logs
- secure validations

====================================================
FINAL EXPERIENCE GOAL
====================================================

The Teacher Portal should feel like a premium modern ERP platform.

Experience should focus on:

- speed
- simplicity
- minimal effort
- operational efficiency
- teacher productivity

The portal should feel polished, scalable, and enterprise-grade.