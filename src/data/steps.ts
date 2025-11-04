export const ONBOARDING_STEPS = [
  {
    id: 1,
    title: "Setup Tools",
    description: "Install requirements",
    heading: "Setup Your Development Environment",
    content: "Before we dive in, let's make sure you have all the necessary tools installed. Tick each step off as you go and review the summary at the bottom of the page before you move on to the next page.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/2",
    detailedContent: {
      infoPanel: {
        title: "Quick Tip",
        content: "Once you've created your GitHub account, it's much quicker and easier to create accounts for Vercel and Lovable using your GitHub account for authentication. This links your accounts automatically and saves you time!"
      },
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
          screenshot: "p1-image-1.png"
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
                    title: "Add Git and Node.js to Your PATH (Mac)",
                    description: `Normally Git and Node.js add themselves to your PATH automatically when installed with Homebrew or from their official installers.

If your terminal can't find them (e.g. running git --version or node --version gives "command not found"), follow these steps:

Option 1 — Quick check (most common fix)

Open a NEW Terminal.

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
                    description: `Open "Command Prompt" (search for "cmd" in Start menu)

Type the commands below one at a time. You should see version numbers for both:`,
                    commands: [
                      "git --version",
                      "npm --version"
                    ]
                  },
                  {
                    title: "Add Git and Node.js to Your PATH (Windows)",
                    description: `Normally Git and Node.js add themselves to your PATH automatically when installed from their official installers.

If your Command Prompt can't find them (e.g. running git --version or node --version gives "command not found"), follow these steps:`
                  },
                  {
                    title: "Method 1: Using System Settings",
                    description: `You can add both manually to Windows PATH:

1. Press Windows + R, type: sysdm.cpl → Enter

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
    title: "Write Specs",
    description: "Define requirements",
    heading: "Define Your Project Requirements",
    content: "Let's capture your project idea! Fill out the sections below to describe what you're building. You can expand each section as needed, and feel free to skip any that don't apply.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/3",
    detailedContent: {
      infoPanel: {
        title: "Tips for filling this out",
        content: "Be specific but concise - aim for clarity over length. Use examples when helpful. It's okay to leave sections blank if not applicable. Focus on what you want, not how to build it (that's for the AI to figure out)."
      },
      prdTemplate: true
    }
  },
  {
    id: 3,
    title: "Prototype (UI)",
    description: "Design interface",
    heading: "Create Your User Interface Prototype",
    content: "Review and copy your AI-generated prompt below, then use it in Lovable to create your prototype. The prompt has been optimized specifically for Lovable's AI builder to generate a working prototype with all the features you specified.",
    ctaText: "Next",
    ctaAction: "/onboarding/step/4",
    detailedContent: {
      sections: [
        {
          title: "Review your prompt",
          description: "Review the auto-generated prompt and fine-tune any details you like before clicking the button to copy your prompt to clipboard, ready for step 2",
          templateTextbox: true,
          templateContent: ""
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
2. Paste your prompt from the clipboard (you copied it in Step 1)
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
    title: "Export project",
    description: "Generate code",
    heading: "Export Your Project Code",
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
    title: "Customise app",
    description: "Build server logic",
    heading: "Add custom code to your Application",
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
