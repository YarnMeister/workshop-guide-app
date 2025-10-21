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
          title: "Quick preflight",
          description: "Make sure you have the basic development tools installed.",
          codeBlock: `# Make sure Xcode CLT exist (git, make, etc.)
xcode-select --install 2>/dev/null || true

# Confirm git is present
git --version`
        },
        {
          title: "Install GitHub CLI (gh)",
          description: "We'll use GitHub CLI to authenticate and manage your repository.",
          subsections: [
            {
              title: "If Homebrew is not installed:",
              codeBlock: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
            },
            {
              title: "Add brew to PATH (Apple Silicon default):",
              codeBlock: `echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"`
            },
            {
              title: "Install gh:",
              codeBlock: `brew update
brew install gh
gh --version`
            }
          ]
        },
        {
          title: "Login to GitHub with the right scopes",
          description: "Authenticate with GitHub and set up the necessary permissions.",
          codeBlock: `# Start web login (choose: GitHub.com, HTTPS, login via browser)
gh auth login --hostname github.com --git-protocol https --web

# Verify current auth
gh auth status -h github.com

# Ensure git uses gh's credentials
gh auth setup-git

# Refresh/extend scopes to include repo + workflow
gh auth refresh -h github.com -s repo -s workflow`
        },
        {
          title: "Fix remotes (move away from SSH if needed)",
          description: "Ensure your repository is using HTTPS for easier authentication.",
          codeBlock: `# Check current remote
git remote -v

# If you see git@github.com:..., switch to HTTPS:
git remote set-url origin https://github.com/YarnMeister/sales-dashboard.git
git remote -v`
        },
        {
          title: "Push your branch",
          description: "Push your changes to the remote repository.",
          codeBlock: `# Make sure you're on the right branch locally
git status
git branch --show-current

# Push and set upstream
git push -u origin your-branch-name`
        },
        {
          title: "Open the PR from CLI",
          description: "Create a pull request directly from the command line.",
          codeBlock: `gh pr create \\
  --base main \\
  --title "Your PR Title" \\
  --body "Description of your changes"`
        }
      ],
      troubleshooting: {
        title: "Troubleshooting (fast fixes)",
        items: [
          {
            title: "workflow scope required error persists",
            codeBlock: `gh auth refresh -h github.com -s workflow -s repo
gh auth status -h github.com`
          },
          {
            title: "Pushing still prompts for username/password",
            codeBlock: `gh auth setup-git
git config --global credential.helper osxkeychain`
          },
          {
            title: "Remote URL is wrong repo or 404s",
            codeBlock: `git remote set-url origin https://github.com/YarnMeister/sales-dashboard.git
gh repo view`
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
