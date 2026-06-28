---
title: Parent and Child Projects
slug: parent-projects
product: buildcore
category: projects
summary: Organize multi-phase jobs by linking child projects to a parent project.
visibility: public
tags:
  - projects
  - organization
estimatedReadTime: 5
lastUpdated: 2026-03-18
author: Zenformed Documentation
published: true
relatedArticles:
  - slug: create-project
    title: Create a Project
    product: buildcore
    category: projects
previousArticle:
  slug: create-project
  title: Create a Project
  product: buildcore
  category: projects
---

Large construction jobs often span multiple phases — design, permitting, build, and closeout. BuildCore supports **parent projects** with **subprojects** (child projects) so you can group related work under one umbrella.

## When to use parent projects

Use a parent project when:

- A single customer job has distinct phases with separate budgets
- Different crews or subs own individual phases
- You need roll-up reporting across related work

Each subproject keeps its own workflow tasks, documents, payments, and budget entries while remaining linked to the parent.

## Start with a parent project

Create a project as usual (see **Create a Project**). Any project can act as a parent once you add subprojects to it. The parent typically holds shared customer and contact details; day-to-day work often lives on subprojects.

## Add a subproject

From the parent project's detail page:

1. Open the **Subprojects** section
2. Select the **plus (+) button** in the Subprojects header
3. In the **New subproject** modal, enter the subproject details
4. Select **Create project**

Subprojects use the same core fields as top-level projects. Your organization may apply subproject templates to pre-fill workflow tasks or payment milestones on the draft.

## Reporting and navigation

On the parent project, the **Subprojects** section lists child projects with search and expand/collapse controls. Open any subproject to manage its workflow tasks, documents, payments, and accountability records.

Financial rollups on the parent reflect data from linked subprojects where your role has access.

> **Note:** Deleting a parent project does not automatically delete subprojects. Remove or reassign subprojects first when reorganizing work.

## Best practices

- Name the parent after the overall job (e.g. `Martinez – Full Home Renovation`)
- Name subprojects after phases (e.g. `Martinez – Phase 1 Demo`, `Martinez – Phase 2 Build`)
- Keep shared documents on the parent when they apply to the whole job; store phase-specific files on the subproject
