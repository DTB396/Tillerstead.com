# Tillerstead.com Accessibility Guide

> WCAG 2.1 AA/AAA Compliance for all disability types

## 🎯 Auto-Detected System Preferences

The site **automatically detects and applies** accessibility settings from your operating system and browser:

| System Setting | Auto-Detected | Applied Attribute |
|----------------|---------------|-------------------|
| Reduced Motion | ✅ `prefers-reduced-motion: reduce` | `.reduce-motion` class |
| High Contrast | ✅ `prefers-contrast: more` | `data-high-contrast="true"` |
| Windows High Contrast | ✅ `forced-colors: active` | `data-forced-colors="true"` |
| Dark Mode | ✅ `prefers-color-scheme: dark` | `data-color-scheme="dark"` |
| Touch Device | ✅ `pointer: coarse` | `data-pointer="coarse"`, `.touch-friendly` |
| No Hover | ✅ `hover: none` | `data-hover="none"` |
| Reduced Transparency | ✅ `prefers-reduced-transparency` | `data-reduced-transparency="true"` |
| Inverted Colors | ✅ `inverted-colors: inverted` | `data-inverted-colors="true"` |
| Low Contrast | ✅ `prefers-contrast: less` | `data-low-contrast="true"` |

### How It Works
1. **Early Detection**: A small inline script in `<head>` detects preferences before page renders
2. **No Flash**: Settings applied instantly, preventing visual jumps
3. **Live Updates**: Changes to system settings are detected and applied in real-time
4. **User Override**: Manual toolbar settings override system preferences

---

## 🔊 Text-to-Speech (Read Aloud)

Built-in text-to-speech using the Web Speech API for:
- **Blind/Low Vision users** who prefer browser TTS over screen readers
- **Dyslexia/Reading difficulties** - hear content while reading
- **Cognitive disabilities** - audio reinforcement
- **ESL learners** - pronunciation assistance

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Alt+R` | Start/toggle reading page |
| `Alt+S` | Stop reading |
| `Alt+P` | Pause/resume reading |

### JavaScript API
```javascript
// Read entire page
a11yReadPage();

// Read selected text
a11yReadSelection();

// Control playback
a11yPauseReading();
a11yResumeReading();
a11yStopReading();

// Access TTS object
a11yTTS.setRate(1.5);  // Speed: 0.5 - 2.0
a11yTTS.speak("Custom text");
```

---

## 🦻 Deaf/Hard of Hearing Support

### Visual Alternatives
- **No audio-only content** - all information available visually
- **Visual alerts** - sounds converted to screen flashes/notifications
- **Form feedback** - visual error indicators, not just audio cues

### Video Captions
- Videos without captions show a warning indicator
- Development mode logs videos missing captions

### Visual Alert API
```javascript
// Flash screen for urgent alerts
a11yVisualAlerts.flash('#ffff00', 200);

// Show visual notification
a11yVisualAlerts.notify('Message received!', {
  icon: '✅',
  duration: 5000
});
```

---

## 🎯 Accessibility Features Implemented

### Visual Accessibility
- **Screen Reader Support**: Full ARIA landmarks, labels, and live regions
- **High Contrast Mode**: Toggle via URL `?a11y-tools` or accessibility toolbar
- **Focus Indicators**: Clear 3px outline with offset on all interactive elements
- **Color Independence**: Never rely on color alone; icons, patterns, and text support
- **Reduced Motion**: Respects `prefers-reduced-motion` media query

### Motor Accessibility  
- **Keyboard Navigation**: Full site navigable via keyboard
- **Skip Links**: Multiple skip links (main content, contact section)
- **Focus Trapping**: Modals and dialogs trap focus correctly
- **Touch Targets**: Minimum 44x44px touch targets
- **No Time Limits**: No content disappears or requires quick actions

### Cognitive Accessibility
- **Clear Headings**: Proper heading hierarchy (single H1, logical order)
- **Consistent Navigation**: Same navigation structure across all pages
- **Reading Guide**: Optional line-highlighting for reading assistance
- **Dyslexia Font**: Optional dyslexia-friendly font toggle
- **Simple Language**: Clear, concise content

### Hearing Accessibility
- **No Audio-Only Content**: All information available visually
- **Visual Alerts**: Form validation uses visual indicators, not just sounds

---

## 🔧 Using Accessibility Features

### Accessibility Toolbar
Enable the toolbar by adding `?a11y-tools` to any URL:
```
https://tillerstead.com/?a11y-tools
```

Toolbar options:
- **High Contrast**: Black/white with yellow accents
- **Larger Text**: 125% or 150% text size
- **Dyslexia Font**: OpenDyslexic-style font
- **Reading Guide**: Highlights text line on hover

### Keyboard Shortcuts
| Key | Action |
|-----|--------|
| `Tab` | Move to next interactive element |
| `Shift+Tab` | Move to previous element |
| `Enter/Space` | Activate buttons/links |
| `Escape` | Close dialogs/dropdowns |
| `↑/↓` | Navigate menu items |
| `Home/End` | Jump to first/last item |

### Screen Reader Support
- All images have meaningful alt text
- Form fields have associated labels and hints
- Error messages linked to fields via `aria-describedby`
- Dynamic content announced via `aria-live` regions

---

## 🧪 Testing Accessibility

### Automated Tests
```bash
# Run pa11y accessibility audit
npm run test:a11y

