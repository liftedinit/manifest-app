import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { expect } from 'bun:test';
import matchers from '@testing-library/jest-dom/matchers';
import { config } from 'dotenv';

GlobalRegistrator.register();
config({ path: '.env.test' });

// Extend the expect object with jest-dom custom matchers
expect.extend(matchers as any);
