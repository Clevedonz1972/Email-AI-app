# Email AI App - User Testing Guide

## Overview
This guide outlines test scenarios for the Email AI App's key features, focusing on accessibility, stress management, and user adaptation.

## Setup Instructions
1. Clone the repository
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   npm install
   ```
3. Start the application:
   ```bash
   docker-compose up
   ```

## Test Scenarios

### 1. Initial Onboarding
**Objective**: Verify the onboarding process and accessibility preference setup
- Complete the welcome tutorial
- Set accessibility preferences (high contrast, text size, motion reduction)
- Configure stress management settings
- Verify preferences are saved and applied

### 2. Email Processing & Stress Analysis
**Objective**: Test email stress analysis and adaptive UI
- Read sample high-stress email
- Verify stress indicator visibility
- Check automatic simplified view activation
- Test text-to-speech functionality
- Verify stress level accuracy feedback

### 3. Simplified View Mode
**Objective**: Test cognitive load reduction features
- Toggle simplified view
- Adjust text size
- Enable focus mode
- Test high contrast mode
- Verify metadata hiding/showing

### 4. AI-Assisted Replies
**Objective**: Verify AI assistance features
- Generate reply suggestions
- Test tone adjustment
- Preview simplified versions
- Use two-step confirmation
- Rate suggestion accuracy

### 5. Accessibility Features
**Objective**: Verify accessibility support
- Test keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios
- Test motion reduction
- Verify font size adjustments

### 6. Stress Management
**Objective**: Test stress monitoring and adaptation
- Monitor stress patterns
- Test break reminders
- Verify quiet hours
- Check stress analytics
- Test adaptation recommendations

## Feedback Collection

### Quick Feedback
- Use thumbs up/down for immediate feedback
- Report accessibility issues
- Rate stress level accuracy
- Suggest UI improvements

### Detailed Feedback
- Complete scenario feedback forms
- Rate feature effectiveness
- Report usability issues
- Suggest improvements

## Success Metrics
- Task completion rate
- Accessibility compliance
- Stress reduction effectiveness
- UI adaptation accuracy
- Feature discovery rate

## Known Issues
- High contrast mode may need adjustment
- Some keyboard shortcuts pending implementation
- Break reminder timing needs fine-tuning

## Reporting Issues
Please report issues through:
1. In-app feedback mechanism
2. GitHub issues
3. Direct feedback forms

## Contact
For assistance during testing, contact:
- Technical Support: support@emailai.app
- Accessibility Team: accessibility@emailai.app 