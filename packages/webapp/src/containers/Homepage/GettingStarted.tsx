import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Classes, Icon } from '@blueprintjs/core';
import {
  useCurrentOrganization,
  useCustomers,
  useInvoices,
  useItems,
} from '@/hooks/query';
import { useUsers } from '@/hooks/query/users/queries';

interface Step {
  key: string;
  title: string;
  description: string;
  to: string;
  cta: string;
  done: boolean;
}

const hasRows = (data: unknown): boolean => {
  const rows = Array.isArray(data) ? data : (data as any)?.data;
  return Array.isArray(rows) && rows.length > 0;
};

const dismissKey = (organizationId?: string) =>
  `ganak:getting-started-dismissed:${organizationId || 'default'}`;

/**
 * First-run checklist for new organizations: the few things a small business
 * (or its CA) needs before sending GST invoices. Hidden once complete or
 * dismissed.
 */
export function GettingStarted() {
  const { data: organization } = useCurrentOrganization();
  const organizationId = (organization as any)?.organizationId as
    | string
    | undefined;
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(dismissKey(organizationId)) === '1',
  );

  const { data: customers, isLoading: l1 } = useCustomers({
    page: 1,
    pageSize: 1,
  });
  const { data: items, isLoading: l2 } = useItems({ page: 1, pageSize: 1 });
  const { data: invoices, isLoading: l3 } = useInvoices({
    page: 1,
    pageSize: 1,
  } as any);
  const { data: users, isLoading: l4 } = useUsers();

  if (dismissed || l1 || l2 || l3 || l4) return null;

  const usersList =
    (Array.isArray(users) ? users : (users as any)?.users) || [];
  const taxNumber = (organization as any)?.metadata?.taxNumber;

  const steps: Step[] = [
    {
      key: 'gstin',
      title: 'Add your GSTIN',
      description: 'It appears on every GST invoice you send.',
      to: '/preferences/general',
      cta: 'Add GSTIN',
      done: !!taxNumber,
    },
    {
      key: 'customer',
      title: 'Add your first customer',
      description: 'Save their GSTIN and address once, reuse on every invoice.',
      to: '/customers/new',
      cta: 'Add customer',
      done: hasRows(customers),
    },
    {
      key: 'item',
      title: 'Add a product or service',
      description: 'With its HSN/SAC code and GST rate.',
      to: '/items/new',
      cta: 'Add item',
      done: hasRows(items),
    },
    {
      key: 'invoice',
      title: 'Create your first invoice',
      description: 'Send it by email and track when it gets paid.',
      to: '/invoices/new',
      cta: 'Create invoice',
      done: hasRows(invoices),
    },
    {
      key: 'accountant',
      title: 'Invite your accountant',
      description: 'Give your CA access to your books and GST data.',
      to: '/preferences/users',
      cta: 'Invite',
      done: usersList.length > 1,
    },
  ];
  const completed = steps.filter((s) => s.done).length;

  if (completed === steps.length) return null;

  const handleDismiss = () => {
    localStorage.setItem(dismissKey(organizationId), '1');
    setDismissed(true);
  };

  return (
    <section className="g-card g-start">
      <header className="g-card__header">
        <div>
          <h3>Get started with Ganak</h3>
          <p className="g-start__progress">
            {completed} of {steps.length} done
          </p>
        </div>
        <Button
          minimal
          small
          className={Classes.TEXT_MUTED}
          onClick={handleDismiss}
        >
          Hide
        </Button>
      </header>
      <div
        className="g-start__bar"
        role="progressbar"
        aria-valuenow={completed}
        aria-valuemin={0}
        aria-valuemax={steps.length}
      >
        <span style={{ width: `${(completed / steps.length) * 100}%` }} />
      </div>
      <ol className="g-start__steps">
        {steps.map((step) => (
          <li
            key={step.key}
            className={step.done ? 'g-start__step is-done' : 'g-start__step'}
          >
            <span className="g-start__check" aria-hidden>
              {step.done ? <Icon icon="tick" size={12} /> : null}
            </span>
            <div className="g-start__text">
              <strong>{step.title}</strong>
              <span>{step.description}</span>
            </div>
            {!step.done && (
              <Link to={step.to} className="g-start__cta">
                {step.cta}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
