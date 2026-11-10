import type { TopicWorkflow } from '../../content/en-global/topics/types';
import {
  ApprovalIcon, ConversationIcon, DeliveryIcon, DocumentIcon,
  PackageIcon, PalletIcon, ReleaseIcon,
} from '../ui/Icons';

const stepIcons = [DocumentIcon, ConversationIcon, ApprovalIcon, PalletIcon, ReleaseIcon, DeliveryIcon];

export function BulkProcurementWorkflow({ id, content }: { id: string; content: TopicWorkflow }) {
  const words = content.heading.trim().split(/\s+/);
  const emphasis = words.pop();

  return (
    <div className="bulk-workflow">
      <div className="bulk-workflow-panel">
        <h2 id={id} className="bulk-workflow-heading">
          {words.join(' ')} <span>{emphasis}</span>
        </h2>
        <div className="bulk-workflow-route" aria-hidden="true">
          <DocumentIcon />
          <span className="bulk-workflow-route-link" />
          <PackageIcon />
          <span className="bulk-workflow-route-link" />
          <DeliveryIcon />
        </div>
      </div>
      <ol className="bulk-workflow-steps" role="list">
        {content.steps.map((step, index) => {
          const Icon = stepIcons[index] ?? DocumentIcon;
          return (
            <li className="bulk-workflow-step" key={step.copy}>
              <span className="bulk-workflow-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <span className="bulk-workflow-node" aria-hidden="true" />
              <Icon className="bulk-workflow-icon" />
              <div className="bulk-workflow-copy">
                {step.title && <h3>{step.title}</h3>}
                <p>{step.copy}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
