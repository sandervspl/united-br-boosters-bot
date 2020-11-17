import { BackupDBService } from './BackupDB';
import { WelcomeService } from './Welcome';

export default [
  WelcomeService,
  BackupDBService,
] as const;
