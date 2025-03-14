## Add comprehensive comments to explain design patterns

This issue focuses on adding detailed explanatory comments throughout the codebase to help junior developers understand the design patterns being used and their benefits.

### Goal
Add comments that explain:
- How design patterns like Dependency Injection, Builder Pattern, Command Pattern, etc. are implemented
- How these patterns work together in the codebase
- Why these patterns are valuable (not just overengineered solutions)
- Real-world benefits of using these patterns

### Target Audience
Junior developers who may be skeptical about design patterns and their practical use.

### Files to Update
- `/core/*.ts` - Core implementation files
- `/commands/*.ts` - Command implementations
- `/hooks/index.ts` - Hook implementations
- `/services/*.ts` - Service implementations
- `/index.ts` - Main demo file

### Comment Style Guidelines
- Comments should be educational and explanatory
- Avoid jargon without explanation
- Include concrete examples of benefits
- Point out alternatives and why this approach is better
- Use consistent formatting and style