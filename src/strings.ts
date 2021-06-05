export const getGreeting = (name: string = defaultName): string =>
  `Hello ${name}!`;
export const defaultName = process.env.DEFAULT_NAME || 'World';
