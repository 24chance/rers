'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { ApplicationWizard } from '@/components/forms/application-wizard'
import { Loader } from '@/components/ui/loader'
import { Button } from '@/components/ui/button'
import { applicationsApi } from '@/lib/api/applications.api'
import { ApplicationStatus, ApplicationType } from '@/types'

function NewApplicationPageContent() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')

  const { data: application, isLoading: applicationLoading } = useQuery({
    queryKey: ['application-edit', editId],
    queryFn: () => applicationsApi.getApplication(editId!),
    enabled: !!editId,
  })

  const { data: documents = [], isLoading: documentsLoading } = useQuery({
    queryKey: ['application-edit-documents', editId],
    queryFn: () => applicationsApi.getApplicationDocuments(editId!),
    enabled: !!editId,
  })

  if (editId && (applicationLoading || documentsLoading)) {
    return <Loader centered label="Loading application editor..." />
  }

  if (editId && !application) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-sm text-slate-500">Application not found.</p>
        <Link href="/applicant/applications">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to Applications
          </Button>
        </Link>
      </div>
    )
  }

  if (editId && application) {
    const editable =
      application.status === ApplicationStatus.DRAFT
      || application.status === ApplicationStatus.QUERY_RAISED

    if (!editable) {
      return (
        <div className="space-y-6">
          <Link
            href={`/applicant/applications/${application.id}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Application
          </Link>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-6 py-5">
            <h1 className="text-lg font-semibold text-amber-900">Editing is not available</h1>
            <p className="mt-2 text-sm text-amber-800">
              Only draft applications and applications with raised queries can be edited.
            </p>
          </div>
        </div>
      )
    }

    const initialData = {
      tenantId: application.tenantId ?? (application.formData?.tenantId as string | undefined),
      title: application.title,
      type: application.type ?? (application.formData?.type as ApplicationType | undefined),
      studyDuration: getFieldValue(application, 'studyDuration'),
      principalInvestigator: getFieldValue(application, 'principalInvestigator'),
      coInvestigators: getCoInvestigators(application),
      department: getFieldValue(application, 'department'),
      address: getFieldValue(application, 'address'),
      population: getFieldValue(application, 'population'),
      sampleSize: getNumberFieldValue(application, 'sampleSize'),
      studyStartDate: getDateInputValue(getFieldValue(application, 'studyStartDate')),
      studyEndDate: getDateInputValue(getFieldValue(application, 'studyEndDate')),
      methodology: getFieldValue(application, 'methodology'),
      ethicsStatement: getFieldValue(application, 'ethicsStatement'),
      consentDescription: getFieldValue(application, 'consentDescription'),
      fundingSource: getFieldValue(application, 'fundingSource'),
      budget: getNumberFieldValue(application, 'budget'),
    }

    return (
      <div className="space-y-6">
        <div>
          <Link
            href={`/applicant/applications/${application.id}`}
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Application
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">
            {application.status === ApplicationStatus.QUERY_RAISED
              ? 'Update Application for Query Response'
              : 'Edit Draft Application'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {application.status === ApplicationStatus.QUERY_RAISED
              ? 'Save your changes, then return to the application page to answer the raised query and resubmit it for screening.'
              : 'Make your changes and continue through the review step when you are ready to submit.'}
          </p>
        </div>
        <ApplicationWizard
          editingId={application.id}
          initialData={initialData}
          initialDocuments={documents}
          submissionMode={
            application.status === ApplicationStatus.QUERY_RAISED
              ? 'save_only'
              : 'submit_application'
          }
          onSaveRedirectPath={`/applicant/applications/${application.id}`}
          editableStatus={application.status}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">New Application</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Complete all steps to submit your research ethics application.
        </p>
      </div>
      <ApplicationWizard />
    </div>
  )
}

export default function NewApplicationPage() {
  return (
    <Suspense fallback={<Loader centered label="Loading application form..." />}>
      <NewApplicationPageContent />
    </Suspense>
  )
}

function getFieldValue(
  application: Awaited<ReturnType<typeof applicationsApi.getApplication>>,
  key: string,
): string {
  const topLevelValue = application[key as keyof typeof application]

  if (typeof topLevelValue === 'string') {
    return topLevelValue
  }

  const formValue = application.formData?.[key]
  return typeof formValue === 'string' ? formValue : ''
}

function getNumberFieldValue(
  application: Awaited<ReturnType<typeof applicationsApi.getApplication>>,
  key: string,
): number {
  const topLevelValue = application[key as keyof typeof application]
  const rawValue =
    typeof topLevelValue === 'number' || typeof topLevelValue === 'string'
      ? topLevelValue
      : application.formData?.[key]

  const numeric = Number(rawValue)
  return Number.isFinite(numeric) ? numeric : 0
}

function getCoInvestigators(
  application: Awaited<ReturnType<typeof applicationsApi.getApplication>>,
): string {
  if (Array.isArray(application.coInvestigators) && application.coInvestigators.length > 0) {
    return application.coInvestigators.join(', ')
  }

  const formValue = application.formData?.coInvestigators

  if (Array.isArray(formValue)) {
    return formValue.join(', ')
  }

  return typeof formValue === 'string' ? formValue : ''
}

function getDateInputValue(value: string): string {
  if (!value) {
    return ''
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toISOString().slice(0, 10)
}
