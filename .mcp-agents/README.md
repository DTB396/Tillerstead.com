# Tillerstead.com MCP Agents System

> **Expert AI agents for building, improving, and maintaining the Tillerstead.com web platform**

## Overview

This directory contains specialized Model Context Protocol (MCP) agents that provide expert assistance for developing and maintaining Tillerstead.com. Each agent is an expert in a specific domain of the project.

## 🤖 Available Agents

### 1. Jekyll/Includes Agent (`jekyll-specialist/`)
**Expertise:** Jekyll architecture, includes management, component refactoring

**Capabilities:**
- Audit and refactor `_includes/` directory
- Identify duplicate components and merge them
- Update all references when moving/renaming includes
- Enforce naming conventions (section-*, c-*, schema-*)
- Generate include dependency graphs
- Validate Liquid syntax and frontmatter

**Use Cases:**
- "Audit includes and find duplicates"
- "Merge ts-services components into one canonical version"
- "Update all references to hero.html"

---

### 2. SEO/Performance Agent (`seo-specialist/`)
**Expertise:** SEO optimization, Core Web Vitals, structured data

**Capabilities:**
- Validate meta tags (title, description, OG, Twitter)
- Generate/validate JSON-LD structured data
- Audit performance (LCP, CLS, TTI, FCP)
- Optimize images (WebP conversion, lazy loading, srcset)
- Check canonical URLs and sitemap
- Monitor Core Web Vitals scores

**Use Cases:**
- "Audit SEO for all pages"
- "Generate LocalBusiness schema for contact page"
- "Optimize images for performance"

---

### 3. Design System Agent (`design-specialist/`)
**Expertise:** Design tokens, SCSS architecture, brand consistency

**Capabilities:**
- Validate design token usage
- Audit CSS for hardcoded values
- Check contrast ratios (WCAG AA/AAA)
- Generate utility classes
- Enforce brand color palette
- Audit spacing/typography consistency

**Use Cases:**
- "Find all hardcoded colors in CSS"
- "Check contrast ratios for accessibility"
- "Generate utility classes for new spacing token"

---

### 4. Quality Assurance Agent (`qa-specialist/`)
**Expertise:** Testing, linting, accessibility, compliance

**Capabilities:**
- Run ESLint, HTMLHint, Stylelint
- Perform WCAG 2.1 AA accessibility audits
- Validate ARIA attributes
- Check keyboard navigation
- Verify TCNA/New Jersey HIC compliance
- Run Playwright tests

**Use Cases:**
- "Run full accessibility audit"
- "Fix all linting errors"
- "Validate TCNA compliance on services page"

---

### 5. Tile Calculator Agent (`calculator-specialist/`)
**Expertise:** Interactive tools, tile calculator, visualizer

**Capabilities:**
- Update TILE_PRESETS data
- Enhance calculator logic
- Add new measurement types
- Improve visualizer rendering
- Integrate with admin panel
- Export calculation data

**Use Cases:**
- "Add new tile pattern to calculator"
- "Update grout joint calculation logic"
- "Create API for tile cost estimation"

---

### 6. Orchestration Agent (`orchestrator/`)
**Expertise:** Multi-agent coordination, workflow automation

**Capabilities:**
- Coordinate multiple specialized agents
- Execute multi-step workflows
- Handle dependencies between agents
- Aggregate results from multiple agents
- Manage state across agent operations

**Use Cases:**
- "Run full site audit (SEO + performance + accessibility)"
- "Refactor includes and update design system"
- "Deploy new feature (code + tests + docs)"

---

## 🚀 Quick Start

### Installation

```bash
# Navigate to MCP agents directory
cd .mcp-agents

# Install dependencies
npm install

# Build all agents
npm run build

# Run tests
npm test
```

### Configuration

Add to your `settings.json` (VS Code):

```json
{
  "mcpServers": {
    "tillerstead-jekyll": {
      "command": "node",
      "args": [".mcp-agents/jekyll-specialist/build/index.js"]
    },
    "tillerstead-seo": {
      "command": "node",
      "args": [".mcp-agents/seo-specialist/build/index.js"]
    },
    "tillerstead-design": {
      "command": "node",
      "args": [".mcp-agents/design-specialist/build/index.js"]
    },
    "tillerstead-qa": {
      "command": "node",
      "args": [".mcp-agents/qa-specialist/build/index.js"]
    },
    "tillerstead-calculator": {
      "command": "node",
      "args": [".mcp-agents/calculator-specialist/build/index.js"]
    },
    "tillerstead-orchestrator": {
      "command": "node",
      "args": [".mcp-agents/orchestrator/build/index.js"]
    }
  }
}
```

