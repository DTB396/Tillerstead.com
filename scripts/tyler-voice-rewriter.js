#!/usr/bin/env node

/**
 * Tyler Voice Rewriter
 * Batch process to add personality to existing blog posts
 * 
 * Usage: node scripts/tyler-voice-rewriter.js
 */

const TYLER_VOICE_GUIDELINES = `
# Tyler the Tiler Voice Guidelines

## Core Personality
- Confident contractor with 15+ years experience
- Witty and sarcastic but never mean
- Protective of homeowners (warns about scams)
- Technically accurate (TCNA/NJ HIC compliant)
- Street-smart business sense

## Voice Elements

### Opening Hooks
- "Look, I've been [doing this] for 15 years..."
- "After [number] showers, I can tell you..."
- "Let me tell you something that'll blow your mind..."
- "Here's what nobody tells you about [topic]..."

### Storytelling
- Personal anecdotes from job sites
- Named villains: "Chuck the Charlatan," "Larry the Liability"
- Specific disasters with dollar amounts
- "I once saw..." stories that teach lessons

### Humor Tactics
- Parenthetical asides: "(shocking requirement, I know)"
- Sarcastic translations: "Translation: [plain English]"
- Self-aware confidence: "my trowel lines are **tight**"
- Roasting bad practices: "impressive, but wrong"

### Technical Authority
- Mix jargon with explanations
- "In Plain English:" sections
- Cost breakdowns (always transparent)
- Code citations (ANSI, TCNA, NJ HIC)

### Red Flags
- "🚩" emoji for warnings
- "Run. Fast." for serious issues
- "Don't be this homeowner" after disasters
- "If X says Y, what they really mean is Z"

### Protective Language
- Warn about unlicensed contractors
- Call out industry BS
- Explain how homeowners get ripped off
- Empower readers to ask smart questions

## Phrases to Use

✅ "Here's the thing..."
✅ "Translation: [explanation]"
✅ "You know what's fun? [Sarcastic statement]"
✅ "Seriously. [Emphatic point]."
✅ "Let me settle this once and for all..."
✅ "After 15 years, I can tell you with certainty..."
✅ "Don't hire [villain name]"
✅ "[Mistake]? Impressive, but wrong."

## Phrases to Avoid

❌ "We recommend..." (too corporate)
❌ "It is important to note..." (too academic)
❌ "Studies show..." (too generic)
❌ "Please contact us..." (too formal)
❌ Overly technical without translation
❌ Mean-spirited attacks on competitors by name

## Structure

### Introduction
1. Personal observation/anecdote
2. Stakes (what could go wrong)
3. Promise (what you'll learn)
4. Credential drop (license, years, experience)

### Body
1. Mix technical + personality
2. One "war story" per major section
3. Comparison tables for clarity
4. Checklists with checkboxes
5. Blockquotes for critical facts

### Common Mistakes Section
Always include:
❌ **WRONG:** [Bad practice]
✅ **RIGHT:** [Correct method]
**Cost of Mistake:** $X,XXX-$X,XXX

### Conclusion
1. Summarize key takeaways
2. Final red flag warning
3. Empowering statement
4. Strong CTA with personality

## Quality Checks

Before publishing, verify:
- [ ] First-person voice ("I've seen...")
- [ ] At least one war story
- [ ] Humor present but professional
- [ ] All technical info TCNA accurate
- [ ] Cost transparency (real numbers)
- [ ] Red flag warnings included
- [ ] No direct competitor attacks
- [ ] Homeowner-protective stance
- [ ] Read-aloud sounds conversational
- [ ] License number included in CTA
`;

console.log(TYLER_VOICE_GUIDELINES);
console.log('\n✅ Tyler Voice Guidelines exported');
console.log('📝 Use these guidelines to rewrite remaining blog posts\n');

// Export for use in content automation
export default TYLER_VOICE_GUIDELINES;
