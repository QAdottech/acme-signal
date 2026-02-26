'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { CheckCircle2, Download, Loader2, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProposalConfig } from './types'

function formatAmount(amount: string, currency: string): string {
  const num = parseFloat(amount) || 0
  const code = currency || 'USD'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num)
  } catch {
    return `${code} ${num.toLocaleString()}`
  }
}

function get(
  searchParams: URLSearchParams,
  key: string,
  fallback: string,
): string {
  return searchParams.get(key) ?? fallback
}

const DocLink = ({
  href = '#',
  children,
}: {
  href?: string
  children: React.ReactNode
}) => (
  <a
    href={href}
    className="text-primary underline underline-offset-4 hover:opacity-80"
  >
    {children}
  </a>
)

const LOGO_PATH = '/logos/acme-crm-logo.png'

function SignPageHeader() {
  const [imgError, setImgError] = useState(false)
  const showPlaceholder = imgError

  return (
    <header className="shrink-0 border-b border-border bg-card">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
        {showPlaceholder ? (
          <span className="text-lg font-semibold text-foreground">
            ACME CRM
          </span>
        ) : (
          <img
            src={LOGO_PATH}
            alt="ACME CRM"
            className="h-8 w-auto object-contain object-left max-w-[180px]"
            onError={() => setImgError(true)}
          />
        )}
      </div>
    </header>
  )
}

/** Wrapper that reads searchParams (suspends). Renders SignForm with merged proposal. */
function SignFormWithParams({
  signatureFontClassName,
  proposal: initialProposal,
}: {
  signatureFontClassName: string
  proposal: ProposalConfig
}) {
  const searchParams = useSearchParams()
  const proposal: ProposalConfig = {
    ...initialProposal,
    customerName: get(
      searchParams,
      'customer_name',
      initialProposal.customerName,
    ),
    dealName: get(searchParams, 'deal_name', initialProposal.dealName),
    amount: get(searchParams, 'amount', initialProposal.amount),
    currency: get(searchParams, 'currency', initialProposal.currency),
    termLength: get(searchParams, 'term_length', initialProposal.termLength),
    renewalBehavior: get(
      searchParams,
      'renewal_behavior',
      initialProposal.renewalBehavior,
    ),
    cancellationWindow: get(
      searchParams,
      'cancellation_window',
      initialProposal.cancellationWindow,
    ),
    seats: get(searchParams, 'seats', initialProposal.seats),
    slaTier: get(searchParams, 'sla_tier', initialProposal.slaTier),
    paymentTerms: get(
      searchParams,
      'payment_terms',
      initialProposal.paymentTerms,
    ),
    billingFrequency: get(
      searchParams,
      'billing_frequency',
      initialProposal.billingFrequency,
    ),
    recipientEmail: get(
      searchParams,
      'recipient_email',
      initialProposal.recipientEmail,
    ),
    countersignDays: get(
      searchParams,
      'countersign_days',
      initialProposal.countersignDays,
    ),
  }
  return (
    <SignForm
      signatureFontClassName={signatureFontClassName}
      proposal={proposal}
    />
  )
}

