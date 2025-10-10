export function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">About Me</h2>
            <div className="h-1 w-20 bg-accent rounded-full" />
          </div>

          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              I'm a <span className="text-foreground font-medium">self-taught full-stack developer</span> from India
              with a passion for building things that work. My journey started with hands-on learning and has evolved
              into deploying live applications used by real users.
            </p>

            <p>
              My expertise spans multiple domains: <span className="text-accent">web development</span> (frontend and
              backend), <span className="text-accent">mobile app development</span> with React Native,{" "}
              <span className="text-accent">embedded hardware</span> projects with Arduino and ESP8266, and{" "}
              <span className="text-accent">Windows automation</span> and security scripting.
            </p>

            <p>
              I approach every project with a{" "}
              <span className="text-foreground font-medium">problem-solving mindset</span>, focusing on operational
              reliability and security awareness. Whether it's building a real-time voice communication app, programming
              LED matrix displays, or creating system auditing tools, I enjoy the challenge of making technology work
              across different platforms and constraints.
            </p>

            <p>
              CI/CD: I build pipelines on GitLab CI and Vercel that run tests, ESLint, type-checks, and deploy on merge.
              I&apos;ve orchestrated media tooling like FFmpeg and yt-dlp in CI jobs for auxiliary services, with safe
              env-var usage and branch rules—see my pipeline patterns on{" "}
              <a
                href="https://gitlab.com/0xdedsec"
                className="text-accent hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                GitLab
              </a>
              .
            </p>

            <p>
              Some legacy repos are archived read-only:{" "}
              <a
                href="https://github.com/sddion/wave-music-player"
                className="text-accent hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                wave-music-player
              </a>{" "}
              (Flask) migrated to{" "}
              <a
                href="https://github.com/sddion/wave"
                className="text-accent hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Express.js
              </a>
              , and the Next.js reimplementation lives in{" "}
              <a
                href="https://github.com/sddion/Ragava"
                className="text-accent hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Ragava
              </a>
              . My GitLab username is <span className="text-foreground font-medium">0xdedsec</span>.
            </p>

            <p>
              Currently, I'm focused on building full-stack applications with TypeScript, exploring new technologies,
              and contributing to open-source projects. Check out my work on{" "}
              <a
                href="https://github.com/sddion"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                GitHub
              </a>{" "}
              and{" "}
              <a
                href="https://gitlab.com/dedsec"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                GitLab
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
