# Jekyll Specialist MCP Agent

Expert agent for managing Jekyll includes, components, and templates in the Tillerstead.com project.

## Capabilities

### 1. Audit Includes
Comprehensive analysis of all `_includes/` files:
- Find duplicates by content hash
- Identify unused includes
- Detect orphaned files
- Report naming convention violations

**Usage:**
```typescript
await jekyllAgent.auditIncludes(rootPath, detailed);
```

### 2. Find Duplicates
Identify identical include files:
- Content-based hashing
- Similarity threshold
- Canonical recommendation
- Reference tracking

**Usage:**
```typescript
await jekyllAgent.findDuplicates(rootPath, threshold);
```

### 3. Merge Includes
Consolidate duplicate includes:
- Select canonical version
- Update all references
- Archive redundant files
- Generate merge report

**Usage:**
```typescript
await jekyllAgent.mergeIncludes(rootPath, hash, dryRun);
```

### 4. Update References
Bulk update include references:
- Find all uses
- Replace old path with new
- Preview changes (dry run)
- Update layouts, pages, includes

**Usage:**
```typescript
await jekyllAgent.updateReferences(rootPath, oldPath, newPath, dryRun);
```

### 5. Validate Naming
Check naming conventions:
- `section-*.html` for sections
- `c-*.html` for components
- `schema-*.html` for schemas
- `page-*.html` for layouts

**Usage:**
```typescript
await jekyllAgent.validateNaming(rootPath, fix);
```

## Installation

```bash
cd jekyll-specialist
npm install
npm run build
```

## Configuration

Add to your Copilot settings:

```json
{
  "mcpServers": {
    "tillerstead-jekyll": {
      "command": "node",
      "args": [".mcp-agents/jekyll-specialist/build/index.js"]
    }
  }
}
```

## Examples

### Audit all includes
```
@tillerstead-jekyll audit includes with detailed analysis
```

### Find and merge duplicates
```
@tillerstead-jekyll find duplicates in ts-services components
@tillerstead-jekyll merge duplicates with hash abc123def
```

### Update references
```
@tillerstead-jekyll update references from hero.html to sections/section-hero.html
```

## API

All tools return standardized `AgentResult`:

```typescript
interface AgentResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
  timestamp: string;
}
```
