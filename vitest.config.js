// vitest.config.js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    onConsoleLog(log, type) {
      // This function can be used to filter logs
      // Returning false will suppress the log
      console.log('Log in test:', log);
    },
    setupFiles: './tests/setupTests.js', // Ensure this path is correct
  },
});
