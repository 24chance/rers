'use client'

import { useQuery } from '@tanstack/react-query'
import { Award, Download } from 'lucide-react'
import { Card, CardHeader, CardBody } from '@/components/ui/card'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/ui/loader'
import { EmptyState } from '@/components/ui/empty-state'
import { applicationsApi } from '@/lib/api/applications.api'
import { certificatesApi } from '@/lib/api/certificates.api'
import { ApplicationStatus } from '@/types'
import { format } from 'date-fns'
import { toast } from '@/components/ui/toast'

export default function ApplicantCertificatesPage() {
  const { data: applications, isLoading } = useQuery({
    queryKey: ['applicant-approved-applications'],
    queryFn: () =>
      applicationsApi.getApplications({ status: ApplicationStatus.APPROVED, limit: 50 }),
  })

  const downloadCert = async (appId: string, title: string) => {
    try {
      const blob = await certificatesApi.downloadCertificate(appId)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${title.slice(0, 30)}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast.error('Failed to download certificate.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Certificates</h1>
        <p className="text-slate-500 text-sm mt-0.5">Download your research ethics approval certificates</p>
      </div>

      <Card shadow="sm">
        <CardHeader>
          <h2 className="text-base font-semibold text-slate-900">Approved Applications</h2>
        </CardHeader>
        <CardBody className="p-0">
          {isLoading ? (
            <Loader centered label="Loading..." />
          ) : !applications?.data.length ? (
            <EmptyState
              icon={<Award className="h-8 w-8 text-slate-400" />}
              title="No certificates yet"
              description="Certificates will appear here once your applications are approved."
            />
          ) : (
            <Table>
              <TableHead>
                <tr>
                  <TableHeader>Reference</TableHeader>
                  <TableHeader>Study Title</TableHeader>
                  <TableHeader>Approved</TableHeader>
                  <TableHeader>Actions</TableHeader>
                </tr>
              </TableHead>
              <TableBody>
                {applications.data.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <span className="font-mono text-xs font-semibold">{app.referenceNumber}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-slate-900">{app.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-500">
                        {app.updatedAt ? format(new Date(app.updatedAt), 'dd MMM yyyy') : '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Download className="h-3.5 w-3.5" />}
                        onClick={() => downloadCert(app.id, app.title)}
                      >
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
