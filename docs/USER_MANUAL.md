# ETEEAP Gateway — User Manual

> **Version:** 1.0  
> **Last Updated:** April 17, 2026  
> **Platform:** Web-based (desktop & mobile)  
> **Institution:** Asian Development Foundation College (ADFC)

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Applicant Guide](#2-applicant-guide)
3. [Evaluator Guide](#3-evaluator-guide)
4. [Admin Guide](#4-admin-guide)
5. [Common Features](#5-common-features)
6. [Frequently Asked Questions](#6-frequently-asked-questions)

---

## 1. Getting Started

### 1.1 About the System

ETEEAP Gateway is a web-based Portfolio & Evaluation System designed for the Expanded Tertiary Education Equivalency and Accreditation Program (ETEEAP) at Asian Development Foundation College. It streamlines the process of portfolio submission, expert evaluation, and accreditation tracking.

The system has three user roles:
- **Applicant** — Individuals applying for ETEEAP accreditation
- **Evaluator** — Subject matter experts who review and score applicant portfolios
- **Admin** — System administrators who manage users, portfolios, rubrics, and overall operations

### 1.2 Creating Your Account

1. Open the ETEEAP Gateway website in your browser
2. Click **Get Started** on the landing page (or **Register** on the login page)
3. Fill in the registration form:
   - **Name** — Your full name
   - **Email** — A valid email address (this will be your login)
   - **Password** — A secure password
   - **Confirm Password** — Re-enter your password
4. Click **Register** to create your account
5. Check your email for a **verification link** and click it to verify your account

> **Note:** All self-registered accounts are assigned the **Applicant** role by default. Evaluator and Admin accounts can only be created by an administrator.

### 1.3 Logging In

1. Go to the ETEEAP Gateway website
2. Click **Log in**
3. Enter your **Email** and **Password**
4. Optionally check **Remember me** to stay logged in
5. Click **Log in**
6. You will be redirected to your role-specific **Dashboard**

> **Note:** Login is rate-limited to 5 attempts per minute for security.

### 1.4 Forgot Password

1. On the login page, click **Forgot your password?**
2. Enter the **email address** associated with your account
3. Click **Email Password Reset Link**
4. Check your email for a reset link
5. Click the link and enter your **new password**
6. Confirm your new password and click **Reset Password**

### 1.5 Email Verification

After registering, you must verify your email before accessing most features:

1. Check your inbox for a verification email
2. Click the **verification link** in the email
3. If you didn't receive the email, click **Resend verification email** on the verification page

> **Note:** You cannot access protected features (portfolios, evaluations, etc.) until your email is verified.

### 1.6 Two-Factor Authentication (Optional)

For extra security, you can enable Two-Factor Authentication (2FA):

1. Go to **Settings** → **Two-Factor Authentication**
2. Confirm your password when prompted
3. Click **Enable 2FA**
4. Scan the **QR code** with an authenticator app (e.g., Google Authenticator, Microsoft Authenticator)
   - Alternatively, use the **manual setup key** (click to copy)
5. Enter the **6-digit code** from the app to confirm setup
6. **Save your 8 recovery codes** in a safe place — each code can only be used once

When 2FA is enabled, you'll be asked for a code from your authenticator app each time you log in. If you lose access to your authenticator app, you can use a recovery code instead.

---

## 2. Applicant Guide

### 2.1 Dashboard

After logging in, your Applicant Dashboard shows:

**Stat cards at a glance:**
- **Total Portfolios** — Count of all your portfolios
- **Under Review** — Number of portfolios currently submitted or under review
- **Approved** — Number of portfolios that have been approved
- **Needs Attention** — Number of draft or revision-requested portfolios requiring your action

**Portfolio Status Breakdown:**
- A card displaying counts for each portfolio status with color-coded badges:
  - Draft (gray), Submitted (blue), Under Review (indigo), Evaluated (purple), Revision Requested (amber), Approved (green), Rejected (red)

**Recent Portfolios:**
- Up to 3 of your most recent portfolios showing title, status, document count, and last updated time
- Quick link to "View All Portfolios"

**Recent Notifications:**
- Up to 5 recent notifications with title, message, and time indicator
- Unread notifications marked with a blue dot
- Quick link to "View All Notifications"

### 2.2 Creating a Portfolio

1. Click **My Portfolios** in the sidebar
2. Click **New Portfolio** (top-right)
3. Enter a **Title** for your portfolio (e.g., "BSIT Portfolio - 2026")
4. Click **Create Portfolio**
5. You will be redirected to the portfolio detail page to start uploading documents

### 2.3 Uploading Documents

Your portfolio requires documents organized by categories. There are 11 document categories, 7 of which are **required**:

**Required Categories:**
- CV / Resume
- Diploma / Degree
- Transcript of Records (TOR)
- Employment Records / COE
- Work Samples / Portfolio Evidence
- PSA Birth Certificate
- 2x2 ID Photos
- Statement of Purpose

**Optional Categories:**
- Professional Certifications
- Training Certificates
- Character References

**To upload a document:**

1. Open your portfolio by clicking on it from the portfolios list
2. Find the document category you want to upload to
3. Click the file input under that category
4. Select a file from your computer
   - **Accepted formats:** PDF, DOC, DOCX, JPG, JPEG, PNG
   - **Maximum file size:** 10 MB
5. Optionally add **Notes** about the document (up to 500 characters)
6. Click **Upload**

**Progress Tracking:**
- A progress bar shows how many required categories have at least one document uploaded
- Categories with uploaded documents display a green checkmark
- Required categories are marked with a red "Required" badge

**Document Actions:**
- **Preview** — Click the eye icon to preview the document in a dialog
- **Download** — Click the download icon to save the file locally
- **Delete** — Click the trash icon to remove a document (only available for draft or revision-requested portfolios)

### 2.4 Submitting Your Portfolio

Once all required documents are uploaded:

1. Open your portfolio
2. Verify the progress bar shows 100% completion for required documents
3. Click **Submit Portfolio**
4. A confirmation dialog will appear — note that you will not be able to make changes until it is reviewed
5. Click **Submit** to confirm

Your portfolio status will change from **Draft** to **Submitted**, and all administrators will be notified.

> **Important:** You cannot submit your portfolio until all required document categories have at least one document uploaded.

### 2.5 Portfolio Progress Timeline

Each portfolio displays a visual timeline showing its journey through the evaluation process:

**Normal Flow:**
1. **Draft** — Portfolio created, documents being uploaded
2. **Submitted** — Portfolio submitted for review
3. **Under Review** — Evaluators assigned and reviewing
4. **Evaluated** — Evaluation completed
5. **Approved** — Portfolio approved for accreditation

**Revision Flow:**
- If revisions are requested, the timeline adjusts to show the revision loop
- An amber alert displays admin feedback about what needs to be changed
- You can upload new documents and resubmit

**Rejected State:**
- A red alert indicates the portfolio has been rejected
- Contact administration for further details

### 2.6 Viewing Evaluation Results

Once an evaluator completes their evaluation, you can view the results:

1. Open your portfolio from the portfolios list
2. Scroll down to the **Evaluation Results** section
3. For each completed evaluation, you will see:
   - **Evaluator name** and submission date
   - **Recommendation** badge (Approved, Revision, or Rejection)
   - **Overall Score** — Total score out of maximum (with percentage and color-coded progress bar)
   - **Criteria Breakdown** — Individual scores for each rubric criterion with comments
   - **Evaluator Comments** — Overall feedback from the evaluator

**Score Color Coding:**
- Green — 75% and above
- Amber — 50% to 74%
- Red — Below 50%

### 2.7 Managing Portfolios

**Editing a Portfolio:**
- You can update the portfolio title when the status is **Draft** or **Revision Requested**

**Deleting a Portfolio:**
- You can only delete portfolios in **Draft** status
- Click the **Delete** button on the portfolios list
- Confirm the deletion in the dialog

**Resubmitting After Revision:**
- If your portfolio status is **Revision Requested**, review the admin's feedback
- Upload additional or corrected documents as needed
- Click **Submit Portfolio** to resubmit

---

## 3. Evaluator Guide

### 3.1 Dashboard

Your Evaluator Dashboard provides an overview of your assignments:

**Stat cards at a glance:**
- **Total Assignments** — Count of all portfolios assigned to you
- **Pending Reviews** — Number of pending and in-progress assignments
- **Completed** — Number of evaluations you have completed

**Pending Reviews:**
- Up to 5 pending or in-progress assignments showing:
  - Portfolio title and applicant name
  - Status badge (Pending / In Progress)
  - Due date (highlighted in red if overdue)
  - **Review** button to go directly to the evaluation

**Recent Notifications:**
- Up to 5 recent notifications with unread indicators

### 3.2 Assigned Reviews

View all portfolios assigned to you for evaluation:

1. Click **Assigned Reviews** in the sidebar
2. Browse your assignments (paginated, 10 per page)
3. Each assignment card shows:
   - Portfolio title (clickable)
   - Applicant name
   - Portfolio status and assignment status badges
   - Document count
   - Due date (shown in red if overdue)
   - Assignment date
   - **Review** button

**Assignment Statuses:**
- **Pending** — Not yet started
- **In Progress** — Evaluation draft saved
- **Completed** — Evaluation submitted

### 3.3 Reviewing a Portfolio

1. Click **Review** on an assignment from the list or dashboard
2. The review page displays:
   - **Portfolio information** — Title, applicant name and email, status badges, due date
   - **Admin Notes** — Any instructions from the administrator (shown in an amber alert)

**Document Review (Left Column):**
- **Required Documents Progress** — Progress bar showing how many required categories the applicant has uploaded
- **Documents by Category** — Documents grouped by category, each showing:
  - Category name with Required/Optional badge
  - Green checkmark if documents are uploaded
  - File details: name, size, MIME type
  - **Preview** and **Download** buttons for each file
  - Amber alert if a required document is missing

### 3.4 Scoring & Evaluation

**Evaluation Form (Right Column):**

The evaluation uses standardized rubric criteria (6 criteria, 100 total points by default):

| Criteria | Max Score |
|---|---|
| Completeness of Documentation | 20 |
| Relevance of Work Experience | 25 |
| Quality of Work Samples | 20 |
| Professional Growth & Development | 15 |
| Statement of Purpose | 10 |
| Character References | 10 |

**For each criterion:**
1. Enter a **Score** (0 to the maximum for that criterion)
2. Optionally add **Comments** specific to that criterion (up to 1,000 characters)

**Running Total:**
- A live total is displayed at the bottom showing your current score out of the maximum

**Overall Comments:**
- Enter your overall assessment comments (up to 5,000 characters)
- **Required** for submission, optional for draft saves

**Recommendation:**
- Select one from the dropdown:
  - **Approve** — Recommend approval
  - **Request Revision** — Recommend revisions
  - **Reject** — Recommend rejection
- **Required** for submission, optional for draft saves

### 3.5 Saving and Submitting Evaluations

**Save Draft:**
- Click **Save Draft** to save your progress without submitting
- Your assignment status changes to **In Progress**
- You can return later to continue scoring

**Submit Evaluation:**
- Click **Submit Evaluation** when ready
- A confirmation dialog appears: "This action cannot be undone once submitted."
- Click **Submit Evaluation** to confirm
- Your assignment status changes to **Completed**
- The portfolio status updates to **Evaluated**
- Notifications are sent to the applicant and all administrators

> **Important:** Once submitted, an evaluation cannot be edited.

### 3.6 Viewing Submitted Evaluations

After submitting, the evaluation form changes to a read-only summary showing:
- Score for each criterion with comments
- Total score with percentage
- Overall comments
- Recommendation badge

---

## 4. Admin Guide

### 4.1 Dashboard

The Admin Dashboard provides a system-wide overview:

**Stat cards at a glance:**
- **Total Portfolios** — All portfolios in the system
- **Applicants** — Number of applicant accounts
- **Evaluators** — Number of evaluator accounts
- **Needs Assignment** — Submitted portfolios without assigned evaluators (highlighted in orange if > 0)

**Portfolio Status Breakdown:**
- Clickable status cards showing counts for each portfolio status
- Clicking a status redirects to the filtered portfolio list

**Recent Submissions:**
- 5 most recently submitted portfolios (excluding drafts)
- Shows portfolio title, applicant name, status badge, and time since submission
- Click to view portfolio details

**Evaluator Workload:**
- Table of all evaluators showing:
  - Evaluator name and email
  - Active assignments count (Pending + In Progress)
  - Completed assignments count

### 4.2 User Management

#### Viewing Users

1. Click **Manage Users** in the sidebar
2. See a paginated list (15 per page) of all users with:
   - Name
   - Email
   - Role (color-coded badge: Admin, Evaluator, Applicant)
   - Date created
   - Edit and Delete action buttons

#### Creating a User

1. Click **Create User**
2. Fill in:
   - **Name** — Full name
   - **Email** — Valid email address
   - **Password** — Account password
   - **Confirm Password** — Re-enter password
   - **Role** — Select Admin, Evaluator, or Applicant
3. Click **Create User**

> **Note:** This is the only way to create Evaluator and Admin accounts.

#### Editing a User

1. Find the user in the list and click **Edit** (pencil icon)
2. Update the **Name**, **Email**, or **Role**
3. Click **Update User**

> **Note:** Passwords cannot be changed from the edit form. Users must change their own passwords via Settings.

#### Deleting a User

1. Find the user and click **Delete** (trash icon)
2. Confirm the deletion in the dialog

> **Warning:** You cannot delete your own account. Deleting a user permanently removes their account and all associated data.

### 4.3 Portfolio Management

#### Viewing Portfolios

1. Click **Manage Portfolios** in the sidebar
2. Browse all portfolios in a paginated table (15 per page)
3. **Search** by applicant name, email, or portfolio title
4. **Filter** by status using the dropdown (All Statuses, Draft, Submitted, Under Review, Evaluated, Revision Requested, Approved, Rejected)

Each row shows:
- Applicant name and email
- Portfolio title
- Status badge
- Submission date
- Number of assigned evaluators
- **View** button

#### Viewing Portfolio Details

1. Click **View** (eye icon) on any portfolio
2. The detail page shows:

**Left Column — Portfolio Content:**
- Applicant information (name, email)
- Portfolio status and submission date
- **Document Completion Progress** — Progress bar showing required vs. completed categories
- Admin notes (if any)
- **Documents by Category** — All uploaded documents grouped by category with preview and download options
- **Evaluation Results** — Completed evaluations with full score breakdowns, criteria scores, comments, and recommendations

**Right Column — Admin Controls:**

#### Assigning Evaluators

1. In the **Evaluator Assignments** card, select an **Evaluator** from the dropdown
2. Optionally set a **Due Date** for the evaluation
3. Optionally add **Notes/Instructions** for the evaluator
4. Click **Assign Evaluator**
5. The portfolio status automatically changes to **Under Review**
6. The evaluator receives a notification about the assignment

**Current Assignments:**
- Each assignment card shows: evaluator name/email, status badge, assigned date, due date, assigned by, and notes
- Click the trash icon to remove an assignment

#### Updating Portfolio Status

1. In the **Update Status** card, select a new status:
   - **Under Review** — Portfolio is being evaluated
   - **Revision Requested** — Applicant must revise and resubmit
   - **Approved** — Portfolio approved for accreditation
   - **Rejected** — Portfolio rejected
2. Optionally add **Admin Notes** (visible to the applicant, especially useful for revision requests)
3. Click **Update Status**
4. The applicant receives a notification about the status change

### 4.4 Rubric Criteria Management

Manage the evaluation rubric criteria used by evaluators:

1. Click **Rubric Criteria** in the sidebar
2. View the ordered list of all criteria with:
   - Sort order
   - Name
   - Description (truncated)
   - Maximum score
   - Active/Inactive status badge
   - **Total Max Score** displayed in the footer row

#### Creating a Criterion

1. Click **Create Criteria**
2. Fill in:
   - **Name** — Criterion name (e.g., "Quality of Work Samples")
   - **Description** — Optional description explaining the criterion
   - **Max Score** — Maximum points for this criterion (default: 10)
   - **Sort Order** — Display order (default: 0)
3. Click **Create Criteria**

#### Editing a Criterion

1. Click **Edit** (pencil icon) on a criterion
2. Update the name, description, max score, or sort order
3. Click **Update Criteria**

#### Toggling Active/Inactive

- Click **Activate** or **Deactivate** on a criterion
- Inactive criteria will not appear in the evaluation form

#### Deleting a Criterion

- Click **Delete** (trash icon)
- **Cannot delete** criteria that have been used in evaluations (button is disabled)
- Confirm the deletion in the dialog

### 4.5 Document Category Management

Manage the document categories that applicants upload to:

1. Click **Document Categories** in the sidebar
2. View the ordered list of all categories with:
   - Sort order
   - Name
   - Description (truncated)
   - Required/Optional badge
   - Document count (number of uploaded documents across all portfolios)

#### Creating a Category

1. Click **Add Category**
2. Fill in:
   - **Name** — Category name (e.g., "Transcript of Records")
   - **Description** — Optional guidance for applicants
   - **Sort Order** — Display order
   - **Required for submission** — Check if this category is mandatory (default: checked)
3. Click **Create Category**

#### Editing a Category

1. Click **Edit** (pencil icon) on a category
2. Update the name, description, sort order, or required status
3. Click **Update Category**

#### Deleting a Category

- Click **Delete** (trash icon)
- **Cannot delete** categories that have uploaded documents (button is disabled)
- Confirm the deletion in the dialog

### 4.6 Reports & Analytics

View comprehensive program analytics:

1. Click **Reports** in the sidebar

**Top Stats (4 Cards):**
- **Total Portfolios** — All portfolios in the system
- **Completion Rate** — Percentage of portfolios approved out of total
- **Average Score** — Average evaluation score percentage across all submitted evaluations
- **Total Evaluations** — Count of submitted evaluations

**Portfolio Status Distribution:**
- Horizontal bar chart showing the count of portfolios in each status
- Color-coded progress bars for visual comparison

**Evaluator Recommendations Breakdown:**
- Distribution of evaluator recommendations (Approve, Revise, Reject)
- Shows count and percentage for each

**Competency Performance by Criteria:**
- For each active rubric criterion:
  - Average score out of maximum
  - Percentage performance
  - Color-coded progress bar (green ≥75%, amber 50–74%, red <50%)
  - Number of evaluations

**Monthly Submissions (Last 6 Months):**
- Bar chart showing portfolio submission trends by month

**Evaluator Performance Table:**

| Evaluator | Total Assigned | Completed | Pending | Avg Score |
|---|---|---|---|---|
| Name (email) | Count | Count | Count | Percentage |

- Color-coded average scores

**Summary Stats (Bottom Row):**
- Total Applicants
- Total Evaluators
- Approved Portfolios (green)
- Rejected Portfolios (red)

---

## 5. Common Features

### 5.1 Sidebar Navigation

The sidebar adapts to your role and shows only the features available to you:

| Menu Item | Applicant | Evaluator | Admin |
|---|:---:|:---:|:---:|
| Dashboard | ✓ | ✓ | ✓ |
| My Portfolios | ✓ | — | — |
| Assigned Reviews | — | ✓ | — |
| Manage Portfolios | — | — | ✓ |
| Manage Users | — | — | ✓ |
| Rubric Criteria | — | — | ✓ |
| Document Categories | — | — | ✓ |
| Reports | — | — | ✓ |

### 5.2 Notifications

Stay updated with important notifications:

1. Notifications are accessible from the sidebar or notification bell
2. Click **Notifications** to see all notifications (paginated, 20 per page)
3. Each notification shows:
   - Title and message
   - Time indicator (e.g., "5m ago", "2h ago")
   - Read/unread status (blue dot for unread)
   - **View** button to navigate to the related page
   - **Mark Read** button for individual notifications
4. Click **Mark All as Read** to clear all unread notifications

**Notification Types:**

| Event | Who Gets Notified |
|---|---|
| Portfolio submitted | All Admins |
| Evaluator assigned to portfolio | The Evaluator |
| Evaluation completed | Applicant + All Admins |
| Portfolio status changed | The Applicant |

### 5.3 Profile Settings

Update your personal information:

1. Click your **name/avatar** in the sidebar footer
2. Select **Settings**
3. On the **Profile** tab:
   - Update your **Name** and **Email**
   - Click **Save**

> **Note:** If you change your email, you will need to verify the new email address.

**Deleting Your Account:**
1. Scroll to the bottom of the Profile settings
2. Click **Delete Account**
3. Enter your password to confirm
4. Click **Delete** — this action is **permanent and cannot be undone**

> **Warning:** Deleting your account permanently removes all your data including portfolios, documents, evaluations, and notifications.

### 5.4 Password Settings

Change your password:

1. Go to **Settings** → **Password**
2. Enter your **Current Password**
3. Enter your **New Password**
4. Confirm your new password
5. Click **Save password**

> **Note:** Password changes are rate-limited to 6 attempts per minute.

### 5.5 Appearance Settings

Customize the look and feel:

1. Go to **Settings** → **Appearance**
2. Choose between:
   - **Light** — Light theme
   - **Dark** — Dark theme
   - **System** — Follows your operating system's preference
3. Your preference is applied immediately

### 5.6 Two-Factor Authentication Settings

Manage your 2FA setup:

1. Go to **Settings** → **Two-Factor Authentication**
2. When **Disabled:**
   - Click **Enable 2FA** to begin setup
   - Confirm your password
   - Scan the QR code and verify with a 6-digit code
3. When **Enabled:**
   - View and save your 8 recovery codes
   - Regenerate recovery codes if needed (invalidates old codes)
   - Click **Disable 2FA** to turn off (requires password confirmation)

> **Important:** Each recovery code can only be used once. Store them in a safe location.

---

## 6. Frequently Asked Questions

### General

**Q: What browsers are supported?**  
A: ETEEAP Gateway works on all modern browsers including Chrome, Firefox, Safari, and Edge. We recommend using the latest version.

**Q: Can I use it on my phone?**  
A: Yes! The platform is fully responsive and works on mobile phones and tablets.

**Q: I forgot my password. What do I do?**  
A: Click "Forgot your password?" on the login page. Enter your email and check your inbox for a reset link.

**Q: What is ETEEAP?**  
A: The Expanded Tertiary Education Equivalency and Accreditation Program (ETEEAP) allows working professionals to earn academic credits based on their knowledge, skills, and competencies acquired outside the traditional education system.

### For Applicants

**Q: What documents do I need to submit?**  
A: There are 11 document categories. Required documents include: CV/Resume, Diploma/Degree, Transcript of Records, Employment Records, Work Samples, PSA Birth Certificate, 2x2 ID Photos, and Statement of Purpose. Optional documents include Professional Certifications, Training Certificates, and Character References.

**Q: What file formats and sizes are allowed?**  
A: You can upload PDF, DOC, DOCX, JPG, JPEG, and PNG files. Maximum file size is 10 MB per file.

**Q: Can I edit my portfolio after submitting?**  
A: No. Once submitted, your portfolio cannot be modified until an administrator requests a revision. If revisions are requested, you can upload new documents and resubmit.

**Q: How do I know when my portfolio has been reviewed?**  
A: You will receive a notification when an evaluation is completed and when your portfolio status changes. Check your Notifications page or Dashboard regularly.

**Q: How is my portfolio scored?**  
A: Portfolios are scored using 6 rubric criteria totaling 100 points: Completeness of Documentation (20), Relevance of Work Experience (25), Quality of Work Samples (20), Professional Growth & Development (15), Statement of Purpose (10), and Character References (10).

### For Evaluators

**Q: How do I start evaluating a portfolio?**  
A: Go to **Assigned Reviews** in the sidebar and click **Review** on any pending assignment. Score each rubric criterion, add comments, select a recommendation, and submit.

**Q: Can I save my evaluation and finish later?**  
A: Yes! Click **Save Draft** to save your progress. Your assignment status will change to "In Progress" and you can return later to complete the evaluation.

**Q: Can I edit an evaluation after submitting?**  
A: No. Once submitted, evaluations are final and cannot be changed.

**Q: What if a due date has passed?**  
A: Overdue assignments are highlighted in red on your dashboard and assignment list. Complete overdue evaluations as soon as possible.

### For Admins

**Q: How do I create evaluator accounts?**  
A: Go to **Manage Users** → **Create User** and select the "Evaluator" role. Evaluator accounts cannot be self-registered.

**Q: Can I assign multiple evaluators to one portfolio?**  
A: Yes. You can assign multiple evaluators to the same portfolio. Each evaluator will submit their own independent evaluation.

**Q: What happens when I change a portfolio's status?**  
A: The applicant receives a notification about the status change. If you select "Revision Requested," add Admin Notes explaining what needs to be changed — the applicant will see these notes.

**Q: Can I delete a rubric criterion or document category?**  
A: Rubric criteria can only be deleted if they haven't been used in any evaluation. Document categories can only be deleted if no documents have been uploaded to them. Otherwise, consider deactivating the criterion instead.

**Q: Where can I see overall program performance?**  
A: Go to **Reports** in the sidebar for comprehensive analytics including portfolio status distribution, competency performance, evaluator metrics, monthly trends, and recommendation breakdowns.

---

## Support

If you encounter any issues or have questions not covered in this manual, please contact:

- **System Administrator:** admin@adfc.edu.ph
- **ETEEAP Office:** Asian Development Foundation College
