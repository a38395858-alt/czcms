import { EsShell } from './EsShell';
import { EsHomePage } from './pages/EsHomePage';
import type { HomeDefinition } from '../../CmsHome';
export default { Shell: EsShell, Page: EsHomePage } satisfies HomeDefinition;
