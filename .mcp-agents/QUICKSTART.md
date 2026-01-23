# Tillerstead.com MCP Agents - Quick Start Guide

## Installation

### 1. Install Dependencies

```powershell
cd .mcp-agents
npm install
```

### 2. Build All Agents

```powershell
npm run build
```

### 3. Configure VS Code

Add to your `settings.json`:

```json
{
  "mcpServers": {
    "tillerstead-jekyll": {
      "command": "node",
      "args": ["c:/web-dev/github-repos/Tillerstead.com/.mcp-agents/jekyll-specialist/build/index.js"]
    },
    "tillerstead-seo": {
      "command": "node",
      "args": ["c:/web-dev/github-repos/Tillerstead.com/.mcp-agents/seo-specialist/build/index.js"]
    },
    "tillerstead-calculator": {
      "command": "node",
      "args": ["c:/web-dev/github-repos/Tillerstead.com/.mcp-agents/calculator-specialist/build/index.js"]
    },
    "tillerstead-orchestrator": {
      "command": "node",
      "args": ["c:/web-dev/github-repos/Tillerstead.com/.mcp-agents/orchestrator/build/index.js"]
    }
  }
}
```

## Usage Examples

### Jekyll Operations

```
@tillerstead-jekyll audit all includes in C:/web-dev/github-repos/Tillerstead.com
@tillerstead-jekyll find duplicates in C:/web-dev/github-repos/Tillerstead.com
@tillerstead-jekyll merge includes with hash abc123 (dry run)
@tillerstead-jekyll update references from hero.html to sections/section-hero.html
@tillerstead-jekyll validate naming conventions
```

### SEO Operations

```
@tillerstead-seo validate meta tags for all pages
@tillerstead-seo generate LocalBusiness schema for contact page
@tillerstead-seo optimize images in C:/web-dev/github-repos/Tillerstead.com
@tillerstead-seo check performance for https://tillerstead.com
@tillerstead-seo validate sitemap
```

### Calculator Operations

```
@tillerstead-calculator calculate tiles for 10x12 room with 12 inch tiles
@tillerstead-calculator update tile presets
@tillerstead-calculator export calculation as JSON
```

### Orchestration

```
@tillerstead-orchestrator run full audit for C:/web-dev/github-repos/Tillerstead.com
@tillerstead-orchestrator deploy feature "contact form"
@tillerstead-orchestrator generate audit report
```

## Common Workflows

### 1. Refactor Includes

```powershell
# Step 1: Audit
@tillerstead-jekyll audit includes in C:/web-dev/github-repos/Tillerstead.com detailed

# Step 2: Find duplicates
@tillerstead-jekyll find duplicates

# Step 3: Review and merge (dry run first)
@tillerstead-jekyll merge includes hash=abc123 dryRun=true

# Step 4: Execute merge
@tillerstead-jekyll merge includes hash=abc123 dryRun=false
```

### 2. SEO Optimization

```powershell
# Validate all meta tags
@tillerstead-seo validate meta tags

# Generate missing schemas
@tillerstead-seo generate LocalBusiness schema for contact.html

# Optimize images
@tillerstead-seo optimize images dryRun=false

# Check performance
@tillerstead-seo check performance url=https://tillerstead.com device=mobile
```

### 3. Full Site Audit

```powershell
@tillerstead-orchestrator run full audit with performance check
```

## Development

### Adding a New Tool

1. Create tool file in `<agent>/src/tools/my-tool.ts`
2. Implement tool function with `AgentResult` return type
3. Register tool in `<agent>/src/index.ts`
4. Rebuild: `npm run build`

### Testing

```powershell
# Test individual agent
cd jekyll-specialist
npm test

# Test all agents
npm run test:all
```

## Troubleshooting

### Agent Not Found

Ensure the agent is built:
```powershell
cd .mcp-agents/<agent-name>
npm run build
```

### Permission Denied

On Windows, run:
```powershell
npm run build
```

### Type Errors

Ensure shared package is built first:
```powershell
cd shared
npm run build
cd ..
npm run build
```

## Next Steps

1. **Implement remaining specialist agents:**
   - Design System specialist
   - QA/Testing specialist

2. **Connect orchestrator to specialists:**
   - Inter-agent communication
   - Workflow automation

3. **Add advanced features:**
   - Real Lighthouse integration
   - Automated image optimization
   - JavaScript AST parsing for preset updates

4. **Documentation:**
   - API reference
   - Architecture diagrams
   - Usage examples

---

**Created:** January 23, 2026
**Version:** 1.0.0
**Author:** Tillerstead Development Team
