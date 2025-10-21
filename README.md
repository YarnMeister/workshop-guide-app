# REA Vibe Coding Workshop

## Overview
Interactive onboarding instructions for participants of the PropTech Conference on 13 November 2025. This workshop guide app provides step-by-step instructions for setting up development tools and building applications.

## Vibe Coding Cheat Sheet

### At the start of each session:
- **In AI chat window type:** "Get the latest code from main branch at @https://github.com/YarnMeister/workshop-guide-app"
- **In AI chat window type:** "Start a new feature branch for (insert short description)"
- **Make changes as needed** by asking AI assistant to update the app in multiple chat requests

### Once changes are made and app looks the way you want it:
- **In terminal window type:** `npm run dev` (this starts the app with latest changes)
- **Copy paste the URL** in the terminal into your browser to test the app

### Ready to "go live":
- **In AI chat window type:** "Merge the current feature branch to main on remote and delete the feature branch once merged"
- **This copies the changes** you made back to GitHub so that others can see your awesome changes

## App Pages Overview

The workshop guide consists of 6 main pages:

1. **Setup Tools** (`/onboarding/step/1`)
2. **Write Specs** (`/onboarding/step/2`)
3. **Prototype (UI)** (`/onboarding/step/3`)
4. **Export Project** (`/onboarding/step/4`)
5. **Add Backend** (`/onboarding/step/5`)
6. **Launch App** (`/onboarding/step/6`)

## Technical Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Build Tool**: Vite
- **Routing**: React Router
- **Icons**: Lucide React

## Development

### Prerequisites
- Node.js (LTS version)
- npm or yarn

### Getting Started
```bash
# Clone the repository
git clone https://github.com/YarnMeister/workshop-guide-app.git

# Navigate to project directory
cd workshop-guide-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure
```
src/
├── components/          # Reusable UI components
├── data/               # Application data (steps, content)
├── pages/              # Page components
├── hooks/              # Custom React hooks
└── lib/                # Utility functions
```

## Features

- **Step-by-step guidance**: Clear instructions for each workshop phase
- **Progress tracking**: Binary sliders to mark step completion
- **Copy-to-clipboard**: Easy command copying for terminal instructions
- **Responsive design**: Works on desktop and mobile devices
- **Interactive navigation**: Breadcrumb navigation between steps
- **Validation**: Next button disabled until all steps are completed
- **Visual feedback**: Progress summary and completion indicators

## Contributing

1. Create a feature branch for your changes
2. Follow the established style guide for content
3. Test your changes locally with `npm run dev`
4. Merge to main when ready to deploy

## License

This project is part of the REA Vibe Coding Workshop for the PropTech Conference 2025.

## Style Guide

Based on the Setup Tools page implementation, here are the styling patterns for consistent content creation:

### H1 - Page Headings
```css
text-3xl font-bold tracking-tight sm:text-4xl
```
- **Usage**: Main page titles (e.g., "Setup Your Development Environment")
- **Size**: Large, bold, responsive
- **Example**: Page title at the top of each step

### H2 - Section Headings
```css
font-semibold text-lg
```
- **Usage**: Main section titles within steps (e.g., "Create Your Accounts")
- **Size**: Medium, semibold
- **Example**: Step titles like "Install Void Editor", "Connect Git to Your GitHub Account"

### H3 - Subsection Headings
```css
font-medium text-sm
```
- **Usage**: Subsection titles (e.g., "GitHub Account", "Set your name")
- **Size**: Small, medium weight
- **Example**: Individual instruction titles within sections

### Paragraph Text
```css
text-sm text-muted-foreground
```
- **Usage**: Instructions, descriptions, and explanatory text
- **Size**: Small, muted color
- **Example**: Step descriptions, instruction text, explanations

### Code Blocks
```css
overflow-x-auto rounded-md bg-muted p-4 text-sm
```
- **Usage**: Code snippets, commands, and technical content
- **Background**: Light grey (`bg-muted`)
- **Padding**: 4 units
- **Example**: Terminal commands, code examples, URLs

### Copyable Commands
```css
flex items-center justify-between rounded-md bg-muted p-3 text-sm
```
- **Usage**: Individual commands that can be copied to clipboard
- **Features**: Copy button, grey background, compact padding
- **Example**: `git config --global user.name "Your Name"`