### Usage in Copilot

```
@tillerstead-jekyll audit includes and merge duplicates
@tillerstead-seo validate meta tags for all pages
@tillerstead-design check color contrast ratios
@tillerstead-qa run accessibility audit
@tillerstead-calculator update tile presets
@tillerstead-orchestrator run full site audit
```

---

## 📁 Directory Structure

```
.mcp-agents/
├── README.md                      # This file
├── package.json                   # Root package.json
├── tsconfig.json                  # Shared TypeScript config
├── shared/                        # Shared utilities
│   ├── types.ts                  # Common types
│   ├── utils.ts                  # Helper functions
│   └── constants.ts              # Project constants
├── jekyll-specialist/            # Jekyll/Includes agent
│   ├── src/
│   │   ├── index.ts             # MCP server entry
│   │   ├── tools/               # MCP tools
│   │   └── resources/           # MCP resources
│   ├── package.json
│   └── README.md
├── seo-specialist/               # SEO/Performance agent
│   └── ...
├── design-specialist/            # Design System agent
│   └── ...
├── qa-specialist/                # Quality Assurance agent
│   └── ...
├── calculator-specialist/        # Tile Calculator agent
│   └── ...
└── orchestrator/                 # Multi-agent coordinator
    └── ...
```

---

## 🔧 Development

### Creating a New Agent

```bash
# Copy template
cp -r agent-template my-new-agent

# Update package.json
cd my-new-agent
npm init -y

# Install dependencies
npm install @modelcontextprotocol/sdk

# Implement tools in src/tools/
# Implement resources in src/resources/
# Update src/index.ts

# Build
npm run build
```

### Testing Agents

```bash
# Test individual agent
cd jekyll-specialist
npm test

# Test all agents
npm run test:all

# Integration tests
npm run test:integration
```

---

## 📊 Agent Capabilities Matrix

| Agent | Read Files | Modify Files | Run Commands | Call External APIs | Coordinate Others |
|-------|-----------|--------------|--------------|-------------------|-------------------|
| Jekyll | ✅ | ✅ | ✅ | ❌ | ❌ |
| SEO | ✅ | ✅ | ✅ | ✅ (Lighthouse) | ❌ |
| Design | ✅ | ✅ | ✅ | ❌ | ❌ |
| QA | ✅ | ✅ | ✅ | ✅ (Testing APIs) | ❌ |
| Calculator | ✅ | ✅ | ✅ | ❌ | ❌ |
| Orchestrator | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 Common Workflows

### Full Site Audit
```
@tillerstead-orchestrator run full audit
```
Executes:
1. Jekyll includes audit
2. SEO validation
3. Performance check
4. Accessibility audit
5. Design token validation
6. Generates comprehensive report

### New Feature Development
```
@tillerstead-orchestrator deploy feature "contact form"
```
Executes:
1. Create component structure
2. Generate form HTML/CSS
3. Add validation logic
4. Create tests
5. Update documentation
6. Run QA checks

### Performance Optimization
```
@tillerstead-seo optimize images
@tillerstead-design validate tokens
@tillerstead-orchestrator generate performance report
```

---

## 🔐 Security & Best Practices

- **No secrets in code**: Use environment variables
- **Validate all inputs**: Sanitize file paths and user input
- **Backup before modify**: All file modifications create backups
- **Atomic operations**: Changes are all-or-nothing
- **Audit trail**: All agent actions are logged

---

## 📚 Documentation

- [Jekyll Agent Docs](jekyll-specialist/README.md)
- [SEO Agent Docs](seo-specialist/README.md)
- [Design Agent Docs](design-specialist/README.md)
- [QA Agent Docs](qa-specialist/README.md)
- [Calculator Agent Docs](calculator-specialist/README.md)
- [Orchestrator Docs](orchestrator/README.md)

---

## 🤝 Contributing

1. Create feature branch
2. Implement agent/tool
3. Add tests (95%+ coverage)
4. Update documentation
5. Submit PR

---

## 📄 License

MIT License - See [LICENSE](../LICENSE)

---

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/tillerstead/tillerstead.com/issues)
- **Docs**: [/docs/mcp-agents/](../docs/mcp-agents/)
- **Email**: dev@tillerstead.com
