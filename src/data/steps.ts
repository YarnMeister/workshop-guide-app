export const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Setup Tools",
    description: "Install requirements",
    heading: "Setup Your Development Environment",
    content: "Before we dive in, let's make sure you have all the necessary tools installed. You'll need your code editor, terminal access, and any workshop-specific dependencies. Don't worry - we'll guide you through each installation step.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/2",
    detailedContent: {
      sections: [
        {
          title: "Create Your Accounts",
          description: "Set up your GitHub and Vercel accounts to get started.",
          subsections: [
            {
              title: "GitHub Account",
              codeBlock: `Go to: https://github.com/signup
Sign up with your email (or log in if you already have an account)
Keep your username and password handy`
            },
            {
              title: "Vercel Account",
              codeBlock: `Go to: https://vercel.com/signup
Sign up using your GitHub account (click "Continue with GitHub")
This will link your accounts automatically`
            }
          ]
        },
        {
          title: "Install Void Editor",
          description: "Download and install the Void code editor.",
          codeBlock: `For Mac & Windows:

Download from: https://voideditor.com/download-beta
Mac: Open the downloaded file and drag Void to your Applications folder
Windows: Run the installer and follow the prompts
Launch Void to make sure it opens`
        },
        {
          title: "Install Command Line Tools",
          description: "Learn how to access Terminal/Command Prompt and install development tools.",
          subsections: [
            {
              title: "Don't know where to find Terminal (Command Prompt on Windows)?",
              codeBlock: `Watch these quick videos:

Mac users: How to open Terminal - https://www.youtube.com/watch?v=PT4607L5xho
Windows users: How to open Command Prompt - https://www.youtube.com/watch?v=mTEOwzbnXqM`
            }
          ]
        },
        {
          title: "For Mac Users",
          description: "Install Homebrew, Git, and Node.js on macOS.",
          subsections: [
            {
              title: "Install Homebrew",
              description: `Open "Terminal" (find it using Spotlight search: press ⌘ + Space, then type "Terminal")

Copy and paste this command, then press Enter:

Follow the on-screen instructions (you may need to enter your computer password)

When done, close and reopen Terminal`,
              codeBlock: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
            },
            {
              title: "Install Git",
              description: `In Terminal, type the command below, then press Enter and wait for it to finish:`,
              codeBlock: `brew install git`
            },
            {
              title: "Install npm (Node.js)",
              description: `In Terminal, type the command below, then press Enter and wait for it to finish:`,
              codeBlock: `brew install node`
            },
            {
              title: "Verify it worked:",
              description: `Type the commands below one at a time. You should see version numbers for both:`,
              codeBlock: `git --version

npm --version`
            }
          ]
        },
        {
          title: "For Windows Users",
          description: "Install Git and Node.js on Windows.",
          subsections: [
            {
              title: "Install Git",
              codeBlock: `Download from: https://git-scm.com/download/win
Run the installer
Use all default options (just keep clicking "Next")
Important: When asked about "Adjusting your PATH environment," select "Git from the command line and also from 3rd-party software"`
            },
            {
              title: "Install Node.js (includes npm)",
              codeBlock: `Download from: https://nodejs.org/ (choose the LTS version)
Run the installer
Use all default options (click "Next" through everything)
Check the box that says "Automatically install the necessary tools"`
            },
            {
              title: "Verify it worked:",
              description: `Open "Command Prompt" (search for "cmd" in Start menu)

Type the commands below one at a time. You should see version numbers for both:`,
              codeBlock: `git --version

npm --version`
            }
          ]
        },
        {
          title: "Connect Git to Your GitHub Account",
          description: `Configure Git with your personal information.

In Terminal (Mac) or Command Prompt (Windows), type these commands one at a time (replace with your info):`,
          codeBlock: `git config --global user.name "Your Name"

git config --global user.email "your.email@example.com"`
        }
      ],
      troubleshooting: {
        title: "Troubleshooting",
        items: [
          {
            title: "Command not found errors?",
            codeBlock: `Try closing and reopening your Terminal/Command Prompt`
          },
          {
            title: "Installation stuck?",
            codeBlock: `Make sure you have a stable internet connection`
          },
          {
            title: "Still having issues?",
            codeBlock: `Take a screenshot of any error messages to show at the workshop`
          }
        ]
      }
    }
  },
  {
    id: 2,
    title: "Write Specs",
    description: "Define requirements",
    heading: "Define Your Project Requirements",
    content: "Let's start by clearly defining what you want to build. This step will help you create a solid foundation for your project by outlining the key features, user stories, and technical requirements.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/3",
  },
  {
    id: 3,
    title: "Prototype (UI)",
    description: "Design interface",
    heading: "Create Your User Interface Prototype",
    content: "Now let's design the user interface for your application. We'll create wireframes, mockups, and interactive prototypes to visualize how users will interact with your product.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/4",
  },
  {
    id: 4,
    title: "Export project",
    description: "Generate code",
    heading: "Export Your Project Code",
    content: "Time to turn your designs into actual code! We'll export your prototype into clean, production-ready code that you can customize and extend.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/5",
  },
  {
    id: 5,
    title: "Add Backend",
    description: "Build server logic",
    heading: "Add Backend Functionality",
    content: "Now let's add the backend logic to make your application fully functional. We'll set up APIs, databases, and server-side logic to power your application.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/6",
  },
  {
    id: 6,
    title: "Launch App",
    description: "Deploy to production",
    heading: "Launch Your Application",
    content: "Congratulations! You're ready to launch your application to the world. We'll deploy it to a production environment and make it accessible to users.",
    ctaText: "Complete",
    ctaAction: "/dashboard",
  },
];
