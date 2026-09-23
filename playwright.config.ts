import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:3100',
    browserName: 'chromium',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run ${process.env.E2E_DEV ? 'dev' : 'start'} -- --port 3100 --hostname 127.0.0.1`,
    url: 'http://127.0.0.1:3100',
    reuseExistingServer: !process.env.CI,
  },
});
