# Routing Structure

## Major Route Groups
- Public auth: `/login`, `/forgot-password`, `/reset-password`, `/403`, `/plan-upgrade`.
- Super admin: `/super-admin/*` protected by `SUPER_ADMIN`.
- School admin: `/school-admin/*` protected by `SCHOOL_ADMIN`.
- Teacher: `/teacher/*` protected by `TEACHER`.
- Student: `/student/*` protected by `STUDENT`.
- Parent: `/parent/*` protected by `PARENT`.
- Public site and DSEP routes include demo, investor room, and CloudCampus public website paths.

## Rule
Frontend routes must match backend RBAC but must not be treated as the security boundary.
