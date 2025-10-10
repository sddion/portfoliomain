"use client"

import { useState } from "react"
import { ProjectCard } from "@/components/project-card"
import { projects, categories } from "@/lib/projects-data"
import { Button } from "@/components/ui/button"

export function ProjectsSection() {
  const [activeCategory, setActiveCategory] = useState("all")

  const filteredProjects = activeCategory === "all" ? projects : projects.filter((p) => p.category === activeCategory)

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Featured Projects</h2>
            <div className="h-1 w-20 bg-accent rounded-full mx-auto" />
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A collection of live deployments and open-source projects across web, mobile, embedded systems, and
              security
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.id)}
                className="transition-all duration-200"
              >
                {category.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No projects found in this category.</p>
            </div>
          )}

          <div className="text-center pt-8">
            <p className="text-muted-foreground mb-4">Want to see more? Check out my repositories:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild variant="outline">
                <a href="https://github.com/sddion" target="_blank" rel="noopener noreferrer">
                  View GitHub Profile
                </a>
              </Button>
              <Button asChild variant="outline">
                <a href="https://gitlab.com/dedsec" target="_blank" rel="noopener noreferrer">
                  View GitLab Profile
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
