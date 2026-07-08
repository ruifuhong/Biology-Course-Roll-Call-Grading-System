# Biology Course Rollcall System

A MERN and PostgreSQL-powered platform built to simplify course management workflows, replacing traditional, error-prone spreadsheets with high-level automation and integration.

## Deployed URL
[https://biology-attendence-new-static-frontend.onrender.com](https://biology-attendence-new-static-frontend.onrender.com)

## System Architecture
<img width="1975" height="1385" alt="SystemArchitecture" src="https://github.com/user-attachments/assets/c930dfc7-a4f6-4100-8896-05acb5834fee" />

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

## Technical Articles on Medium

- [身為一名懶助教，我打造了全自動化點名評分系統！As a Lazy TA, I Developed a Fully Automated Roll-Call & Grading System!](https://medium.com/@ralph-tech/中英雙語-zh-en-bilingual-身為一名懶助教-我打造了全自動化點名評分系統-as-a-lazy-ta-i-developed-a-fully-automated-roll-call-7b6533b5c891)
- [點名評分系統第一篇：建立 MERN + PostgreSQL 環境 Roll-Call & Grading System Part 1: Setting up the MERN + PostgreSQL Environment](https://medium.com/@ralph-tech/%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E-zh-en-bilingual-%E9%BB%9E%E5%90%8D%E8%A9%95%E5%88%86%E7%B3%BB%E7%B5%B1%E7%AC%AC%E4%B8%80%E7%AF%87-%E5%BB%BA%E7%AB%8B-mern-postgresql-%E7%92%B0%E5%A2%83-roll-call-grading-system-part-1-setting-9e6983445a06)
- [點名評分系統第二篇：加上 NoSQL 資料庫 Roll-Call & Grading System Part 2: Adding NoSQL Database](https://medium.com/@ralph-tech/%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E-zh-en-bilingual-%E9%BB%9E%E5%90%8D%E8%A9%95%E5%88%86%E7%B3%BB%E7%B5%B1%E7%AC%AC%E4%BA%8C%E7%AF%87-%E5%8A%A0%E4%B8%8A-nosql-%E8%B3%87%E6%96%99%E5%BA%AB-roll-call-grading-system-part-2-add-nosql-database-033eac831df9)
- [點名評分系統第三篇：部署 Roll-Call & Grading System Part 3: Deployment](https://medium.com/@ralph-tech/%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E-zh-en-bilingual-%E9%BB%9E%E5%90%8D%E8%A9%95%E5%88%86%E7%B3%BB%E7%B5%B1%E7%AC%AC%E4%B8%89%E7%AF%87-%E9%83%A8%E7%BD%B2-roll-call-grading-system-part-3-deployment-f2e0985a2cea)
- [點名評分系統第四篇：改寫為 MVC 模式 Roll-Call & Grading System Part 4: Refactoring to MVC Pattern](https://medium.com/@ralph-tech/%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E-zh-en-bilingual-%E9%BB%9E%E5%90%8D%E8%A9%95%E5%88%86%E7%B3%BB%E7%B5%B1%E7%AC%AC%E5%9B%9B%E7%AF%87-%E6%94%B9%E5%AF%AB%E7%82%BA-mvc-%E6%A8%A1%E5%BC%8F-roll-call-grading-system-part-4-refactoring-to-mvc-f021da031840)
- [點名評分系統第五篇：建立基本 CRUD 功能 Roll-Call & Grading System Part 5: Establishing Basic CRUD Functionality](https://medium.com/@ralph-tech/%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E-zh-en-bilingual-%E9%BB%9E%E5%90%8D%E8%A9%95%E5%88%86%E7%B3%BB%E7%B5%B1%E7%AC%AC%E4%BA%94%E7%AF%87-%E5%BB%BA%E7%AB%8B%E5%9F%BA%E6%9C%AC-crud-%E5%8A%9F%E8%83%BD-roll-call-grading-system-part-5-establishing-basic-eea8878fe4c1)
- [點名評分系統第六篇：以 MongoDB 加上選填的課程回饋功能 Roll-Call & Grading System Part 6: Optional Session Feedback Feature with MongoDB](https://medium.com/@ralph-tech/%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E-zh-en-bilingual-%E9%BB%9E%E5%90%8D%E8%A9%95%E5%88%86%E7%B3%BB%E7%B5%B1%E7%AC%AC%E5%85%AD%E7%AF%87-%E4%BB%A5-mongodb-%E5%8A%A0%E4%B8%8A%E9%81%B8%E5%A1%AB%E7%9A%84%E8%AA%B2%E7%A8%8B%E5%9B%9E%E9%A5%8B%E5%8A%9F%E8%83%BD-roll-call-grading-system-part-6-optional-809c5905dcd9)
- [點名評分系統第七篇：權限管理 Roll-Call & Grading System Part 7: Permission Management](https://medium.com/@ralph-tech/%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E-zh-en-bilingual-%E9%BB%9E%E5%90%8D%E8%A9%95%E5%88%86%E7%B3%BB%E7%B5%B1%E7%AC%AC%E4%B8%83%E7%AF%87-%E6%AC%8A%E9%99%90%E7%AE%A1%E7%90%86-roll-call-grading-system-part-7-permission-management-4be056f854c1)
- [點名評分系統第八篇：以 Google OAuth 實現第三方登入登出 Roll-Call & Grading System Part 8: Implementation of Third-party Login and Logout via Google OAuth](https://medium.com/@ralph-tech/%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E-zh-en-bilingual-%E9%BB%9E%E5%90%8D%E8%A9%95%E5%88%86%E7%B3%BB%E7%B5%B1%E7%AC%AC%E5%85%AB%E7%AF%87-%E4%BB%A5-google-oauth-%E5%AF%A6%E7%8F%BE%E7%AC%AC%E4%B8%89%E6%96%B9%E7%99%BB%E5%85%A5%E7%99%BB%E5%87%BA-roll-call-grading-system-part-8-2f59bbb79f92)
- [點名評分系統第九篇：組內&組間互評 Roll-Call & Grading System Part 9: Intra-group and Inter-group Peer Assessment](https://medium.com/@ralph-tech/%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E-zh-en-bilingual-%E9%BB%9E%E5%90%8D%E8%A9%95%E5%88%86%E7%B3%BB%E7%B5%B1%E7%AC%AC%E4%B9%9D%E7%AF%87-%E7%B5%84%E5%85%A7-%E7%B5%84%E9%96%93%E4%BA%92%E8%A9%95-roll-call-grading-system-part-9-intra-group-and-4e491bb5a62a)
- [點名評分系統第十篇：倒數計時功能 Roll-Call & Grading System Part 10: Countdown](https://medium.com/@ralph-tech/%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E-zh-en-bilingual-%E9%BB%9E%E5%90%8D%E8%A9%95%E5%88%86%E7%B3%BB%E7%B5%B1%E7%AC%AC%E5%8D%81%E7%AF%87-%E5%80%92%E6%95%B8%E8%A8%88%E6%99%82%E5%8A%9F%E8%83%BD-roll-call-grading-system-part-10-countdown-039572dd9f1b)
- [點名評分系統第十一篇：用 WebSocket 實現不重新整理也能更新畫面 Roll-Call & Grading System Part 11: Implementing Real-time UI Updates without Page Refreshes Using WebSocket](https://medium.com/@ralph-tech/%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E-zh-en-bilingual-%E9%BB%9E%E5%90%8D%E8%A9%95%E5%88%86%E7%B3%BB%E7%B5%B1%E7%AC%AC%E5%8D%81%E4%B8%80%E7%AF%87-%E7%94%A8-websocket-%E5%AF%A6%E7%8F%BE%E4%B8%8D%E9%87%8D%E6%96%B0%E6%95%B4%E7%90%86%E4%B9%9F%E8%83%BD%E6%9B%B4%E6%96%B0%E7%95%AB%E9%9D%A2-roll-call-grading-system-part-11-8252bfced9e7)
- [點名評分系統第十二篇：工具與服務方案的選擇 Roll-Call & Grading System Part 12: Choice of Tools and Service Plans](https://medium.com/@ralph-tech/%E4%B8%AD%E8%8B%B1%E9%9B%99%E8%AA%9E-zh-en-bilingual-%E9%BB%9E%E5%90%8D%E8%A9%95%E5%88%86%E7%B3%BB%E7%B5%B1%E7%AC%AC%E5%8D%81%E4%BA%8C%E7%AF%87-%E5%B7%A5%E5%85%B7%E8%88%87%E6%9C%8D%E5%8B%99%E6%96%B9%E6%A1%88%E7%9A%84%E9%81%B8%E6%93%87-roll-call-grading-system-part-12-choice-of-tools-424ecec7e1cb)

## Future Work

1. Implement unit, integration, and end-to-end (E2E) tests across all core modules to ensure system reliability and stability.
2. Optimize the codebase for better separation of concerns (SoC) and clean code principles to enhance maintainability and reduce technical debt.
3. Add the scoring module for Final Presentation.
4. Harden resilience for edge cases, such as high-volume submissions, intermittent network loss, potential race conditions.
5. Strengthen JWT flows by introducing two-factor authentication plus self-service password reset/forgot password flows.
