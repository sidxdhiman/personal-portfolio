/**
 * Centralized portfolio content.
 * Projects and skills render from this file - edit data here, not the HTML.
 */

window.PORTFOLIO = {
  githubUrl: "https://github.com/sidxdhiman",
  linkedinUrl: "https://www.linkedin.com/in/sidxdhiman/",

  projects: [
    {
      name: "OpenTime",
      status: "In Development",
      description:
        "An AI-powered personal reflection system designed as a digital time machine for your thoughts. Users capture thoughts through text, images and video, which are analyzed and stored by the Chronos Engine. Over time, users can revisit previous entries and compare how their thinking, perspectives and ideas have evolved.",
      tags: [
        "Python",
        "FastAPI",
        "TypeScript",
        "React",
        "MongoDB",
        "PostgreSQL",
        "LLMs",
        "Chronos Engine"
      ],
      githubUrl: "https://github.com/sidxdhiman/opentime",
      demoUrl: null
    },
    {
      name: "Hathap.ai",
      status: "In Development (~70%)",
      description:
        "A multi-agent AI orchestration system that evaluates ideas from multiple stakeholder perspectives before they are presented to a client. Agents representing roles such as Product Owner, Scrum Master and Stakeholder analyze an idea from their own viewpoints and converge toward a stronger recommendation.",
      tags: [
        "TypeScript",
        "React",
        "Node.js",
        "Express",
        "MongoDB",
        "Multi-Agent Systems",
        "AI Agents",
        "Ollama"
      ],
      githubUrl: "https://github.com/sidxdhiman/Hathap.ai",
      demoUrl: null
    },
    {
      name: "Snipster",
      status: "Academic Project",
      highlight: "Best Project of the Year 2025 - 3rd Prize",
      description:
        "A collaborative Q&A platform for universities and colleges, letting students ask and answer technical questions within shared communities such as coding groups, course sections, classes or entire batches.",
      tags: ["JavaScript", "React", "Node.js", "Express", "MongoDB", "MERN Stack"],
      githubUrl: "https://github.com/sidxdhiman/snipster",
      demoUrl: null
    }
  ],

  skills: [
    { group: "Languages", items: ["Python", "JavaScript", "TypeScript", "Java", "Kotlin", "SQL"] },
    { group: "Frontend", items: ["React", "React Native", "Tailwind CSS"] },
    { group: "Backend", items: ["Node.js", "Express", "Python", "FastAPI"] },
    { group: "Databases", items: ["MongoDB", "PostgreSQL"] },
    {
      group: "AI / Automation",
      items: ["LLMs", "AI Agents", "Multi-Agent Systems", "Ollama", "RAG", "n8n", "Automation"]
    },
    { group: "Mobile", items: ["Android", "Kotlin", "React Native"] },
    { group: "Tools", items: ["Git", "GitHub", "Docker", "Power BI", "Excel"] }
  ]
};
