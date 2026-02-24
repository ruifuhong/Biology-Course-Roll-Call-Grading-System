# Biology Course Rollcall System

A MERN and PostgreSQL-powered platform built to simplify course management workflows, replacing traditional, error-prone spreadsheets with high-level automation and integration.

## Deployed URL
[https://biology-attendence-new-static-frontend.onrender.com](https://biology-attendence-new-static-frontend.onrender.com)

## Description
This project is built to reduce the time and effort for repetitive manual tasks during my time as the course TA.

- *Challenges for a TA of the Biology Course Before this System:*
  - **Operational Overhead**: Required manual creation of new Google Sheets for attendance and peer-scoring for every single session.
  - **Manual Computation**: Aggregating intra-group and inter-group peer reviews required manual spreadsheet handling and calculations, increasing the risks of human error.
  - **Scalability Limitation**: Lack of system reusability necessitated a labor-intensive manual system rebuild at the start of every semester.
  - **Data Integrity Risk**: Error-prone due to lack of validations, allowing invalid submissions such as dual submissions and off-window attendances, compromising data accuracy and requiring extensive manual corrections.

- *Solutions from this System*:
  - **Automated Session Management**: Engineered a dynamic scheduling engine where TAs only configure session dates, transforming hours of repetitive manual data entry per session into a single, minute-long setup for the entire semester.
  - **Dynamic Peer-Review Page**: Architected a personalized scoring engine that achieved 100% workflow automation, eliminating the need for manual form creation and recurring edits for intra/inter-group evaluations per session.
  - **Instant Analytics Pipeline**: Adopted automated attendance and score calculations, replacing the hour-long manual calculation process with instant, submission-triggered results.
  - **Long-term Operational Scalability**: Developed a reusable framework that supports infinite semester cycles, saving days of pre-course infrastructure preparation by removing the historical requirement for total manual environment resets.
  - **Strict Integrity Constraints**: Implemented robust validation in both frontend and backend to enforce 100% attendance and scoring data accuracy, reducing post-session manual data cleaning to zero.

## Features

* **Student-Facing**
  - Enforces time-restricted attendance submission within valid lecture and discussion class windows.
  - Auto-populates profile details (name and department) upon student ID entry to minimize input effort and manual errors.
  - Supports optional feedback submissions for both lectures and discussion classes.
  - Generates a tailored peer-review interface that presents each reviewer with their specific intra/inter-group reviewees instantly.
  - Validates scoring eligibility by cross-referencing attendance records, ensuring only present students can participate in the review process.
  - Blocks redundant submissions of attendance and scores to maintain data consistency.

* **Admin-Facing (Lecturers and TAs)**
  - Integrates dual authentication supporting both Google OAuth and traditional JWT methods.
  - Leverages Socket.IO to broadcast real-time attendance status, enabling instant session control (Open/Closed/Late) across all student devices.
  - Centralizes student, session, and TA management (lecturer-only) within a unified administrative dashboard.
  - Streamlines semester-specific student list updates and scheduling.
  - Provides instant access to attendance logs, student feedback, and individual/group scores, eliminating all manual calculations.
  - Optimizes user experience through state persistence for semesters and active tabs, maintaining user selections across page refreshes.

## Tech Stack

- Frontend: React (Vite, React Router)
- Backend: Node.js/Express (MVC), Socket.IO, REST APIs
- Database: PostgreSQL (sessions, attendance, scores, students, users), MongoDB (feedbacks)
- Containerization: Docker
- Authentication: Google OAuth + JWT
- Deployment: Render (frontend, backend, and PostgreSQL), MongoDB Atlas (MongoDB)

# Technical Articles:

- [身為一名懶助教，我打造了全自動化點名評分系統！As a Lazy TA, I Developed a Fully Automated Roll-Call & Grading System!](https://medium.com/@ralph-tech/中英雙語-zh-en-bilingual-身為一名懶助教-我打造了全自動化點名評分系統-as-a-lazy-ta-i-developed-a-fully-automated-roll-call-7b6533b5c891)

## Future Work

1. Implement unit, integration, and end-to-end (E2E) tests across all core modules to ensure system reliability and stability.
2. Optimize the codebase for better separation of concerns (SoC) and clean code principles to enhance maintainability and reduce technical debt.
3. Add the scoring module for Final Presentation.
4. Harden resilience for edge cases, such as high-volume submissions, intermittent network loss, potential race conditions.
5. Strengthen JWT flows by introducing two-factor authentication plus self-service password reset/forgot password flows.