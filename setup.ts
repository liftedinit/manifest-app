import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { config } from 'dotenv';

GlobalRegistrator.register();
config({ path: '.env.test' });
