import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Github, GitlabIcon, AlertTriangle } from "lucide-react"
import type { Project } from "@/lib/projects-data"

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex flex-col h-full border-border hover:border-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent/10">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl text-foreground">{project.title}</CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {project.category}
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground leading-relaxed">{project.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {project.disclaimer && (
          <div className="flex gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <p className="text-xs text-destructive">{project.disclaimer}</p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Key Features:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            {project.features.slice(0, 4).map((feature, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-accent mt-1">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-foreground mb-2">Tech Stack:</h4>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded border border-border"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-wrap gap-2">
        {project.liveUrl && (
          <Button asChild size="sm" className="flex-1">
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Live Demo
            </a>
          </Button>
        )}
        {project.githubUrl && (
          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </a>
          </Button>
        )}
        {project.gitlabUrl && (
          <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
            <a href={project.gitlabUrl} target="_blank" rel="noopener noreferrer">
              <GitlabIcon className="h-4 w-4 mr-2" />
              GitLab
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
