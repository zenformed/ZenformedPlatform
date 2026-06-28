# BuildCore Feature Workflows (editorial)

This file is the **authoritative source for intended user workflows** in BuildCore documentation AI.

Generated workflow seeds from feature knowledge are merged with these editorial overrides when you run `npm run generate:docs-context`.

Do not invent alternative user flows in documentation when a workflow is supplied to the AI.

---

## projects

Create and manage parent projects and subprojects from the Projects list. Projects are the container for workflow tasks, documents, budget entries, and payments.

### Primary workflow

1. Open BuildCore from your Zenformed account and go to the **Projects** view.
2. Select the plus (+) button in the Projects header.
3. Complete the **New project** modal (name, customer/contact fields as needed).
4. Select **Create project** to save the parent project.
5. Open the project to add subprojects, workflow tasks, and related records from the project detail tabs/sections.

### Alternate workflows

- Create a subproject from a parent project detail view when the project supports subprojects.
- Edit project information from the project detail **Project information** section.

### Prerequisites

- User must have BuildCore access through their Zenformed account.
- User needs permission to create projects in the organization.

### User tips

- Use the plus (+) button — there is no **Create New Project** text button.
- Subprojects inherit context from the parent project; create the parent first.

### Common mistakes

- Describing a **Create New Project** button instead of the plus (+) button.
- Referring to a **Project Overview** tab instead of **Project information**.
- Documenting a project type dropdown on create when it is not in the current form.

---

## workflow-tasks

Workflow tasks track stage-based work on a project. Tasks move through workflow stages and may require documents, budget entries, or customer actions.

### Primary workflow

1. Open the project from the **Projects** view.
2. Go to **Workflow Tasks** on the project.
3. Select **Add task** (or open an existing task).
4. Complete task fields (stage, assignee, due date, requirements) in the task form.
5. Select **Save task** to persist the task.
6. Move the task through stages using the workflow controls when work progresses.

### Alternate workflows

- Open **View all Workflow Tasks** from project context when reviewing every task on a project.
- Complete customer-facing tasks from assigned customer workflow links when applicable.

### Prerequisites

- A project must exist before workflow tasks can be added.
- Workflow stages must be configured for the organization (see Workflow Settings).

### User tips

- Use exact labels **Add task** and **Save task** (sentence case).
- Task requirements may gate document uploads and budget entries.

### Common mistakes

- Inventing a **Tasks tab** label not present in the UI.
- Using **Add Task** / **Save Task** (incorrect capitalization).
- Describing tasks as standalone records outside a project context.

---

## documents

Upload and review project documents. The intended upload path is through workflow tasks that require attachments — not a standalone Documents page upload button.

### Primary workflow

1. Open the project from the **Projects** view.
2. Go to **Workflow Tasks** on the project.
3. Select the task that requires a document upload.
4. Use the paperclip attachment control on the task.
5. Choose **Upload** and select the file.
6. Select **Save task** to attach the document to the task.

### Alternate workflows

- Review uploaded files from the project **Documents** section after they are attached through tasks.
- Download or delete documents from task or project document lists when permitted.

### Prerequisites

- A project and a workflow task that allows document uploads must exist.
- The user must have permission to upload documents on the task.

### User tips

- Upload from the task when documentation is required — do not describe a separate Documents upload page as the primary path.
- Missing vs uploaded document status is visible from project document views after attachment.

### Common mistakes

- Assuming there is a standalone **Documents** page with a primary **Upload** button.
- Uploading from the Documents section as the main workflow instead of through a workflow task.
- Skipping task selection before describing an upload.

---

## budget

Track budget line items and costs on a project. Budget entries may be created from project budget views and linked to workflow requirements.

### Primary workflow

1. Open the project from the **Projects** view.
2. Go to the project **Budget** section.
3. Select the control to add a budget entry (add line / new entry action in the budget table).
4. Enter item name, category, cost date, amount, and other required fields.
5. Save the budget entry.
6. Review totals and linked workflow requirements from the budget view.

### Alternate workflows

- Attach or satisfy budget-required documents through linked workflow tasks when required.

### Prerequisites

- A project must exist.
- Budget categories and permissions must be available for the user role.

### User tips

- Required fields include item name and cost date — do not invent alternate field labels.
- Do not document "budget shell" creation as part of MVP project create.

### Common mistakes

- Inventing a **Save Budget Entry** button label not present in implementation context.
- Describing budget setup as a separate wizard during project create.
- Documenting budget reports as if they replace the project budget table workflow.

---

## payments

Manage payment milestones and payment status on projects.

### Primary workflow

