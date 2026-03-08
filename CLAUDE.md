# CLAUDE.md - LegalFlow

This file provides guidance for AI assistants working on the LegalFlow codebase.

## Project Overview

**LegalFlow** is a legal workflow management application. The repository is in its initial stage of development.

## Repository Structure

This is a new repository. As the project grows, document the structure here:

```
LegalFlow/
├── CLAUDE.md          # AI assistant guidance (this file)
└── (project files)    # To be added
```

## Development Workflows

### Git Conventions

- **Default branch**: `main`
- **Branch naming**: Use descriptive branch names (e.g., `feature/case-management`, `fix/auth-redirect`)
- **Commit messages**: Use clear, imperative-mood messages (e.g., "Add case intake form", "Fix date parsing in contract module")
- Commit frequently with small, focused changes

### Getting Started

When the project is initialized with a framework/language, update this section with:
- Language and runtime version requirements
- Package manager and dependency installation steps
- How to run the development server
- How to run tests
- How to run linters/formatters
- Environment variable setup (`.env` files, secrets)

## Key Conventions

### Code Style

- Follow the conventions established by the project's linter/formatter configuration
- Prefer clarity over cleverness, especially in legal domain logic
- Use meaningful, domain-specific naming (e.g., `caseFile`, `courtFiling`, `clientIntake`)

### Legal Domain Notes

- Legal terminology should be used consistently throughout the codebase
- Date handling is critical in legal applications — always use timezone-aware timestamps
- Document retention and audit trails may be required — design with auditability in mind
- Access control and data privacy are paramount for legal data
- Consider compliance requirements (e.g., attorney-client privilege, data protection regulations)

## Testing

- Write tests for all business logic, especially legal workflow rules
- Update this section with the test runner command and conventions once established

## Common Pitfalls

- Do not hardcode jurisdiction-specific rules — use configuration or data-driven approaches
- Be careful with date/time calculations (deadlines, statutes of limitations)
- Ensure sensitive client data is never logged or exposed in error messages
- Do not skip validation on legal document fields — incomplete filings can have real consequences

## Environment & Deployment

- Update this section once CI/CD, staging, and production environments are configured
