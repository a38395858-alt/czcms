import { FrShell } from './FrShell';
import { FrHomePage } from './pages/FrHomePage';
import type { HomeDefinition } from '../../CmsHome';
export default { Shell: FrShell, Page: FrHomePage } satisfies HomeDefinition;
