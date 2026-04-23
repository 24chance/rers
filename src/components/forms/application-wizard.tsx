'use client'

import { useState, useCallback } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Save, Send, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/card'
import { DocumentUploader } from '@/components/upload/document-uploader'
import { applicationsApi } from '@/lib/api/applications.api'
import { tenantsApi } from '@/lib/api/tenants.api'
import { ApplicationStatus, ApplicationType } from '@/types'
import type { ApplicationDocument } from '@/types'
import { toast } from '@/components/ui/toast'
import { clsx } from 'clsx'

// ─── Schemas per step ────────────────────────────────────────────────────────

const step1Schema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  type: z.nativeEnum(ApplicationType),
  studyDuration: z.string().min(1, 'Study duration is required'),
  tenantId: z.string().min(1, 'Please select the institution to review your application'),
})

const step2Schema = z.object({
  principalInvestigator: z.string().min(2, 'Principal investigator name is required'),
  coInvestigators: z.string().optional(),
})

const step3Schema = z.object({
  department: z.string().min(1, 'Department is required'),
  address: z.string().min(1, 'Address is required'),
})

const step4Schema = z.object({
  population: z.string().min(10, 'Study population description is required'),
  sampleSize: z.coerce.number().min(1, 'Sample size must be at least 1'),
  studyStartDate: z.string().min(1, 'Start date is required'),
  studyEndDate: z.string().min(1, 'End date is required'),
})

const step5Schema = z.object({
  methodology: z.string().min(20, 'Methodology description must be at least 20 characters'),
})

const step6Schema = z.object({
  ethicsStatement: z.string().min(10, 'Ethics statement is required'),
  consentDescription: z.string().min(10, 'Consent description is required'),
})

const step7Schema = z.object({
  fundingSource: z.string().min(1, 'Funding source is required'),
  budget: z.coerce.number().min(0, 'Budget must be a non-negative number'),
})

// Steps metadata
const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Investigator' },
  { id: 3, label: 'Institution' },
  { id: 4, label: 'Population' },
  { id: 5, label: 'Methodology' },
  { id: 6, label: 'Ethics' },
  { id: 7, label: 'Funding' },
  { id: 8, label: 'Documents' },
  { id: 9, label: 'Review' },
]

type WizardData = {
  tenantId: string
  title: string
  type: ApplicationType
  studyDuration: string
  principalInvestigator: string
  coInvestigators: string
  department: string
  address: string
  population: string
  sampleSize: number
  studyStartDate: string
  studyEndDate: string
  methodology: string
  ethicsStatement: string
  consentDescription: string
  fundingSource: string
  budget: number
}

const defaultData: WizardData = {
  tenantId: '',
  title: '',
  type: ApplicationType.FULL_BOARD,
  studyDuration: '',
  principalInvestigator: '',
  coInvestigators: '',
  department: '',
  address: '',
  population: '',
  sampleSize: 0,
  studyStartDate: '',
  studyEndDate: '',
  methodology: '',
  ethicsStatement: '',
  consentDescription: '',
  fundingSource: '',
  budget: 0,
}

const stepSchemas = [
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  step6Schema,
  step7Schema,
  z.object({}), // step 8 (documents) — no form fields validated here
  z.object({}), // step 9 (review)
]

interface ApplicationWizardProps {
  editingId?: string
  initialData?: Partial<WizardData>
  initialDocuments?: ApplicationDocument[]
  submissionMode?: 'submit_application' | 'save_only'
  onSaveRedirectPath?: string
  editableStatus?: ApplicationStatus | null
}

function buildApplicationPayload(data: Partial<WizardData>) {
  const coInvestigators = data.coInvestigators
    ?.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

  return {
    title: data.title ?? '',
    type: data.type ?? ApplicationType.FULL_BOARD,
    ...(data.tenantId ? { tenantId: data.tenantId } : {}),
    ...(data.principalInvestigator ? { principalInvestigator: data.principalInvestigator } : {}),
    ...(coInvestigators?.length ? { coInvestigators } : {}),
    ...(data.studyDuration ? { studyDuration: data.studyDuration } : {}),
    ...(data.studyStartDate ? { studyStartDate: data.studyStartDate } : {}),
    ...(data.studyEndDate ? { studyEndDate: data.studyEndDate } : {}),
    ...(data.population ? { population: data.population } : {}),
    ...(typeof data.sampleSize === 'number' && data.sampleSize > 0
      ? { sampleSize: data.sampleSize }
      : {}),
    ...(data.methodology ? { methodology: data.methodology } : {}),
    ...(data.ethicsStatement ? { ethicsStatement: data.ethicsStatement } : {}),
    ...(data.consentDescription ? { consentDescription: data.consentDescription } : {}),
    ...(data.fundingSource ? { fundingSource: data.fundingSource } : {}),
    ...(typeof data.budget === 'number' && data.budget >= 0 ? { budget: data.budget } : {}),
    formData: data as Record<string, unknown>,
  }
}

