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
│  ├─ resume.pdf
│  ├─ sounds
│  │  └─ click.mp3
│  └─ uploads
│     ├─ 1768985859536-security-checklist-for-a-beginner.png
│     └─ 1768987251624-ShortDesk.png
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
│  │  │  │  └─ page.tsx
│  │  │  ├─ blog
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [slug]
│  │  │  │     └─ page.tsx
│  │  │  ├─ contact
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ projects
│  │  │  │  ├─ new
│  │  │  │  │  └─ page.tsx
│  │  │  │  ├─ page.tsx
│  │  │  │  └─ [slug]
│  │  │  │     └─ page.tsx
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
│  │  │  ├─ contact
│  │  │  │  └─ route.ts
│  │  │  ├─ hero
│  │  │  │  └─ route.ts
│  │  │  └─ projects
│  │  │     └─ route.ts
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ loading.tsx
│  ├─ components
│  │  ├─ admin
│  │  │  ├─ AboutEditor.tsx
│  │  │  ├─ AdminNav.tsx
│  │  │  ├─ AdminSidebar.tsx
│  │  │  ├─ BlogForm.tsx
│  │  │  ├─ HomeEditor.tsx
│  │  │  └─ ProjectForm.tsx
│  │  ├─ blog
│  │  │  └─ BlogControls.tsx
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
│  │     ├─ BackToTop.tsx
│  │     ├─ Button.tsx
│  │     ├─ Card.tsx
│  │     ├─ CodeBlock.tsx
│  │     ├─ ContentProtection.tsx
│  │     ├─ CustomCursor.tsx
│  │     ├─ Input.tsx
│  │     ├─ Modal.tsx
│  │     ├─ SkillKeyboard.tsx
│  │     └─ Toast.tsx
│  ├─ lib
│  │  ├─ auth.ts
│  │  ├─ connectToDB.ts
│  │  ├─ db.ts
│  │  ├─ githubUpload.ts
│  │  ├─ models
│  │  │  ├─ Admin.ts
│  │  │  ├─ Blog.ts
│  │  │  └─ Project.ts
│  │  ├─ skillData.ts
│  │  └─ utils.ts
│  ├─ models
│  │  ├─ About.ts
│  │  ├─ Hero.ts
│  │  ├─ Post.ts
│  │  └─ Project.ts
│  └─ types
│     └─ index.ts
├─ tailwind.config.js
├─ tailwind.config.ts
└─ tsconfig.json