function SignForm({
  signatureFontClassName,
  proposal,
}: {
  signatureFontClassName: string
  proposal: ProposalConfig
}) {
  const [signature, setSignature] = useState('')

  const [signed, setSigned] = useState(false)
  const [loading, setLoading] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [authorizedToSign, setAuthorizedToSign] = useState(false)
  const [poNumber, setPoNumber] = useState('')
  const [needChangesSent, setNeedChangesSent] = useState(false)
  const [needChangesName, setNeedChangesName] = useState('')
  const [needChangesEmail, setNeedChangesEmail] = useState('')
  const [needChangesMessage, setNeedChangesMessage] = useState('')

  const customerCompany =
    proposal.customerCompany || proposal.customerName || '—'
  const countersignDays = proposal.countersignDays || '3'

  const handleSign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!signature.trim() || !agreeToTerms) return
    setLoading(true)
    setTimeout(() => {
      setSigned(true)
      setLoading(false)
    }, 600)
  }

  const handleNeedChanges = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(
      `Proposal question: ${proposal.dealName || 'Deal'}`,
    )
    const parts = []
    if (needChangesName) parts.push(`Name: ${needChangesName}`)
    if (needChangesEmail) parts.push(`Reply to: ${needChangesEmail}`)
    parts.push(
      needChangesMessage ||
        'I have a question or would like to request changes to this proposal.',
    )
    const body = encodeURIComponent(parts.join('\n\n'))
    if (proposal.supportEmail) {
      window.location.href = `mailto:${proposal.supportEmail}?subject=${subject}&body=${body}`
    }
    setNeedChangesSent(true)
  }

  if (signed) {
    const signatureDate = new Date().toLocaleDateString()
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-8 w-8 shrink-0" />
            <CardTitle className="text-xl">Signed!</CardTitle>
          </div>
          <CardDescription>
            Thank you. Your signature has been recorded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Signed on {signatureDate}
            {proposal.proposalId && <> · Proposal ID: {proposal.proposalId}</>}
          </p>
          <p className="text-sm text-muted-foreground">
            You signed as{' '}
            <span
              className={cn(
                'font-medium not-italic text-foreground',
                signatureFontClassName,
              )}
              style={{ fontSize: '1.25rem' }}
            >
              {signature.trim() || '—'}
            </span>
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
            >
              <Download className="h-4 w-4" />
              Download your copy
            </a>
            <p className="text-sm text-muted-foreground">
              Check your inbox for a copy.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasPaymentParams =
    proposal.billingFrequency ||
    proposal.invoiceStartDate ||
    proposal.taxHandling

  return (
    <div className="w-full max-w-6xl min-w-0 space-y-6 px-1">
      {/* Key terms above the fold */}
      {(proposal.termLength ||
        proposal.renewalBehavior ||
        proposal.cancellationWindow ||
        proposal.seats ||
        proposal.slaTier ||
        proposal.paymentTerms) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Key terms</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              {proposal.termLength && (
                <li>Term length: {proposal.termLength}</li>
              )}
              {proposal.renewalBehavior && (
                <li>Renewal: {proposal.renewalBehavior}</li>
              )}
              {proposal.cancellationWindow && (
                <li>Cancellation window: {proposal.cancellationWindow}</li>
              )}
              {proposal.seats && (
                <li>Included seats / usage: {proposal.seats}</li>
              )}
              {proposal.slaTier && <li>Support / SLA: {proposal.slaTier}</li>}
              {proposal.paymentTerms && (
                <li>Payment terms: {proposal.paymentTerms}</li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Deal summary – prominent */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Deal summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-lg font-semibold">
            {formatAmount(proposal.amount || '0', proposal.currency)}
            {proposal.currency &&
              proposal.currency !== 'USD' &&
              ` ${proposal.currency}`}
            {proposal.billingFrequency && ` · ${proposal.billingFrequency}`}
            {proposal.termLength && ` · ${proposal.termLength}`}
          </p>
          <p className="text-sm text-muted-foreground">
            {proposal.dealName || '—'}
            {proposal.customerName && ` · ${proposal.customerName}`}
          </p>
        </CardContent>
      </Card>

      {/* Audit: proposal ID, last updated */}
      {(proposal.proposalId || proposal.lastUpdated) && (
        <p className="text-xs text-muted-foreground">
          {proposal.proposalId && <>Proposal ID: {proposal.proposalId}</>}
          {proposal.proposalId && proposal.lastUpdated && ' · '}
          {proposal.lastUpdated && (
            <>
              Last updated:{' '}
              {new Date(proposal.lastUpdated).toLocaleDateString()}
            </>
          )}
        </p>
      )}

      {/* Payment / invoice (optional) */}
      {hasPaymentParams && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment & invoice</CardTitle>
            <CardDescription>
              Sign now, invoice later. You will be invoiced upon countersign.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {proposal.billingFrequency && (
              <p>Billing frequency: {proposal.billingFrequency}</p>
            )}
            {proposal.invoiceStartDate && (
              <p>Start date: {proposal.invoiceStartDate}</p>
            )}
            {proposal.taxHandling && <p>Tax / VAT: {proposal.taxHandling}</p>}
          </CardContent>
        </Card>
      )}

      {/* PO / reference (optional) */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="po_number" className="text-muted-foreground">
              PO or reference number (optional)
            </Label>
            <Input
              id="po_number"
              type="text"
              placeholder="Optional"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Consent */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked === true)}
            />
            <Label
              htmlFor="agree"
              className="text-sm font-normal cursor-pointer"
            >
              I agree to the Proposal and the{' '}
              <DocLink>Terms of Service</DocLink> and{' '}
              <DocLink>Data Processing Addendum</DocLink> (if applicable).
            </Label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="authorized"
              checked={authorizedToSign}
              onCheckedChange={(checked) =>
                setAuthorizedToSign(checked === true)
              }
            />
            <Label
              htmlFor="authorized"
              className="text-sm font-normal cursor-pointer text-muted-foreground"
            >
              I am authorized to sign on behalf of {customerCompany}.
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            <DocLink>Privacy policy</DocLink> ·{' '}
            <DocLink>Data Processing Addendum</DocLink>
          </p>
        </CardContent>
      </Card>

      {/* Signature */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sign</CardTitle>
          <CardDescription>
            Type your full name below. After signing, you&apos;ll receive a copy
            by email and we&apos;ll countersign within {countersignDays}{' '}
            business day{countersignDays !== '1' ? 's' : ''}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSign} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signature">Your full name</Label>
              <Input
                id="signature"
                type="text"
                placeholder="Type your full name to sign"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                autoComplete="name"
                className="ring-orange-500 focus-visible:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Signature preview</Label>
              <div
                className={cn(
                  'min-h-[3rem] rounded-md border border-dashed border-input bg-muted/20 px-4 py-3 text-2xl text-foreground',
                  signatureFontClassName,
                )}
                style={{ fontFamily: 'var(--font-signature), cursive' }}
                aria-live="polite"
              >
                {signature.trim() ? (
                  <span>{signature}</span>
                ) : (
                  <span className="text-muted-foreground italic">
                    Your signature will appear here
                  </span>
                )}
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={!signature.trim() || !agreeToTerms || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing…
                </>
              ) : (
                'Sign proposal'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Need changes? */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Need changes?</CardTitle>
          <CardDescription>
            Request edits or ask a question before signing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {needChangesSent ? (
            <p className="text-sm text-muted-foreground">
              Thanks – we&apos;ll get back to you shortly.
            </p>
          ) : proposal.supportEmail ? (
            <form onSubmit={handleNeedChanges} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="nc_name">Name</Label>
                <Input
                  id="nc_name"
                  value={needChangesName}
                  onChange={(e) => setNeedChangesName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nc_email">Email</Label>
                <Input
                  id="nc_email"
                  type="email"
                  value={needChangesEmail}
                  onChange={(e) => setNeedChangesEmail(e.target.value)}
                  placeholder="you@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nc_message">Message</Label>
                <Input
                  id="nc_message"
                  value={needChangesMessage}
                  onChange={(e) => setNeedChangesMessage(e.target.value)}
                  placeholder="Question or requested changes…"
                />
              </div>
              <Button type="submit" variant="outline" size="sm">
                <Mail className="h-4 w-4" />
                Send message
              </Button>
            </form>
          ) : (
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm text-primary underline underline-offset-4"
            >
              <Mail className="h-4 w-4" />
              Request edits
            </a>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function SignPageClient({
  signatureFontClassName,
  proposal,
}: {
  signatureFontClassName: string
  proposal: ProposalConfig
}) {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden bg-muted/30">
      <SignPageHeader />
      <main className="flex-1 w-full min-w-0 flex justify-center overflow-y-auto overflow-x-hidden p-4 py-8">
        <div className="w-full max-w-6xl min-w-0 flex justify-center">
          <Suspense
            fallback={
              <div className="w-full max-w-md rounded-lg border bg-card p-6 animate-pulse h-80" />
            }
          >
            <SignFormWithParams
              signatureFontClassName={signatureFontClassName}
              proposal={proposal}
            />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
