import { DeShell } from './DeShell';
import { DeHomePage } from './pages/DeHomePage';
import type { HomeDefinition } from '../../CmsHome';
export default { Shell: DeShell, Page: DeHomePage } satisfies HomeDefinition;
