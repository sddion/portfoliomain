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
              I&apos;m a <span className="text-foreground font-medium">self-taught full-stack developer</span> from
              India with a passion for building things that work. My journey started with hands-on learning and has
              evolved into deploying live applications used by real users.
            </p>

            <p>
              My expertise spans multiple domains: <span className="text-accent">web development</span> (frontend and
              backend), <span className="text-accent">mobile app development</span> with React Native,{" "}
              <span className="text-accent">embedded hardware</span> projects with Arduino and ESP8266, and{" "}
              <span className="text-accent">Windows automation</span> and security scripting.
            </p>

            <p className="text-foreground">
              <span className="font-medium">
                Fullstack dev, automation junkie, CLI wizard, professional code wrangler.
              </span>{" "}
              If it can be automated, I&apos;ll automate it. If it can&apos;t, I&apos;ll still try.
              <span aria-hidden="true"> 🤪</span>
            </p>
            <p>
              I write code, break code, fix code, and sometimes make code dance to music. Fluent in Bash, PowerShell,
              JavaScript, TypeScript, Python, and sarcasm. I build web apps, CLI tools, PowerShell scripts, music
              players, secure comms, e-commerce—and memes. My projects range from the useful, to the quirky, to the
              “what the heck is this?”
            </p>

            <p>
              I approach every project with a{" "}
              <span className="text-foreground font-medium">problem-solving mindset</span>, focusing on operational
              reliability and security awareness. Whether it&apos;s building a real-time voice communication app,
              programming LED matrix displays, or creating system auditing tools, I enjoy the challenge of making
              technology work across different platforms and constraints.
            </p>

            <p>
              CI/CD: I build pipelines on GitLab CI and Vercel that run tests, ESLint, type checks, and deploy on merge.
              I&apos;ve orchestrated media tooling like FFmpeg and yt-dlp in CI jobs for auxiliary services (see
              wave/ragava), with safe env-var usage and branch rules—see my patterns on{" "}
              <a
                href="https://gitlab.com/0xdedsec"
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitLab (0xdedsec)
              </a>
              .
            </p>

            <p>
              Music Player:{" "}
              <a
                href="https://ragava.vercel.app"
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ragava (Next.js)
              </a>{" "}
              is the active Next.js implementation. The legacy{" "}
              <a
                href="https://github.com/sddion/wave-music-player"
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                wave-music-player
              </a>{" "}
              (Flask) is archived read-only; it was migrated to{" "}
              <a
                href="https://github.com/sddion/wave"
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Express.js
              </a>{" "}
              and later reimplemented in Next.js as Ragava (
              <a
                href="https://github.com/sddion/Ragava"
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
              ,{" "}
              <a
                href="https://gitlab.com/sju17051/wavemusic"
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitLab
              </a>
              ).
            </p>

            <p>
              Currently, I&apos;m focused on building full-stack applications with TypeScript, exploring new
              technologies, and contributing to open-source projects. Check out my work on{" "}
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
                href="https://gitlab.com/0xdedsec"
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
