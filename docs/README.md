# CinemaŚty - Cinema Management System

A team project developed as part of a Computer Science degree program. This full-stack web application is designed to provide comprehensive cinema management — from ticket reservation processes to advanced administrative panels and sales analytics.

---

## Team Structure and Roles

| Role | Responsibilities |
| :--- | :--- |
| **Team Leader / Tester** | Work coordination, repository management, functional and acceptance testing. |
| **Backend Developers** | Server architecture, business logic, API development, database integration, security. |
| **Frontend Developers** | View implementation, responsiveness (RWD), integration with the template engine. |
| **UX/UI Designer** | User interface design, reservation system mockups, and seating map layouts. |
| **Database Manager** | Relational database modeling, query optimization, and data consistency. |

---

## Technologies and Architecture

The project focuses on performance and the use of modern development standards.

* **Backend:** Node.js with the Express.js framework.
* **Frontend:** Handlebars (HBS) template engine and Tailwind CSS (modern CSS).
* **Database:** MySQL relational database.
* **Security:** Password hashing using bcrypt.js and session management (Express-Session).
* **Integrations:** PDF ticket generation (PDFKit), QR code generation for verification, and SMTP email notifications (Nodemailer).

---

## System Features

* **Customer Panel:** Browse the current movie lineup, interactively select seats on a theater map (seat/armchair/couch), purchase tickets online, and automatically receive PDF tickets with QR codes via email.
* **Employee Panel:** Handle in-person ticket sales at the box office, verify tickets by scanning QR codes, and generate daily reports (revenue and attendance).
* **Administrator Panel:** Manage the movie and screening database, edit theater seating layouts, and analyze sales statistics.

---

## Documentation

Detailed project documentation, including use case diagrams (UML), activity diagrams, and the development schedule (sprints), can be found in the `/docs` folder of this repository.
