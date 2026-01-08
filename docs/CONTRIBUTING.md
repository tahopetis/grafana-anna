# Contributing to Anna

Thank you for your interest in contributing to Anna! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Grafana 11.0.0+
- Basic knowledge of React and TypeScript

### First Time Setup

1. Fork the repository
2. Clone your fork
```bash
git clone https://github.com/YOUR_USERNAME/grafana-anna.git
cd grafana-anna
```

3. Install dependencies
```bash
npm install --legacy-peer-deps
```

4. Create a branch
```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### 1. Choose an Issue

- Check [GitHub Issues](https://github.com/yourusername/grafana-anna/issues)
- Look for issues labeled `good first issue`
- Comment on the issue to claim it

### 2. Make Changes

- Write code following [Coding Standards](#coding-standards)
- Add tests for your changes
- Update documentation if needed

### 3. Test Your Changes

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Run tests
npm test

# Build
npm run build
```

### 4. Commit Your Changes

Follow [Commit Messages](#commit-messages) guidelines.

```bash
git add .
git commit -m "feat: add new feature"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### TypeScript

- Use strict TypeScript
- Define types for all functions
- Avoid `any` type
- Use interfaces for object shapes

Example:
```typescript
// Good
interface UserData {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<UserData> {
  // Implementation
}

// Bad
function getUser(id: any): any {
  // Implementation
}
```

### React

- Use functional components
- Use hooks for state and side effects
- Prefer composition over inheritance
- Keep components small and focused

Example:
```typescript
// Good
export const UserProfile: React.FC<Props> = ({ user }) => {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
    </div>
  );
};

// Bad
class UserProfile extends React.Component {
  render() {
    // ...
  }
}
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Files**: camelCase for utilities (`userService.ts`)
- **Variables**: camelCase (`userName`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces/Types**: PascalCase (`UserData`)

### File Organization

```
src/
├── components/
│   ├── componentName/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.test.tsx
│   │   └── index.ts
```

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings
- Add semicolons
- Max line length: 100 characters

Example:
```typescript
const greeting = 'Hello';
const message = `${greeting}, World!`;

function greet(name: string): string {
  return `Hello, ${name}!`;
}
```

## Testing Guidelines

### Unit Tests

- Write tests for all new functions
- Aim for 70%+ code coverage
- Use descriptive test names

Example:
```typescript
describe('UserService', () => {
  it('should return user data when user exists', async () => {
    const user = await userService.getUser('123');
    expect(user).toBeDefined();
    expect(user.id).toBe('123');
  });

  it('should throw error when user does not exist', async () => {
    await expect(userService.getUser('999')).rejects.toThrow();
  });
});
```

### Integration Tests

- Test service interactions
- Mock external dependencies
- Test error scenarios

### E2E Tests

- Test critical user flows
- Keep tests simple and focused
- Use Page Object Model pattern

### Test Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- UserService.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

### Examples

```
feat(query): add support for LogQL queries

Implement LogQL query generation using LLM service.
Add tests for LogQL-specific functionality.

Closes #123
```

```
fix(alerts): prevent duplicate alert correlations

Fix issue where same alerts could be correlated multiple times.
Add deduplication logic based on alert fingerprints.

Fixes #456
```

## Pull Request Process

### Before Creating PR

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Run all tests** and ensure they pass
4. **Update CHANGELOG** if applicable

### PR Title

Use the same format as commit messages:

```
feat: add support for custom dashboards
fix: resolve memory leak in conversation manager
docs: update API documentation
```

### PR Description

Include:

- **Summary**: What changes were made and why
- **Type of change**: Bug fix, feature, breaking change, etc.
- **Related issues**: Link to related issues
- **Screenshots**: For UI changes
- **Testing**: How changes were tested

### Template

```markdown
## Summary
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
```

### Review Process

1. **Automated checks**: CI/CD pipeline runs tests
2. **Code review**: Maintainers review your code
3. **Address feedback**: Make requested changes
4. **Approval**: PR approved by maintainers
5. **Merge**: PR merged into main branch

## Reporting Issues

### Bug Reports

Include:

- **Title**: Clear description of the bug
- **Description**: What happened and what you expected
- **Steps to reproduce**: Minimal reproduction
- **Environment**: Grafana version, browser, OS
- **Screenshots**: If applicable
- **Logs**: Error messages or stack traces

Template:

```markdown
**Description**
Clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment**
- Grafana version: [e.g. 11.0.0]
- Browser: [e.g. Chrome 120]
- OS: [e.g. Ubuntu 22.04]

**Logs**
Error messages or stack traces
```

### Feature Requests

Include:

- **Problem**: What problem you're trying to solve
- **Proposed solution**: How you think it should work
- **Alternatives considered**: Other approaches you thought of
- **Additional context**: Any other relevant information

## Questions or Feedback?

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Discord/Slack**: For real-time chat (if available)

## Recognition

Contributors will be recognized in:
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to Anna! 🎉
