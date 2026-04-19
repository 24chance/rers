'use client'

import { ApplicationWizard } from '@/components/forms/application-wizard'

export default function NewApplicationPage() {
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
