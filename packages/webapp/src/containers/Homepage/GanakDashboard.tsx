import React from 'react';
import { Link } from 'react-router-dom';
import { Icon, Spinner } from '@blueprintjs/core';
import type { IconName } from '@blueprintjs/core';
import {
  useAccounts,
  useInvoices,
  useCurrentOrganization,
} from '@/hooks/query';
import { useAuthenticatedAccount } from '@/hooks/query/users/queries';
import '@/style/pages/HomePage/GanakDashboard.scss';

// Fields read from the camel-cased API responses.
interface DashboardAccount {
  accountType?: string;
  amount?: number | null;
}
interface DashboardInvoice {
  id: number;
  invoiceNo?: string;
  customer?: { displayName?: string };
  invoiceDateFormatted?: string;
  dueDateFormatted?: string;
  total?: number;
  dueAmount?: number;
  currencyCode?: string;
  isPaid?: boolean;
  isFullyPaid?: boolean;
  isPartiallyPaid?: boolean;
  isOverdue?: boolean;
  isDelivered?: boolean;
  overdueDays?: number;
}

/** Formats money in the Indian style (₹1,18,000.00) or the given currency. */
export const formatMoney = (amount: number, currencyCode = 'INR') => {
  try {
    return new Intl.NumberFormat(currencyCode === 'INR' ? 'en-IN' : undefined, {
      style: 'currency',
      currency: currencyCode || 'INR',
      maximumFractionDigits: 2,
    }).format(amount || 0);
  } catch {
    return (amount || 0).toFixed(2);
  }
};

const sumByType = (accounts: DashboardAccount[], types: string[]) =>
  accounts
    .filter((a) => types.includes(a.accountType || ''))
    .reduce((acc, a) => acc + (Number(a.amount) || 0), 0);

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

interface KpiCardProps {
  label: string;
  value: string;
  hint: string;
  icon: IconName;
  tone: 'primary' | 'success' | 'warning' | 'danger';
  to: string;
}

function KpiCard({ label, value, hint, icon, tone, to }: KpiCardProps) {
  return (
    <Link to={to} className={`g-kpi g-kpi--${tone}`}>
      <div className="g-kpi__top">
        <span className="g-kpi__label">{label}</span>
        <span className="g-kpi__icon">
          <Icon icon={icon} size={16} />
        </span>
      </div>
      <div className="g-kpi__value">{value}</div>
      <div className="g-kpi__hint">{hint}</div>
    </Link>
  );
}

const QUICK_ACTIONS: { label: string; to: string; icon: IconName }[] = [
  { label: 'New invoice', to: '/invoices/new', icon: 'document' },
  {
    label: 'Record payment',
    to: '/payment-received/new',
    icon: 'bank-account',
  },
  { label: 'New bill', to: '/bills/new', icon: 'shopping-cart' },
  { label: 'New customer', to: '/customers/new', icon: 'new-person' },
  { label: 'New item', to: '/items/new', icon: 'cube-add' },
];

function InvoiceStatus({ invoice }: { invoice: DashboardInvoice }) {
  if (invoice.isFullyPaid || invoice.isPaid) {
    return <span className="g-pill g-pill--success">Paid</span>;
  }
  if (!invoice.isDelivered) {
    return <span className="g-pill g-pill--muted">Draft</span>;
  }
  if (invoice.isOverdue) {
    return (
      <span className="g-pill g-pill--danger">
        Overdue {invoice.overdueDays ? `${invoice.overdueDays}d` : ''}
      </span>
    );
  }
  if (invoice.isPartiallyPaid) {
    return <span className="g-pill g-pill--warning">Partially paid</span>;
  }
  return (
    <span className="g-pill g-pill--info">Due {invoice.dueDateFormatted}</span>
  );
}

function RecentInvoices() {
  const { data, isLoading } = useInvoices({ page: 1, pageSize: 6 } as any);
  const invoices = ((data as any)?.data || []) as DashboardInvoice[];

  return (
    <section className="g-card g-recent">
      <header className="g-card__header">
        <h3>Recent invoices</h3>
        <Link to="/invoices" className="g-link">
          View all
        </Link>
      </header>
      {isLoading ? (
        <div className="g-card__empty">
          <Spinner size={20} />
        </div>
      ) : invoices.length === 0 ? (
        <div className="g-card__empty">
          <p>No invoices yet.</p>
          <Link to="/invoices/new" className="bp4-button bp4-intent-primary">
            Create your first invoice
          </Link>
        </div>
      ) : (
        <table className="g-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Date</th>
              <th className="g-num">Amount</th>
              <th className="g-num">Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="g-strong">{invoice.invoiceNo}</td>
                <td>{invoice.customer?.displayName}</td>
                <td className="g-muted">{invoice.invoiceDateFormatted}</td>
                <td className="g-num">
                  {formatMoney(invoice.total || 0, invoice.currencyCode)}
                </td>
                <td className="g-num">
                  {formatMoney(invoice.dueAmount || 0, invoice.currencyCode)}
                </td>
                <td>
                  <InvoiceStatus invoice={invoice} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

export function GanakDashboard() {
  const { data: accountsData, isLoading } = useAccounts({});
  const { data: organization } = useCurrentOrganization();
  const { data: account } = useAuthenticatedAccount();

  const accounts = ((accountsData as any) || []) as DashboardAccount[];
  const currency =
    (organization as any)?.metadata?.baseCurrency ||
    (organization as any)?.metadata?.base_currency ||
    'INR';
  const firstName = (account as any)?.firstName || '';

  const receivable = sumByType(accounts, ['accounts-receivable']);
  const payable = sumByType(accounts, ['accounts-payable']);
  const cash = sumByType(accounts, ['cash', 'bank']);
  const taxPayable = sumByType(accounts, ['tax-payable']);
  const show = (n: number) => (isLoading ? '—' : formatMoney(n, currency));

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="g-dashboard">
      <div className="g-dashboard__hero">
        <div>
          <h1 className="g-dashboard__title">
            {greeting()}
            {firstName ? `, ${firstName}` : ''}
          </h1>
          <p className="g-dashboard__subtitle">
            {today} · Here’s where your business stands.
          </p>
        </div>
        <Link
          to="/invoices/new"
          className="bp4-button bp4-intent-primary g-hero-cta"
        >
          <Icon icon="plus" size={14} />
          <span>New invoice</span>
        </Link>
      </div>

      <div className="g-kpis">
        <KpiCard
          label="To receive"
          value={show(receivable)}
          hint="Outstanding from customers"
          icon="arrow-bottom-left"
          tone="primary"
          to="/financial-reports/receivable-aging-summary"
        />
        <KpiCard
          label="To pay"
          value={show(payable)}
          hint="Owed to vendors"
          icon="arrow-top-right"
          tone="warning"
          to="/financial-reports/payable-aging-summary"
        />
        <KpiCard
          label="Cash & bank"
          value={show(cash)}
          hint="Across all cash and bank accounts"
          icon="bank-account"
          tone="success"
          to="/cashflow-accounts"
        />
        <KpiCard
          label="GST payable"
          value={show(taxPayable)}
          hint="Tax collected, not yet paid"
          icon="percentage"
          tone="danger"
          to="/tax-rates"
        />
      </div>

      <div className="g-quick">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.to} to={action.to} className="g-quick__item">
            <span className="g-quick__icon">
              <Icon icon={action.icon} size={16} />
            </span>
            {action.label}
          </Link>
        ))}
      </div>

      <RecentInvoices />
    </div>
  );
}
