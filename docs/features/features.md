### **A. User Experience & Interface Design**

**For the Admin Dashboard:**
*   **a) Single Registration:** For V1, we will focus on a highly-efficient single student registration form. A "Register and Add Another" button will optimize the workflow. **Why:** Bulk/CSV upload adds significant complexity; we can add it in V2 once the core system is proven.
*   **b) Core Admin Features:** The V1 admin dashboard will include: **View All Students** (in a paginated, searchable table) and **Edit Existing Records**. **Why:** Viewing is essential for oversight, and editing is critical for fixing the inevitable data entry typos, especially since we're skipping verification.
*   **c) Single Admin Role:** We will start with one universal "Admin" role. **Why:** Role-Based Access Control (RBAC) is complex. Our initial user base of admins is small and trusted. Supabase's RLS makes it easy to add more granular roles later if needed.

**For the Public "Event Kiosk" Page:**
*   **a) Portrait Mobile-First:** The design will be strictly **portrait mobile-first**. **Why:** Students will be using their phones while standing in line. A focused, vertical layout is the only user-friendly option.
*   **b) Branded QR Code Display:** The QR code will be displayed as part of a simple, downloadable image that includes the **University/Department Logo, the Student's Full Name, and their Student ID Number** below the code. **Why:** This adds professionalism and immediately confirms to the student that the code is theirs, reducing confusion.
*   **c) User-Controlled Dismissal:** The QR code will remain on screen until the user explicitly dismisses it by tapping a **"Done" or "Finish" button**. **Why:** Auto-timeouts create anxiety. Giving the user control ensures they have ample time to screenshot or save the code.

### **B. QR Code & Email Functionality**

**QR Code Details:**
*   **a) Content: Student ID Number Only:** The QR code will contain one piece of data: the student's unique `studentIdNumber`. **Why:** This is the most efficient and secure method. The scanner app will read the ID, query our database for that ID, and get the full, up-to-date student details. It's fast and decouples the QR code from the student data (if a name changes, the code doesn't need to).
*   **b) Static QR Codes:** QR codes will be **static**. **Why:** The QR code acts as a permanent digital ID card for the student within our system. Dynamic codes are for single-use or high-security transactions, which is overkill here.
*   **c) Yes, for Attendance:** The primary purpose of the QR codes is **attendance tracking**.

**Email System:**
*   **a) Informative Email:** The email will contain the same elements as the kiosk success screen: a welcome message, the branded QR code image as an attachment/embedded, and clear instructions.
*   **b) Registration Succeeds on Email Failure:** Registration **will still succeed** even if the email fails to send. **Why:** The source of truth is our database. The email is a secondary notification. We will log the email failure on the backend so an admin can investigate, but the user's registration is complete. This makes the system more resilient.
*   **c) Yes, Different Templates:** We will use two slightly different email templates for clarity: one for "Welcome! You've successfully registered." and another for "An admin has registered an account for you."

### **C. Data Validation & Business Rules**

**Student Data:**
*   **a) Strict Format for studentIdNumber:** We will enforce a pattern (e.g., via regex `^S\d{3}-\d{4}-\d{3}$`) for the `studentIdNumber` on both the frontend and backend. **Why:** This guarantees data consistency and prevents garbage data from entering our system.
*   **b) Basic Email Validation:** We will stick to standard email format validation (e.g., `name@domain.com`). **Why:** Validating against disposable email services is not a primary concern for V1, as students will likely use their official university email.
*   **c) Clear Error Messages for Duplicates:** On duplicate detection, the public form will show a simple, clear message: "This Student ID or Email is already registered. If you believe this is an error, please see an event administrator." The admin form will show a similar message but include a direct link: "View existing record for [Student ID]."

**Program & Year Constraints:**
*   **a) Valid Year Ranges:** Yes, we will validate that the `year` is within a logical range (e.g., 1-5).
*   **b) Scalable Programs:** We will **not** use a Prisma `enum` for programs. Instead, we will create a separate `Program` table in the database. The `Student` table will have a foreign key relationship to it. **Why:** This is a crucial architectural decision. It allows admins to add, edit, or remove programs in the future through the admin dashboard without requiring a new code deployment. It's far more scalable.

### **D. Security & Performance**

**Public Endpoint Security:**
*   **a) Rate Limiting:** We will implement **rate limiting** on the public registration API endpoint. A sensible starting point is **10 requests per minute per IP address**.

*   **b) IP Whitelisting (Optional):** We will build the system so that IP whitelisting for the `/admin` routes can be easily configured as an optional security enhancement.

**Performance & Scale:**
*   **a) Plan for High Volume:** The chosen stack (Vercel/Next.js and Supabase) is serverless and scales automatically, which is ideal for handling event-day spikes. We will design our database queries to be efficient to handle hundreds of registrations per minute.
*   **b) Online Only for V1:** The system will be **online-only**. **Why:** Offline functionality (Progressive Web App features) adds immense complexity and is out of scope for V1. We will operate on the assumption that a basic cellular connection is available at the event venue.

### **E. Success Metrics & Analytics**

**Tracking & Reporting:**
*   **a) Core Metrics to Track:** We will track: **Total Registrations**, **Registrations by Source** (`admin` vs. `public_kiosk`), and a breakdown of students by **Program** and **Year**.
*   **b) Simple Admin Dashboard Stats:** For V1, we will display these core metrics on a simple "Analytics" page within the admin dashboard. These will be near-real-time counts queried directly from the database.
*   **c) Comprehensive Logging:** Yes, the system will **log every registration attempt**, both successful and failed, including the reason for failure (e.g., `duplicate_student_id`, `invalid_email_format`). **Why:** These logs are essential for debugging, security auditing, and understanding user behavior.