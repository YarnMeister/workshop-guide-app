import { PRDAnswers } from "./storage";

/**
 * Formats PRD answers into a readable text format for AI processing
 */
export function formatPRDForAI(answers: PRDAnswers): string {
  let formatted = "# Mini PRD\n\n";

  // Project Overview
  if (answers.projectOverview.whatBuilding || answers.projectOverview.whoFor || answers.projectOverview.problemSolves) {
    formatted += "## Project Overview\n\n";
    if (answers.projectOverview.whatBuilding) {
      formatted += `**What are you building?** ${answers.projectOverview.whatBuilding}\n\n`;
    }
    if (answers.projectOverview.whoFor) {
      formatted += `**Who is this for?** ${answers.projectOverview.whoFor}\n\n`;
    }
    if (answers.projectOverview.problemSolves) {
      formatted += `**What problem does it solve?** ${answers.projectOverview.problemSolves}\n\n`;
    }
  }

  // Success Criteria
  if (answers.successCriteria.primaryGoal || answers.successCriteria.howWillKnow || answers.successCriteria.keyUserActions) {
    formatted += "## Success Criteria\n\n";
    if (answers.successCriteria.primaryGoal) {
      formatted += `**What does success look like?** ${answers.successCriteria.primaryGoal}\n\n`;
    }
    if (answers.successCriteria.howWillKnow) {
      formatted += `**How will you know this prototype is working well?** ${answers.successCriteria.howWillKnow}\n\n`;
    }
    if (answers.successCriteria.keyUserActions) {
      formatted += `**Key user actions or behaviours you want to enable:** ${answers.successCriteria.keyUserActions}\n\n`;
    }
  }

  // Core Features
  if (answers.coreFeatures.essential || answers.coreFeatures.niceToHave) {
    formatted += "## Core Features & Functionality\n\n";
    if (answers.coreFeatures.essential) {
      formatted += `**Essential features needed:** ${answers.coreFeatures.essential}\n\n`;
    }
    if (answers.coreFeatures.niceToHave) {
      formatted += `**Nice-to-have features:** ${answers.coreFeatures.niceToHave}\n\n`;
    }
  }

  // AI Components
  if (answers.aiComponents.role || answers.aiComponents.whatShouldDo || answers.aiComponents.specificBehaviours) {
    formatted += "## AI/Intelligence Components\n\n";
    if (answers.aiComponents.role) {
      formatted += `**What role does AI play?** ${answers.aiComponents.role}\n\n`;
    }
    if (answers.aiComponents.whatShouldDo) {
      formatted += `**What should the AI do?** ${answers.aiComponents.whatShouldDo}\n\n`;
    }
    if (answers.aiComponents.specificBehaviours) {
      formatted += `**Specific AI behaviours or capabilities:** ${answers.aiComponents.specificBehaviours}\n\n`;
    }
  }

  // User Experience
  if (answers.userExperience.keyJourneys || answers.userExperience.userInteractions) {
    formatted += "## User Experience & Flow\n\n";
    if (answers.userExperience.keyJourneys) {
      formatted += `**Key user journeys:** ${answers.userExperience.keyJourneys}\n\n`;
    }
    if (answers.userExperience.userInteractions) {
      formatted += `**User interactions:** ${answers.userExperience.userInteractions}\n\n`;
    }
  }

  // UI Design
  if (answers.uiDesign.visualMood || answers.uiDesign.designReferences || answers.uiDesign.keyUIElements) {
    formatted += "## UI/Design Direction\n\n";
    if (answers.uiDesign.visualMood) {
      formatted += `**Visual mood & style:** ${answers.uiDesign.visualMood}\n\n`;
    }
    if (answers.uiDesign.designReferences) {
      formatted += `**Design references or inspiration:** ${answers.uiDesign.designReferences}\n\n`;
    }
    if (answers.uiDesign.keyUIElements) {
      formatted += `**Key UI elements:** ${answers.uiDesign.keyUIElements}\n\n`;
    }
  }

  // Technical Considerations
  if (answers.technicalConsiderations.platform || answers.technicalConsiderations.integrationNeeds || answers.technicalConsiderations.dataContent) {
    formatted += "## Technical Considerations\n\n";
    if (answers.technicalConsiderations.platform) {
      formatted += `**Platform/Format:** ${answers.technicalConsiderations.platform}\n\n`;
    }
    if (answers.technicalConsiderations.integrationNeeds) {
      formatted += `**Integration needs:** ${answers.technicalConsiderations.integrationNeeds}\n\n`;
    }
    if (answers.technicalConsiderations.dataContent) {
      formatted += `**Data/Content:** ${answers.technicalConsiderations.dataContent}\n\n`;
    }
  }

  // Constraints
  if (answers.constraints.boundaries) {
    formatted += "## Constraints & Assumptions\n\n";
    formatted += `${answers.constraints.boundaries}\n\n`;
  }

  // Additional Context
  if (answers.additionalContext.otherDetails) {
    formatted += "## Additional Context\n\n";
    formatted += `${answers.additionalContext.otherDetails}\n\n`;
  }

  return formatted.trim();
}

