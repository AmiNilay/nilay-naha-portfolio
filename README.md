my-portfolio
├─ .hintrc
├─ next-env.d.ts
├─ next.config.js
├─ package-lock.json
├─ package.json
├─ postcss.config.js
├─ postcss.config.mjs
├─ public
│  ├─ apple-touch-icon.png
│  ├─ favicon.ico
│  ├─ icon-dark.png
│  ├─ icon-light.png
│  ├─ images
│  │  └─ profile.jpg
│  ├─ manifest.json
│  ├─ resume.pdf
│  ├─ sounds
│  │  └─ click.mp3
│  └─ uploads
│     ├─ 1768985859536-security-checklist-for-a-beginner.png
│     └─ 1768987251624-ShortDesk.png
├─ README.md
├─ src
│  ├─ app
│  │  ├─ (admin)
│  │  │  ├─ admin
│  │  │  │  ├─ about
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ blog
│  │  │  │  │  ├─ page.tsx
│  │  │  │  │  └─ [id]
│  │  │  │  │     └─ page.tsx
│  │  │  │  ├─ chatbot
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ dashboard
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ home
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ login
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ projects
│  │  │  │     ├─ page.tsx
│  │  │  │     └─ [id]
│  │  │  │        └─ page.tsx
│  │  │  └─ layout.tsx
│  │  ├─ (public)
│  │  │  ├─ about
│  │  │  │  ├─ AboutClient.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ blog
│  │  │  │  ├─ BlogClient.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [slug]
│  │  │  │     ├─ BlogPostClient.tsx
│  │  │  │     └─ page.tsx
│  │  │  ├─ contact
│  │  │  │  ├─ ContactClient.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ HomeClient.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ projects
│  │  │  │  ├─ new
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  ├─ ProjectsClient.tsx
│  │  │  │  └─ [slug]
│  │  │  │     ├─ page.tsx
│  │  │  │     └─ ProjectDetailsClient.tsx
│  │  │  └─ resume
│  │  │     └─ page.tsx
│  │  ├─ api
│  │  │  ├─ about
│  │  │  │  └─ route.ts
│  │  │  ├─ auth
│  │  │  │  ├─ check
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ login
│  │  │  │     └─ route.ts
│  │  │  ├─ blog
│  │  │  │  ├─ route.ts
│  │  │  │  └─ [id]
│  │  │  │     └─ route.ts
│  │  │  ├─ chatbot
│  │  │  │  └─ route.ts
│  │  │  ├─ contact
│  │  │  │  └─ route.ts
│  │  │  ├─ hero
│  │  │  │  └─ route.ts
│  │  │  ├─ projects
│  │  │  │  └─ route.ts
│  │  │  └─ views
│  │  │     └─ route.ts
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ loading.tsx
│  │  ├─ not-found.tsx
│  │  ├─ robots.ts
│  │  ├─ sitemap.ts
│  │  └─ template.tsx
│  ├─ components
│  │  ├─ admin
│  │  │  ├─ AboutEditor.tsx
│  │  │  ├─ AdminLayoutClient.tsx
│  │  │  ├─ AdminNav.tsx
│  │  │  ├─ AdminSidebar.tsx
│  │  │  ├─ BlogForm.tsx
│  │  │  ├─ HomeEditor.tsx
│  │  │  └─ ProjectForm.tsx
│  │  ├─ blog
│  │  │  ├─ BlogControls.tsx
│  │  │  ├─ ReadingProgress.tsx
│  │  │  └─ TableOfContents.tsx
│  │  ├─ layout
│  │  │  ├─ Footer.tsx
│  │  │  ├─ Navbar.tsx
│  │  │  └─ PageNavigation.tsx
│  │  ├─ providers
│  │  │  └─ ThemeProvider.tsx
│  │  ├─ sections
│  │  │  ├─ AboutPreview.tsx
│  │  │  ├─ ContactCTA.tsx
│  │  │  ├─ FeaturedProjects.tsx
│  │  │  ├─ Hero.tsx
│  │  │  ├─ ProjectsSection.tsx
│  │  │  └─ Skills.tsx
│  │  ├─ theme-provider.tsx
│  │  └─ ui
│  │     ├─ AnimatedSection.tsx
│  │     ├─ BackToTop.tsx
│  │     ├─ Button.tsx
│  │     ├─ Card.tsx
│  │     ├─ Chatbot.tsx
│  │     ├─ CodeBlock.tsx
│  │     ├─ CommandPalette.tsx
│  │     ├─ ContentProtection.tsx
│  │     ├─ Input.tsx
│  │     ├─ Modal.tsx
│  │     ├─ SkillKeyboard.tsx
│  │     ├─ StaggerContainer.tsx
│  │     └─ Toast.tsx
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ connectToDB.ts
│  │  ├─ db.ts
│  │  ├─ githubUpload.ts
│  │  ├─ markdownProcessor.ts
│  │  ├─ models
│  │  │  ├─ Admin.ts
│  │  │  ├─ Blog.ts
│  │  │  └─ Project.ts
│  │  ├─ sanitize.ts
│  │  ├─ skillData.ts
│  │  └─ utils.ts
│  ├─ middleware.ts
│  ├─ models
│  │  ├─ About.ts
│  │  ├─ Chatbot.ts
│  │  ├─ Hero.ts
│  │  ├─ Post.ts
│  │  └─ Project.ts
│  └─ types
│     └─ index.ts
├─ tailwind.config.js
└─ tsconfig.json