1. Open the project from the **Projects** view.
2. Go to the project **Payments** section.
3. Review payment milestones and statuses (for example invoiced, paid).
4. Add or update payment records using the payments table actions when permitted.
5. Save changes and verify amounts align with project payment milestones.

### Alternate workflows

- Cross-reference payment milestones with workflow task completion when payments gate stage progression.

### Prerequisites

- A project must exist.
- Payment milestones may depend on workflow configuration.

### User tips

- Use **payment milestones** terminology rather than generic invoices unless describing a specific payment state column.
- Amount fields use USD labeling from the product context.

### Common mistakes

- Describing a standalone invoicing module unrelated to project payments.
- Inventing payment buttons or tabs not present in implementation context.

---

## customers

Store customer and contact details on projects. Contacts are captured during project create/edit and through lead capture when configured.

### Primary workflow

1. Open the **Projects** view or an existing project.
2. Create a new project with the plus (+) button **or** edit an existing project.
3. Enter customer/contact fields on the create or edit form (name, email, phone, address as available).
4. Save the project to persist contact details on the project record.
5. Use contact details when assigning customer workflow tasks or communications.

### Alternate workflows

- Submit lead capture forms (when configured) to create or update contact/project records.

### Prerequisites

- User permission to create or edit projects.

### User tips

- Customer/contact data lives on the project — there is not a separate standalone CRM app view in MVP docs.
- Lead capture is optional and organization-specific.

### Common mistakes

- Documenting customer portal invite during project create as a default step.
- Inventing a global **Customers** list page as the primary entry point when contacts are project-scoped.

---

## reports

Review operational and financial summaries exported or viewed from BuildCore reporting entry points.

### Primary workflow

1. Open BuildCore from your Zenformed account.
2. Navigate to **Reports** from the application navigation.
3. Choose the report type relevant to the article topic (projects, workflow, budget, or payments summaries as available).
4. Apply filters (date range, project, status) when the report supports filtering.
5. Review results and export or share using the report actions provided.

### Alternate workflows

- Use project-level summaries when the article focuses on a single project rather than org-wide reports.

### Prerequisites

- User must have reporting permissions for the organization.

### User tips

- Describe only report views and filters confirmed in product context — do not invent report names.

### Common mistakes

- Inventing report URLs or export formats not in the product.
- Describing reports as if they replace project detail sections.

---

## workflow-settings

Configure workflow stages, task templates, and workflow rules for the organization.

### Primary workflow

1. Open BuildCore from your Zenformed account.
2. Navigate to **Workflow Settings** (admin/configuration area).
3. Review existing workflow stages and templates.
4. Add or edit stages/templates using the settings controls.
5. Save workflow settings and verify projects use the updated stages for new tasks.

### Alternate workflows

- Adjust task permission defaults that affect workflow task visibility (see Permissions).

### Prerequisites

- Administrative permission to manage workflow settings.

### User tips

- Changes affect new task behavior — existing tasks may retain prior stage history.

### Common mistakes

- Documenting per-project workflow settings when configuration is organization-level.
- Inventing stage names not present in generated workflow settings context.

---

## team-members

Manage organization members who can access BuildCore and their roles.

### Primary workflow

1. Open BuildCore from your Zenformed account.
2. Navigate to **Team Members** (or organization team settings entry point).
3. Review the member list (name, email, organization role, BuildCore role).
4. Invite or update members using the team management actions when permitted.
5. Save role changes and confirm the member can access BuildCore through Zenformed.

### Alternate workflows

- Adjust BuildCore role assignments that affect feature permissions.

### Prerequisites

- Organization admin or member-management permission.

### User tips

- Access still flows through Zenformed account launch — members do not sign in at buildcore.com.

### Common mistakes

- Inventing a separate BuildCore login flow for invited users.
- Documenting role names not present in the team members table labels.

---

## permissions

Control who can view or edit workflow tasks, documents, budget entries, and related project data.

### Primary workflow

1. Open BuildCore from your Zenformed account.
2. Navigate to permissions settings for workflow tasks / team access (organization configuration).
3. Review visibility rules such as "Only assigned user can view" for workflow tasks when applicable.
4. Update permission toggles or role defaults for the feature described in the article.
5. Save permission changes and verify behavior with a non-admin test user when possible.

### Alternate workflows

- Combine with **Team Members** role assignment when the article spans access control end-to-end.

### Prerequisites

- Administrative permission to change organization or workflow permissions.

### User tips

- Permission copy is exact — use labels from implementation context (for example member visibility toggles).

### Common mistakes

- Inventing permission names or admin menus not in product context.
- Describing customer portal permissions as identical to internal staff permissions.