# Single page test
npm run test:a11y:single

# Axe-core audit
npm run audit:a11y
```

### Manual Testing Checklist
- [ ] Navigate entire site using only keyboard
- [ ] Test with screen reader (NVDA, VoiceOver, JAWS)
- [ ] Verify at 200% zoom level
- [ ] Check in Windows High Contrast Mode
- [ ] Test with reduced motion enabled
- [ ] Verify all forms are accessible

---

## 📁 Accessibility Files

| File | Purpose |
|------|---------|
| `assets/css/accessibility.css` | All accessibility styles |
| `assets/js/accessibility.js` | Keyboard nav, focus management, announcements |
| `_includes/components/a11y-toolbar.html` | Accessibility toolbar component |
| `.pa11yci.json` | Pa11y CI configuration |

---

## 🏗️ Implementation Guide

### Adding New Components
1. Include proper ARIA roles and labels
2. Ensure keyboard accessibility
3. Provide focus indicators
4. Test with screen reader

### Form Fields
```html
<label for="field-id" class="form-label">
  Field Name
  <span class="required-indicator" aria-hidden="true">*</span>
</label>
<input 
  id="field-id" 
  name="field-name"
  required 
  aria-required="true"
  aria-describedby="field-id-hint field-id-error"
/>
<span id="field-id-hint" class="form-hint">Help text here</span>
<span id="field-id-error" class="field-error-message" role="alert"></span>
```

### Images
```liquid
{% include components/responsive-image.html 
  src="path/to/image.jpg" 
  alt="Descriptive alt text explaining the image content"
  decorative=false
%}
```

### Buttons with Icons
```html
<button type="button" aria-label="Close dialog">
  <svg aria-hidden="true" focusable="false">...</svg>
  <span class="sr-only">Close</span>
</button>
```

---

## 📊 WCAG 2.1 Compliance

### Level A (Required)
- ✅ 1.1.1 Non-text Content
- ✅ 1.3.1 Info and Relationships
- ✅ 1.4.1 Use of Color
- ✅ 2.1.1 Keyboard
- ✅ 2.4.1 Bypass Blocks
- ✅ 4.1.1 Parsing
- ✅ 4.1.2 Name, Role, Value

### Level AA (Target)
- ✅ 1.4.3 Contrast (Minimum)
- ✅ 1.4.4 Resize Text
- ✅ 2.4.3 Focus Order
- ✅ 2.4.6 Headings and Labels
- ✅ 2.4.7 Focus Visible
- ✅ 3.3.1 Error Identification
- ✅ 3.3.2 Labels or Instructions

### Level AAA (Stretch Goals)
- ✅ 1.4.6 Contrast (Enhanced)
- ✅ 2.4.8 Location (Breadcrumbs)
- ✅ 2.4.9 Link Purpose
- ✅ 3.2.5 Change on Request

---

## 🔗 Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [axe DevTools](https://www.deque.com/axe/)
- [Pa11y](https://pa11y.org/)

---

*Last updated: January 2026*
