export const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Set Up Tools",
    description: "Prepare workbench",
    heading: "Set Up Your Tools",
    content: "Before we dive in, let's make sure you have all the necessary tools installed. Tick each step off as you go and review the summary at the bottom of the page before you move on to the next page.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/2",
    detailedContent: {
      sections: [
        {
          title: "Create Your Accounts",
          description: "Set up your GitHub, Vercel, and Lovable accounts to get started.",
          subsections: [
            {
              title: "GitHub Account",
              codeBlock: `Go to: https://github.com/signup
Sign up with your email (or log in if you already have an account)
Keep your username and password handy`
            },
            {
              title: "Quick Tip",
              description: "Once you've created your GitHub account, it's much quicker and easier to create accounts for Vercel and Lovable using your GitHub account for authentication. This links your accounts automatically and saves you time!"
            },
            {
              title: "Vercel Account",
              codeBlock: `Go to: https://vercel.com/signup
Sign up using your GitHub account (click "Continue with GitHub")
This will link your accounts automatically`
            },
            {
              title: "Lovable Account",
              codeBlock: `Go to: https://lovable.dev/
Click "Sign up" or "Get started"
Sign up using your GitHub account (click "Continue with GitHub" or similar)
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
Windows: Run the installer and follow the prompts`,
          additionalInstructions: "Launch Void to make sure it opens. Complete the setup wizard and on the step shown in the screenshot below, enter the secret key:",
          commands: [
            "sk-ar3x-pkxX8c-erCr9-cvD-rr4R"
          ],
          screenshot: "p1-image-1.png",
          subsections: [
            {
              title: "Choose an assistant",
              description: "Please ensure only anthropic/claude-sonnet-4 is selected in the Models setting page. This is the most effective model for our purposes.",
              screenshot: "void-settings.png"
            }
          ]
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
          title: "Install Command Line Tools",
          description: "Install Git and Node.js on your operating system.",
          tabs: [
            {
              title: "🍎 Mac",
              content: {
                subsections: [
                  {
                    title: "Install Homebrew",
                    description: `Open "Terminal" (find it using Spotlight search: press ⌘ + Space, then type "Terminal")

Copy and paste this command, then press Enter:

Follow the on-screen instructions (you may need to enter your computer password)

When done, close and reopen Terminal`,
                    commands: [
                      `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
                    ]
                  },
                  {
                    title: "Install Git",
                    description: `In Terminal, type the command below, then press Enter and wait for it to finish:`,
                    commands: [
                      `brew install git`
                    ]
                  },
                  {
                    title: "Install npm (Node.js)",
                    description: `In Terminal, type the command below, then press Enter and wait for it to finish:`,
                    commands: [
                      `brew install node`
                    ]
                  },
                  {
                    title: "Verify it worked:",
                    description: `Type the commands below one at a time. You should see version numbers for both:`,
                    commands: [
                      "git --version",
                      "npm --version"
                    ]
                  },
                  {
                    title: "⚠️ Important",
                    description: `Normally Git and Node.js add themselves to your PATH automatically when installed with Homebrew or from their official installers. If your terminal can't find them (e.g. running git --version or node --version gives "command not found"), follow these steps:`
                  },
                  {
                    title: "Troubleshoot: Add Git and Node.js to Your PATH",
                    description: `If your terminal can't find Git or Node.js, follow these steps:`
                  },
                  {
                    title: "Option 1 — Quick check (most common fix)",
                    description: `Open a NEW Terminal.

Run these commands to verify if they're already in your PATH:`,
                    commands: [
                      "git --version",
                      "node --version"
                    ]
                  },
                  {
                    title: "Option 2 — Add them manually",
                    description: `If both return version numbers — you're good to go 🎉

If not, continue below.

Depending on how you installed Git and Node.js, their binaries might live in one of these directories:

/usr/local/bin
/opt/homebrew/bin

1. Open your shell config file

Depending on your macOS setup, open one of:`,
                    commands: [
                      "open -e ~/.zshrc      # for macOS Catalina and later (default shell)",
                      "open -e ~/.bash_profile   # for older versions"
                    ]
                  },
                  {
                    title: "2. Add PATH to config file",
                    description: `Add the following line at the bottom of the file that opened:

export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

Then save and close the file.`,
                    codeBlock: `export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"`
                  },
                  {
                    title: "3. Reload and confirm setup",
                    description: `In Terminal, run the command below that matches the file you edited (if you edited ~/.zshrc, use the first command; if you edited ~/.bash_profile, use the second):`,
                    commands: [
                      "source ~/.zshrc",
                      "source ~/.bash_profile"
                    ]
                  },
                  {
                    title: "4. Confirm setup worked",
                    description: `Now verify both commands work:`,
                    commands: [
                      "git --version",
                      "node --version"
                    ]
                  },
                  {
                    title: "Success!",
                    description: `You should now see both commands return version numbers — meaning your PATH is set up correctly`
                  }
                ]
              }
            },
            {
              title: "🪟 Windows",
              content: {
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
                    description: `Type the commands below one at a time. You should see version numbers for both:`,
                    commands: [
                      "git --version",
                      "npm --version"
                    ]
                  },
                  {
                    title: "⚠️ Important",
                    description: `Normally Git and Node.js add themselves to your PATH automatically when installed with Homebrew or from their official installers. If your terminal can't find them (e.g. running git --version or node --version gives "command not found"), follow these steps:`
                  },
                  {
                    title: "Troubleshoot: Add Git and Node.js to Your PATH",
                    description: `If your Command Prompt can't find Git or Node.js, follow these steps:`
                  },
                  {
                    title: "Use System Settings",
                    description: `1. Press Windows + R, type: sysdm.cpl → Enter

2. Go to Advanced tab → click Environment Variables

3. Under System variables, find Path → click Edit

4. Click New, then add these (adjust if your install paths differ):

• C:\\Program Files\\Git\\cmd
• C:\\Program Files\\nodejs`
                  },
                  {
                    title: "Verify PATH is set correctly",
                    description: `Close and reopen Command Prompt, then run:`,
                    commands: [
                      "git --version",
                      "npm --version"
                    ]
                  },
                  {
                    title: "Success!",
                    description: `You should now see both commands return version numbers — meaning your PATH is set up correctly`
                  }
                ]
              }
            }
          ]
        },
        {
          title: "Connect Git to Your GitHub Account",
          description: `Configure Git with your personal information. In Terminal (Mac) or Command Prompt (Windows), type these commands one at a time (replace with your info):`,
          subsections: [
            {
              title: "Set your name",
              description: "The name used above will appear on all your code commits to show who made the changes.",
              commands: [
                'git config --global user.name "Your Name"'
              ]
            },
            {
              title: "Set your email",
              description: "Use the same email address you used to sign up for GitHub. This links your commits to your GitHub account.",
              commands: [
                'git config --global user.email "your.email@example.com"'
              ]
            },
            {
              title: "Example:",
              codeBlock: `git config --global user.name "Jane Doe"
git config --global user.email "jane.doe@email.com"`
            }
          ]
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
    title: "Define App Vision",
    description: "Write a mini-PRD",
    heading: "Define the App Vision",
    content: "Let's capture your project idea! Fill out the sections below to describe what you're building. You can expand each section as needed, and feel free to skip any that don't apply.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/3",
    detailedContent: {
      infoPanel: {
        title: "Tips for filling this out",
        content: "Be specific but concise - aim for clarity over length. Use examples when helpful. It's okay to leave sections blank if not applicable. Focus on what you want, not how to build it (that's for the AI to figure out)."
      },
      inspirationPanel: {
        title: "Ideas and inspiration",
        content: "Get inspired with rich property data for real estate apps, or explore popular app concepts like household organizers, task managers, and reward systems. Click to see all the possibilities!",
        buttonText: "Inspo me",
        buttonAction: "/insights"
      },
      prdTemplate: true
    }
  },
  {
    id: 3,
    title: "Generate Prototype",
    description: "Turn PRD into working UI",
    heading: "Generate Prototype",
    content: "Review and copy your AI-generated prompt below, then use it in Lovable to create your prototype. The prompt has been optimized specifically for Lovable's AI builder to generate a working prototype with all the features you specified.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/4",
    detailedContent: {
      sections: [
        {
          title: "Review your prompt",
          description: "Review the auto-generated prompt and fine-tune any details you like",
          templateTextbox: true,
          templateContent: ""
        },
        {
          title: "Copy prompt",
          copyPromptButton: true
        },
        {
          title: "Generate Your Prototype",
          description: "Navigate to Lovable and create your prototype.",
          subsections: [
            {
              title: "Go to Lovable",
              codeBlock: `Open a new tab and navigate to: https://lovable.dev/`
            },
            {
              title: "Create Your Project",
              codeBlock: `1. Click "Create New Project" or similar button
2. Paste your prompt from the clipboard (you copied it in Step 2)
3. Let Lovable generate your UI prototype
4. Make any adjustments or refinements as needed`
            }
          ]
        }
      ],
      infoPanel: {
        title: "FYI",
        content: "We're using Lovable to rapidly build the frontend to save us time. It takes forever to build a great experience from scratch using any other approach"
      }
    }
  },
  {
    id: 4,
    title: "Export to GitHub",
    description: "Move project to personal repo",
    heading: "Export to GitHub",
    content: "Time to turn your designs into actual code! We'll export your prototype into clean, production-ready code that you can customize and extend.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/5",
    detailedContent: {
      sections: [
        {
          title: "Connect to GitHub",
          description: "From the Lovable editor, click the GitHub icon in the top-right toolbar.\nThis opens the integration panel.",
          screenshot: "Lovable_1.png"
        },
        {
          title: "Link Your GitHub Account",
          description: "Select Connect GitHub to authorise Lovable with your GitHub account.\nYou'll be redirected to GitHub to grant access, then returned to Lovable.",
          screenshot: "Lovable_2.png"
        },
        {
          title: "Choose Your Organisation",
          description: "Once connected, choose your personal GitHub account (or an organisation you belong to) from the list under GitHub Organisations, then click Connect Project.",
          screenshot: "Lovable_3.png"
        },
        {
          title: "Confirm the Transfer",
          description: "A confirmation window appears.\nClick Transfer anyway to move the project to your GitHub account and activate two-way sync.\n\n⚠️ This step is not reversible—the Lovable project will now live in GitHub.",
          screenshot: "Lovable_4.png"
        },
        {
          title: "Verify the Connection",
          description: "After transfer, the GitHub panel will show your project as Connected.\nUse the View on GitHub button to open the repository in a new tab, or copy the HTTPS/SSH clone link to pull it locally.",
          screenshot: "Lovable_5.png"
        },
        {
          title: "You're Done!",
          description: "Your prototype is now hosted in GitHub which means you can:",
          bulletPoints: [
            "Open the code in Void Editor (you downloaded this earlier)",
            "Use the chat window in Void to make changes to the app using natural language",
            "Connect the app in GitHub to a hosting service (we'll do this on the last page)"
          ]
        }
      ],
      infoPanel: {
        title: "FYI",
        content: "While you have the Github project page open, copy and paste the URL somewhere so you can use it in the next few pages."
      }
    }
  },
  {
    id: 5,
    title: "Vibe Coding Flow",
    description: "Get familiar with core concept",
    heading: "Learn the Vibe Coding Flow",
    content: "Your guide to safely experimenting with code like a pro. Learn the tools, mindset, and best practices for AI-assisted development.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/6",
    detailedContent: {
      sections: [
        {
          title: "Void Editor Overview",
          description: "Get familiar with the key areas of Void Editor before you start coding:",
          subsections: [
            {
              title: "File Explorer",
              description: `This panel lists all the files and folders in your project repository. Use it to browse your codebase, open files for editing, or check configuration files such as package.json, .env.local, and vite.config.ts.`,
              screenshot: "Void-1.png"
            },
            {
              title: "Code Editor & File Inspector",
              description: `This is where the contents of each file are displayed. You can view, edit, and review code directly here. You'll also use this section later to insert API keys or update environment variables. The editor provides syntax highlighting, inline error hints, and live updates synced to your connected GitHub repository.`,
              screenshot: "Void-2.png"
            },
            {
              title: "AI Chat Window",
              description: `This built-in assistant works like ChatGPT or Claude but with full awareness of your project files. You can ask it to explain, modify, or create code, and it will automatically update the corresponding files in your workspace. Treat it as your coding copilot — it can see your repo structure, interpret your instructions, and write or refactor code for you.`,
              screenshot: "Void-3.png"
            }
          ]
        },
        {
          title: "Coding Mindset",
          description: "Before we start, let's set the right expectations:",
          bulletPoints: [
            "You don't need to know how everything works — you just need to know what to ask the AI",
            "Focus on intent: describe what you want to achieve, not how to code it",
            "If something breaks, that's normal. Every coder breaks things — and fixes them again",
            "You can't permanently damage the app. Every change is reversible"
          ]
        },
        {
          title: "Vibe Coding Lifecycle",
          description: "This visual guide shows the iterative workflow you'll follow when making code changes. Each cycle represents one complete iteration: clone or pull the latest code, create a feature branch, make changes, test locally, then merge and push to GitHub. Repeat as needed!",
          screenshot: "vibe-coding-lifecycle_1.png"
        },
        {
          title: "Success Patterns - Best Practices",
          description: "Follow these patterns for smooth vibe coding:",
          bulletPoints: [
            "Use descriptive branch names (e.g., update-homepage-text, not test1)",
            "Review your app in the browser before merging",
            "Ask 'why' questions to the AI — they build understanding faster than 'how'",
            "Commit and merge when your change feels complete, not perfect"
          ]
        },
        {
          title: "Vibe Coder's Glossary",
          description: "Quick definitions for common terms:",
          tabs: [
            {
              title: "A-C",
              content: {
                subsections: [
                  {
                    title: "Branch",
                    codeBlock: `A separate workspace for your edits. Like a personal copy of the code where you can experiment safely.`
                  },
                  {
                    title: "Commit",
                    codeBlock: `A snapshot of your progress. Like saving a checkpoint in a video game.`
                  }
                ]
              }
            },
            {
              title: "D-M",
              content: {
                subsections: [
                  {
                    title: "Deploy",
                    codeBlock: `Publishing your work to the live web version. Making your app accessible to users on the internet.`
                  },
                  {
                    title: "Main Branch",
                    codeBlock: `The primary version of your code. The "official" version that everyone sees.`
                  },
                  {
                    title: "Merge",
                    codeBlock: `Combining your branch with the main app. Moving your changes from your workspace into the official project.`
                  }
                ]
              }
            },
            {
              title: "R-Z",
              content: {
                subsections: [
                  {
                    title: "Repo (Repository)",
                    codeBlock: `The digital folder that holds all project files. Like a Dropbox folder for code.`
                  },
                  {
                    title: "Feature Branch",
                    codeBlock: `Your personal workspace for making changes. A temporary copy of the code where you can experiment.`
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  },
  {
    id: 6,
    title: "Your First Commit",
    description: "Merge your first code update",
    heading: "Make Your First Commit",
    content: "Follow these step-by-step instructions to make your first code changes and commit them to GitHub.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/7",
    detailedContent: {
      sections: [
        {
          title: "Sync Void Editor with GitHub",
          description: "Clone your GitHub repository to your local computer and open it in Void Editor.",
          subsections: [
            {
              title: "Clone Your Repository",
              description: `First, you need to download your project from GitHub to your computer. You'll need the GitHub repository URL (you should have copied this from the previous page).

In the AI chat window in Void Editor, ask the AI to clone your repository:`,
              commands: [
                "clone my repository from [your-github-repo-url]"
              ]
            },
            {
              title: "⚠️ Important",
              description: `The repository will be cloned into the current folder you're in. Make sure you're in the folder where you want to save your project (like Documents or Desktop).

Ask one of the facilitators to help you with this step if you are not confident with changing directories in your terminal/command prompt.`
            },
            {
              title: "Where Does It Get Saved?",
              description: `By default, git clone creates a new folder with your project name in your current directory. 

If you want to save it in a specific location, you can:
1. Navigate to that folder first (ask the AI: "change directory to Documents" or "cd to Desktop")
2. Then clone the repository

The AI will create a folder with your project name in whatever folder you're currently in.`
            },
            {
              title: "Example",
              codeBlock: `clone my repository from https://github.com/yourusername/your-project-name.git

The AI will run the git clone command for you. This creates a folder on your computer with all your project files.`
            },
            {
              title: "Open Your Project in Void Editor",
              codeBlock: `1. Open Void Editor
2. Click "Open Folder" or use File → Open Folder
3. Navigate to the project folder you just cloned
4. Select the folder and click "Open"`
            },
            {
              title: "Pull Latest from Main",
              description: `Before making changes, always pull the latest code from GitHub. This ensures you're working with the most recent version.

In the AI chat window in Void Editor, ask the AI to pull the latest changes:`,
              commands: [
                "pull the latest from main branch"
              ]
            },
            {
              title: "What the AI Does",
              codeBlock: `The AI will run these commands for you:
• git checkout main
• git pull origin main

This updates your local copy with any new changes from GitHub.`
            },
            {
              title: "What's Actually Happening",
              codeBlock: `When you clone, you're downloading a complete copy of your project from GitHub to your computer. When you pull, you're updating that copy with any new changes from GitHub.`
            }
          ]
        },
        {
          title: "Create a Feature Branch",
          description: "Create your own workspace to safely make changes without affecting the main app.",
          subsections: [
            {
              title: "In AI Chat Window",
              description: `Type this command in the AI chat window in Void Editor:`,
              commands: [
                "create new feature branch called [describe-your-change]"
              ]
            },
            {
              title: "Example",
              commands: [
                "create new feature branch called update-welcome-text"
              ]
            },
            {
              title: "Why Feature Branches Matter",
              description: `Think of your codebase like a digital workshop:

The main branch is the finished display shelf

A feature branch is your personal workbench where you can edit and test freely

Once your changes are complete, you move them from your workbench to the shelf (merge into main)

Using feature branches keeps related edits together as one package (for example, "update logo" and "resize logo"). This reduces unnecessary deployments, saving time when deploying to production later.`
            },
            {
              title: "Visual Analogy",
              description: `Imagine a team Miro board:

The main wall is the shared board that everyone can see

Each participant has a tracing sheet — their own feature branch

You can sketch, colour, and revise freely on your sheet

When ready, you overlay your tracing sheet onto the main board (merge to main)

This ensures everyone's contributions are combined neatly without overwriting each other's work.`
            },
            {
              title: "What's Actually Happening",
              description: `The AI makes a new copy of the code just for you. This copy is completely separate from the main app, so you can experiment freely without breaking anything.`
            }
          ]
        },
        {
          title: "Make Code Changes via Prompt",
          description: "Describe the changes you want in plain English, and let the AI do the coding.",
          subsections: [
            {
              title: "In AI Chat Window",
              description: `Type your request naturally, describing what you want to change:`,
              codeBlock: `Examples:

Update the welcome message to say "Welcome to our amazing app!"

Change the header background color to navy blue

Add a new button that says "Get Started" below the hero text`
            },
            {
              title: "What Happens",
              description: `The AI will:

Understand your request

Find the relevant files

Make the code changes

Show you what it changed`
            },
            {
              title: "Review the Changes",
              description: `The AI will show you which files were modified. Look for:

File names that were changed

A summary of what was updated

Code snippets showing the changes`
            },
            {
              title: "⚠️ Tip",
              description: `While you are unlikely to be able to understand any of the above, it is worth paying attention to catch obvious mistakes. AI code assistants often goes off track and it's not hard to spot. Don't hesitate to hit the STOP button and redirecting the assistant back on track.`
            },
            {
              title: "Make Additional Changes",
              description: `You can continue requesting changes in the same chat:

Actually, make that button green instead of blue

Also add my company logo to the header

The AI will keep making changes to your feature branch until you're ready to test.`
            },
            {
              title: "What's Actually Happening",
              description: `The AI is editing your code files based on your natural language instructions. All changes are saved to your feature branch automatically.`
            }
          ]
        },
        {
          title: "Test Your Changes Locally",
          description: "Run your app locally to preview changes before publishing.",
          subsections: [
            {
              title: "Start Development Server",
              description: `In the Terminal window (in Void Editor), run:`,
              commands: [
                "npm run dev"
              ]
            },
            {
              title: "What This Does",
              description: `This command starts your app in development mode, running a local version on your computer that automatically refreshes when you make changes.

You'll see a local address like: http://localhost:3000

Hold Ctrl (or Cmd on Mac) and click the address shown in your Void terminal to open it in your browser.`
            },
            {
              title: "Verify Your Changes",
              description: `Use this preview to:

Verify your edits appear correctly

Check layouts, text, and images

Ask the AI to correct anything that looks off`
            },
            {
              title: "If Changes Don't Appear",
              codeBlock: `Press Ctrl + C (or Cmd + C on Mac) in the terminal to stop the app, then run npm run dev again to restart it.`
            },
            {
              title: "What's Actually Happening",
              description: `Starts a mini web server on your laptop so you can test locally. The app runs on your computer, not on the internet, so you can experiment safely.`
            }
          ]
        },
        {
          title: "Merge & Push to GitHub",
          description: "Complete your changes and publish them to GitHub.",
          subsections: [
            {
              title: "In AI Chat Window",
              description: `Once you're happy with your changes, type:`,
              commands: [
                "merge this feature branch to main and push to remote"
              ]
            },
            {
              title: "What Happens",
              description: `This final command wraps up all your work and uploads it to GitHub. When integrated with Vercel (we'll do this on the next page), it will automatically deploy the latest version of main to a live URL.

Analogy: This is like packaging your finished feature and placing it on the public display shelf for everyone to see.`
            },
            {
              title: "What's Actually Happening",
              description: `Combines your edits into the official project and pushes to GitHub. Your changes are now part of the main app and will be deployed to production.`
            }
          ]
        },
        {
          title: "Common AI Prompts",
          description: "Ready-made prompts you can use in the AI chat window:",
          tabs: [
            {
              title: "Code Adjustments",
              content: {
                subsections: [
                  {
                    title: "Examples",
                    description: `Ready-made prompts you can copy and use:`,
                    commands: [
                      "Change the button colour to match the brand palette",
                      "Add a new section on the homepage titled \"About Us\"",
                      "Remove the background image from the login page",
                      "Update the footer text to include contact information",
                      "Change the font size of the main heading"
                    ]
                  }
                ]
              }
            },
            {
              title: "Debugging",
              content: {
                subsections: [
                  {
                    title: "Examples",
                    description: `Ready-made prompts you can copy and use:`,
                    commands: [
                      "The app isn't loading correctly — help me find the error",
                      "Fix the layout alignment on the setup page",
                      "Explain what this error message means and how to fix it",
                      "The button isn't working when I click it",
                      "The page is blank, what went wrong?"
                    ]
                  }
                ]
              }
            },
            {
              title: "Learning",
              content: {
                subsections: [
                  {
                    title: "Examples",
                    description: `Ready-made prompts you can copy and use:`,
                    commands: [
                      "Explain what this line of code does",
                      "Show me how this component connects to the page",
                      "What does this function do?",
                      "How does this feature work?",
                      "Why is this code structured this way?"
                    ]
                  }
                ]
              }
            }
          ]
        },
        {
          title: "If Something Isn't Working",
          description: "Don't panic! Here's a simple troubleshooting checklist:",
          subsections: [
            {
              title: "1. Restart the dev server",
              codeBlock: `Press Ctrl + C (or Cmd + C on Mac) in the terminal

Then run: npm run dev again`
            },
            {
              title: "2. Check your branch name",
              description: `Make sure you're still on your feature branch, not main.

Ask the AI: "What branch am I currently on?"`
            },
            {
              title: "3. Ask the AI directly",
              codeBlock: `Explain what might be wrong and how to fix it

Or describe the problem: "The app is showing an error when I..."
              `
            },
            {
              title: "4. Reset if needed",
              description: `If all else fails and you're not happy with the current version, ask the AI assistant to delete the current branch and then try a different approach.`
            }
          ]
        }
      ]
    }
  },
  {
    id: 7,
    title: "Launch to the Web",
    description: "Deploy app to public URL",
    heading: "Launch to the Web",
    content: "Follow these steps to connect your GitHub repo and auto-deploy every time you merge to main.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/8",
    detailedContent: {
      sections: [
        {
          title: "Create a New Project",
          description: "From your [Vercel dashboard](https://vercel.com/), click Add New → Project.",
          screenshot: "Vercel-1.png"
        },
        {
          title: "Import Your GitHub Repo",
          description: "Log into or choose your GitHub account then find the project you exported from Lovable previously and click Import.",
          screenshot: "Vercel-2.png"
        },
        {
          title: "Configure the Project",
          description: "Give your project a name, this will be embedded in the public URL. Then click Deploy.",
          screenshot: "Vercel-3.png"
        },
        {
          title: "Wait for Deployment",
          description: "Vercel will build and deploy your app automatically. Watch the progress at the bottom of the page until it completes.",
          screenshot: "Vercel-4.png"
        },
        {
          title: "View Your Live App",
          description: `Once complete, click Continue to Dashboard. Your app is now live on a Vercel URL.

Any future merge to main (via AI assisted prompts) in GitHub will trigger a fresh deployment.`,
          screenshot: "Vercel-5.png"
        }
      ]
    }
  },
  {
    id: 8,
    title: "Extend Your App",
    description: "Add data and AI-power",
    heading: "Extend Your App",
    content: "Take your app to the next level by adding more sophisticated features. You'll likely have time to add only one of these so choose wisely. Go on... be a real PM",
    ctaText: "Complete",
    ctaAction: "/congrats",
    detailedContent: {
      sections: [
        {
          title: "Integrate property listing data using our API",
          description: "If you created your prototype with property listing data then you can pull in live data (instead of mock data) following this step next",
          seeMoreRoute: "/extend/integrate-api"
        },
        {
          title: "Add an AI Assistant in your app workflow",
          description: "You can easily get ChatGPT to interact with any part of your app to do custom GenAI processing following this step",
          seeMoreRoute: "/extend/add-ai-assistant"
        },
        {
          title: "Add a Database",
          description: "ADVANCED FEATURE: You could extend your app to have a login flow and individual user experiences. For this you'll need to provide your AI assistant with access to a full database. Follow this step to learn how",
          seeMoreRoute: "/extend/add-database"
        }
      ]
    }
  },
];
