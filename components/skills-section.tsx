import { Card, CardContent } from "@/components/ui/card"
import { Code2, Palette, Server, Cpu, Shield, Wrench } from "lucide-react"

const skillCategories = [
  {
    title: "Programming / Scripting",
    icon: Code2,
    skills: ["JavaScript", "TypeScript", "Python", "PowerShell", "C++", "Shell Scripting"],
  },
  {
    title: "Frontend",
    icon: Palette,
    skills: ["HTML & CSS", "Responsive Design", "React", "React Native", "Expo", "Redux Toolkit"],
  },
  {
    title: "Backend",
    icon: Server,
    skills: ["Node.js", "Express.js", "Supabase", "Firebase", "SQLite", "Flask"],
  },
  {
    title: "Embedded / Hardware",
    icon: Cpu,
    skills: ["Arduino", "ESP8266", "LED Matrix Displays", "Microcontroller Networking", "IoT Projects"],
  },
  {
    title: "Security / Systems",
    icon: Shield,
    skills: ["Windows Enumeration", "System Auditing", "USB Autorun", "Operational Tooling", "Secure Coding Practices"],
  },
  {
    title: "Tools / DevOps",
    icon: Wrench,
    skills: ["Git", "GitHub", "GitLab", "Deployment Pipelines", "Vercel", "Render"],
  },
]

export function SkillsSection() {
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
                  className="border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-accent/10">
                        <Icon className="h-5 w-5 text-accent" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {category.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full border border-border"
                        >
                          {skill}
                        </span>
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
