"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Code2, Palette, Server, Cpu, Shield, Wrench } from "lucide-react"
import { SkillProgress } from "@/components/skill-progress"
import { useMounted } from "@/hooks/use-mounted"

const skillCategories = [
  {
    title: "Programming / Scripting",
    icon: Code2,
    skills: [
      { name: "JavaScript", progress: 90 },
      { name: "TypeScript", progress: 85 },
      { name: "Python", progress: 50 },
      { name: "PowerShell", progress: 75 },
      { name: "C++", progress: 70 },
      { name: "Shell Scripting", progress: 85 },
    ],
  },
  {
    title: "Frontend",
    icon: Palette,
    skills: [
      { name: "HTML & CSS", progress: 95 },
      { name: "Responsive Design", progress: 90 },
      { name: "React", progress: 85 },
      { name: "React Native", progress: 80 },
      { name: "Expo", progress: 75 },
      { name: "Redux Toolkit", progress: 85 },
    ],
  },
  {
    title: "Backend",
    icon: Server,
    skills: [
      { name: "Node.js", progress: 85 },
      { name: "Express.js", progress: 80 },
      { name: "Supabase", progress: 75 },
      { name: "Firebase", progress: 70 },
      { name: "SQLite", progress: 85 },
      { name: "Flask", progress: 50 },
    ],
  },
  {
    title: "Security / Systems",
    icon: Shield,
    skills: [
      { name: "Windows Enumeration", progress: 75 },
      { name: "System Auditing", progress: 70 },
      { name: "USB Autorun", progress: 85 },
      { name: "Operational Tooling", progress: 80 },
      { name: "Secure Coding Practices", progress: 85 },
    ],
  },
  {
    title: "Embedded / Hardware",
    icon: Cpu,
    skills: [
      { name: "Arduino", progress: 95 },
      { name: "ESP32/8266", progress: 95 },
      { name: "Microcontroller Networking", progress: 70 },
      { name: "IoT Projects", progress: 80 },
    ],
  },
  {
    title: "Tools / DevOps",
    icon: Wrench,
    skills: [
      { name: "Git", progress: 90 },
      { name: "GitHub", progress: 85 },
      { name: "GitLab", progress: 80 },
      { name: "Deployment Pipelines", progress: 75 },
      { name: "Vercel", progress: 85 },
      { name: "Render", progress: 80 },
    ],
  },
]

export function SkillsSection() {
  const mounted = useMounted()
  return (
    <section id="skills" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
      <div className="container mx-auto max-w-6xl">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Skills & Expertise</h2>
            <div className="h-1 w-20 bg-accent rounded-full mx-auto" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Cross-domain technical expertise spanning web, mobile, embedded systems, and security
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skillCategories.map((category) => {
              const Icon = category.icon
              return (
                <Card
                  key={category.title}
                  className="relative group/card overflow-hidden transition-all duration-300 border border-border hover:border-accent/50 hover:shadow-lg hover:shadow-accent/20 hover:-translate-y-1 transform bg-card"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10 group-hover/card:bg-accent/20 transition-all duration-500 group-hover/card:scale-110 transform rotate-0 group-hover/card:rotate-3">
                        {mounted && <Icon className="h-5 w-5 text-accent group-hover/card:text-accent/90" />}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground group-hover/card:text-accent/90 transition-all duration-500">{category.title}</h3>
                    </div>
                    <div className="mt-4 space-y-3">
                      {category.skills.map((skill) => (
                        <SkillProgress
                          key={skill.name}
                          name={skill.name}
                          progress={skill.progress}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