export function ApplicationWizard({
  editingId,
  initialData,
  initialDocuments = [],
  submissionMode = 'submit_application',
  onSaveRedirectPath = '/applicant/applications',
  editableStatus,
}: ApplicationWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [savedId, setSavedId] = useState<string | null>(editingId ?? null)
  const [formData, setFormData] = useState<WizardData>({ ...defaultData, ...initialData })
  const [documents, setDocuments] = useState<ApplicationDocument[]>(initialDocuments)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: tenants } = useQuery({
    queryKey: ['tenants'],
    queryFn: () => tenantsApi.getTenants(),
  })

  const tenantOptions = tenants?.map((t) => ({ value: t.id, label: t.name })) ?? []

  const methods = useForm<WizardData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(stepSchemas[currentStep] as any),
    defaultValues: formData,
    mode: 'onTouched',
  })

  const saveDraft = useCallback(
    async (data: Partial<WizardData>) => {
      const merged = { ...formData, ...data }
      const payload = buildApplicationPayload(merged)
      try {
        if (savedId) {
          await applicationsApi.updateApplication(savedId, payload)
        } else {
          const created = await applicationsApi.createApplication(payload)
          setSavedId(created.id)
        }
        setFormData(merged)
        return true
      } catch (err: unknown) {
        toast.error((err as { message?: string })?.message ?? 'Failed to save draft.')
        return false
      }
    },
    [formData, savedId],
  )

  const handleNext = async (data: Partial<WizardData>) => {
    const merged = { ...formData, ...data }
    setFormData(merged)
    if (currentStep < 7) {
      // Save draft silently on every step advance
      setIsSaving(true)
      await saveDraft(merged)
      setIsSaving(false)
    }
    setCurrentStep((s) => s + 1)
    methods.reset({ ...merged })
  }

  const handleBack = () => {
    const current = methods.getValues()
    setFormData((prev) => ({ ...prev, ...current }))
    setCurrentStep((s) => s - 1)
    methods.reset({ ...formData, ...current })
  }

  const handleManualSave = async () => {
    const current = methods.getValues()
    setIsSaving(true)
    const ok = await saveDraft(current)
    setIsSaving(false)
    if (ok) toast.success('Draft saved successfully.')
  }

  const handleSubmit = async () => {
    if (!savedId) {
      toast.error('Please save the application first.')
      return
    }
    setIsSubmitting(true)
    try {
      if (submissionMode === 'save_only') {
        const ok = await saveDraft(methods.getValues())

        if (!ok) {
          return
        }

        toast.success(
          editableStatus === ApplicationStatus.QUERY_RAISED
            ? 'Application changes saved. Respond to the query to resubmit it for screening.'
            : 'Application changes saved successfully.',
        )
        router.push(onSaveRedirectPath)
        return
      }

      await applicationsApi.submitApplication(savedId)
      toast.success('Application submitted successfully!')
      router.push('/applicant/applications')
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message ?? 'Failed to submit application.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const typeOptions = [
    { value: ApplicationType.FULL_BOARD, label: 'Full Board Review' },
    { value: ApplicationType.EXPEDITED, label: 'Expedited Review' },
    { value: ApplicationType.EXEMPT, label: 'Exempt' },
  ]

  return (
    <div className="max-w-3xl mx-auto">
      {/* Step indicator */}
      <div className="mb-8 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                type="button"
                onClick={() => index < currentStep && setCurrentStep(index)}
                className={clsx(
                  'flex flex-col items-center gap-1',
                  index < currentStep ? 'cursor-pointer' : 'cursor-default',
                )}
              >
                <div
                  className={clsx(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                    index < currentStep
                      ? 'bg-rnec-teal text-white'
                      : index === currentStep
                        ? 'bg-rnec-navy text-white ring-2 ring-rnec-gold ring-offset-2'
                        : 'bg-slate-100 text-slate-400',
                  )}
                >
                  {index < currentStep ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span className={clsx('text-[10px] font-medium hidden sm:block', index === currentStep ? 'text-slate-900' : 'text-slate-400')}>
                  {step.label}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div className={clsx('mx-1 h-0.5 w-6 sm:w-8 transition-colors', index < currentStep ? 'bg-rnec-teal' : 'bg-slate-200')} />
              )}
            </div>
          ))}
        </div>
      </div>

      <FormProvider {...methods}>
        <Card shadow="md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Step {currentStep + 1}: {STEPS[currentStep].label}
                </h2>
                {savedId && (
                  <p className="text-xs text-slate-400 mt-0.5">Draft saved</p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                loading={isSaving}
                onClick={handleManualSave}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Save Draft
              </Button>
            </div>
          </CardHeader>

          <CardBody>
            {/* STEP 1: Basic Info */}
            {currentStep === 0 && (
              <form onSubmit={methods.handleSubmit(handleNext)} noValidate className="space-y-5" id="wizard-form">
                <Select
                  label="Reviewing Institution (IRB)"
                  required
                  options={tenantOptions}
                  placeholder="Select the institution that will review your application"
                  error={methods.formState.errors.tenantId?.message}
                  {...methods.register('tenantId')}
                />
                <Input
                  label="Study Title"
                  required
                  placeholder="Full title of your research study"
                  error={methods.formState.errors.title?.message}
                  {...methods.register('title')}
                />
                <Select
                  label="Application Type"
                  required
                  options={typeOptions}
                  error={methods.formState.errors.type?.message}
                  {...methods.register('type')}
                />
                <Input
                  label="Study Duration"
                  required
                  placeholder="e.g. 12 months, 2 years"
                  error={methods.formState.errors.studyDuration?.message}
                  {...methods.register('studyDuration')}
                />
              </form>
            )}

            {/* STEP 2: Principal Investigator */}
            {currentStep === 1 && (
              <form onSubmit={methods.handleSubmit(handleNext)} noValidate className="space-y-5" id="wizard-form">
                <Input
                  label="Principal Investigator"
                  required
                  placeholder="Full name of the PI"
                  error={methods.formState.errors.principalInvestigator?.message}
                  {...methods.register('principalInvestigator')}
                />
                <Textarea
                  label="Co-Investigators"
                  placeholder="List co-investigators separated by commas"
                  helperText="Optional — enter names separated by commas"
                  {...methods.register('coInvestigators')}
                />
              </form>
            )}

            {/* STEP 3: Institution */}
            {currentStep === 2 && (
              <form onSubmit={methods.handleSubmit(handleNext)} noValidate className="space-y-5" id="wizard-form">
                <Input
                  label="Department / Unit"
                  required
                  placeholder="e.g. Department of Medicine"
                  error={methods.formState.errors.department?.message}
                  {...methods.register('department')}
                />
                <Textarea
                  label="Institution Address"
                  required
                  placeholder="Full institution address"
                  error={methods.formState.errors.address?.message}
                  {...methods.register('address')}
                />
              </form>
            )}

            {/* STEP 4: Study Population */}
            {currentStep === 3 && (
              <form onSubmit={methods.handleSubmit(handleNext)} noValidate className="space-y-5" id="wizard-form">
                <Textarea
                  label="Study Population"
                  required
                  placeholder="Describe the study population, inclusion/exclusion criteria"
                  error={methods.formState.errors.population?.message}
                  {...methods.register('population')}
                />
                <Input
                  label="Sample Size"
                  type="number"
                  required
                  min={1}
                  placeholder="Expected number of participants"
                  error={methods.formState.errors.sampleSize?.message}
                  {...methods.register('sampleSize')}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Study Start Date"
                    type="date"
                    required
                    error={methods.formState.errors.studyStartDate?.message}
                    {...methods.register('studyStartDate')}
                  />
                  <Input
                    label="Study End Date"
                    type="date"
                    required
                    error={methods.formState.errors.studyEndDate?.message}
                    {...methods.register('studyEndDate')}
                  />
                </div>
              </form>
            )}

            {/* STEP 5: Methodology */}
            {currentStep === 4 && (
              <form onSubmit={methods.handleSubmit(handleNext)} noValidate className="space-y-5" id="wizard-form">
                <Textarea
                  label="Study Methodology"
                  required
                  placeholder="Describe the research design, methods, and procedures"
                  className="min-h-[200px]"
                  error={methods.formState.errors.methodology?.message}
                  {...methods.register('methodology')}
                />
              </form>
            )}

            {/* STEP 6: Ethics & Consent */}
            {currentStep === 5 && (
              <form onSubmit={methods.handleSubmit(handleNext)} noValidate className="space-y-5" id="wizard-form">
                <Textarea
                  label="Ethics Statement"
                  required
                  placeholder="Describe the ethical considerations for this study"
                  error={methods.formState.errors.ethicsStatement?.message}
                  {...methods.register('ethicsStatement')}
                />
                <Textarea
                  label="Consent Description"
                  required
                  placeholder="Describe the informed consent process"
                  error={methods.formState.errors.consentDescription?.message}
                  {...methods.register('consentDescription')}
                />
              </form>
            )}

            {/* STEP 7: Funding & Budget */}
            {currentStep === 6 && (
              <form onSubmit={methods.handleSubmit(handleNext)} noValidate className="space-y-5" id="wizard-form">
                <Input
                  label="Funding Source"
                  required
                  placeholder="e.g. WHO Grant, Self-funded, Institutional"
                  error={methods.formState.errors.fundingSource?.message}
                  {...methods.register('fundingSource')}
                />
                <Input
                  label="Total Budget (RWF)"
                  type="number"
                  required
                  min={0}
                  placeholder="0"
                  error={methods.formState.errors.budget?.message}
                  {...methods.register('budget')}
                />
              </form>
            )}

            {/* STEP 8: Documents */}
            {currentStep === 7 && (
              <div>
                <p className="text-sm text-slate-500 mb-4">
                  Upload required documents: Protocol, Consent Form, Questionnaire, Budget, CV, etc.
                </p>
                {savedId ? (
                  <DocumentUploader
                    applicationId={savedId}
                    existingDocuments={documents}
                    onUploaded={(doc) => setDocuments((prev) => [...prev, doc])}
                    onDeleted={(docId) => setDocuments((prev) => prev.filter((d) => d.id !== docId))}
                  />
                ) : (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                    Please save your draft first before uploading documents.
                  </div>
                )}
              </div>
            )}

            {/* STEP 9: Review & Submit */}
            {currentStep === 8 && (
              <div className="space-y-4">
                <p className="text-sm text-slate-500">
                  Review your application details before submitting. Once submitted, you cannot edit the application.
                </p>
                <div className="divide-y divide-slate-100">
                  <ReviewSection
                    label="Reviewing Institution"
                    value={tenants?.find((t) => t.id === formData.tenantId)?.name ?? formData.tenantId}
                  />
                  <ReviewSection label="Study Title" value={formData.title} />
                  <ReviewSection label="Type" value={formData.type.replace(/_/g, ' ')} />
                  <ReviewSection label="Duration" value={formData.studyDuration} />
                  <ReviewSection label="Principal Investigator" value={formData.principalInvestigator} />
                  <ReviewSection label="Department" value={formData.department} />
                  <ReviewSection label="Sample Size" value={String(formData.sampleSize)} />
                  <ReviewSection label="Funding Source" value={formData.fundingSource} />
                  <ReviewSection label="Budget" value={`RWF ${Number(formData.budget).toLocaleString()}`} />
                  <ReviewSection label="Documents" value={`${documents.length} document(s) uploaded`} />
                </div>
              </div>
            )}
          </CardBody>

          <CardFooter>
            <div className="flex items-center justify-between gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handleBack}
                disabled={currentStep === 0}
                leftIcon={<ChevronLeft className="h-4 w-4" />}
              >
                Back
              </Button>

              {currentStep < 8 ? (
                currentStep === 7 ? (
                  // Documents step — manual next
                  <Button
                    type="button"
                    variant="primary"
                    size="md"
                    onClick={() => setCurrentStep(8)}
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Review & Submit
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    form="wizard-form"
                    variant="primary"
                    size="md"
                    rightIcon={<ChevronRight className="h-4 w-4" />}
                  >
                    Next
                  </Button>
                )
              ) : (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  onClick={handleSubmit}
                  leftIcon={<Send className="h-4 w-4" />}
                >
                  {submissionMode === 'save_only' ? 'Save Changes' : 'Submit Application'}
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </FormProvider>
    </div>
  )
}

function ReviewSection({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 flex gap-4">
      <span className="w-40 shrink-0 text-sm font-medium text-slate-500">{label}</span>
      <span className="text-sm text-slate-900">{value || '—'}</span>
    </div>
  )
}
