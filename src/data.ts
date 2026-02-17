export type Project = {
    title: string;
    description: string;
    tech: string[];
    links: { live?: string; github?: string };
  };
  
  export const profile = {
    name: "Leyli Tahmasebi",
    headline: "I build reliable, user-focused web applications.",
    title: "Full-Stack Engineer (Frontend-Focused)",
    tagline: "React 18 • TypeScript • .NET 8 • Azure • Test Automation",
    location: "Tampa, FL",
    email: "leylitahmasebi@gmail.com",
    github: "https://github.com/Lili-ta",
    linkedin: "https://linkedin.com/in/leylitahmasebi",
    resumeUrl: "/resume.pdf", // put resume.pdf in /public
  };
  
  export const projects: Project[] = [
    {
      title: "Enterprise UI Platform (React 18 + TypeScript)",
      description:
        "Delivered enterprise UI features using React 18, TypeScript, Zustand, TanStack Query, and React Hook Form. Improved UX and performance with code-splitting/lazy loading and aligned implementation with shared component standards.",
      tech: ["React 18", "TypeScript", "Zustand", "TanStack Query", "React Hook Form"],
      links: {
        // live: "https://...", // optional if you have a demo
        // github: "https://github.com/...", // optional if public
      },
    },
    {
      title: ".NET 8 APIs + Azure Functions (Clean Architecture)",
      description:
        "Contributed to secure backend services using .NET 8 / ASP.NET Core Web API and Azure Functions (isolated). Worked within Clean Architecture patterns and pragmatic DDD/CQRS to keep services maintainable and performant.",
      tech: [".NET 8", "ASP.NET Core Web API", "Azure Functions", "REST", "Swagger/OpenAPI"],
      links: {},
    },
    {
      title: "Quality & Testing (85%+ Coverage, MSW, CI)",
      description:
        "Drove frontend quality through unit testing and API mocking (Vitest/Jest, React Testing Library, MSW) and partnered with QA for early feedback. Led/introduced test coverage improvements (85%+) to reduce post-deployment issues and stabilize releases.",
      tech: ["Vitest/Jest", "React Testing Library", "MSW", "CI/CD", "Performance Optimization"],
      links: {},
    },
  ];
  