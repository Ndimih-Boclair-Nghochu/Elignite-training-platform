"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Award, Plus, Loader2, Check, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CertificateViewModal } from "./certificate-view-modal";

interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  program: string;
  level: number;
}

interface Certificate {
  id: number;
  certNo: string;
  title: string;
  status: string;
  issuedDate: string | null;
  studentId: number;
}

export default function CeoCertificatesPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<Student[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [programFilter, setProgramFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [certificateTitle, setCertificateTitle] = useState("");
  const [certificateStatus, setCertificateStatus] = useState("issued");
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingCertificate, setViewingCertificate] = useState<Certificate | null>(null);

  const programOptions = useMemo(
    () => Array.from(new Set(students.map((s) => s.program))).sort(),
    [students]
  );

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesProgram = !programFilter || programFilter === "all" ? true : student.program === programFilter;
      const matchesSearch = `${student.firstName} ${student.lastName} ${student.studentId} ${student.program}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesProgram && matchesSearch;
    });
  }, [students, programFilter, searchQuery]);

  const certificateMap = useMemo(() => {
    return certificates.reduce((map, cert) => {
      const existing = map.get(cert.studentId) ?? [];
      existing.push(cert);
      map.set(cert.studentId, existing);
      return map;
    }, new Map<number, Certificate[]>());
  }, [certificates]);

  const allFilteredSelected =
    filteredStudents.length > 0 && filteredStudents.every((student) => selectedIds.includes(student.id));

  async function fetchData() {
    try {
      setLoading(true);
      const [studentsRes, certsRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/admin/certificates"),
      ]);

      if (studentsRes.ok) {
        setStudents(await studentsRes.json());
      }

      if (certsRes.ok) {
        setCertificates(await certsRes.json());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const issueCertificates = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!certificateTitle || selectedIds.length === 0) {
      toast({ title: "Please select students and enter a certificate title", variant: "destructive" });
      return;
    }

    setSubmitting(true);

    try {
      const results = await Promise.allSettled(
        selectedIds.map((studentId) =>
          fetch("/api/admin/certificates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              studentId,
              title: certificateTitle,
              status: certificateStatus,
            }),
          })
        )
      );

      const failed = results.filter(
        (result) =>
          result.status === "rejected" ||
          (result.status === "fulfilled" && !result.value.ok)
      );

      if (failed.length > 0) {
        toast({ title: `Issued ${selectedIds.length - failed.length}/${selectedIds.length} certificates` });
      } else {
        toast({ title: "Certificates issued successfully" });
      }

      setOpenDialog(false);
      setSelectedIds([]);
      setCertificateTitle("");
      setCertificateStatus("issued");
      fetchData();
    } catch (error) {
      console.error(error);
      toast({ title: "Failed to issue certificates", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => prev.filter((id) => !filteredStudents.some((student) => student.id === id)));
    } else {
      setSelectedIds((prev) => [
        ...new Set([...
          prev,
          ...filteredStudents.map((student) => student.id),
        ]),
      ]);
    }
  };

  const toggleStudentSelection = (studentId: number) => {
    setSelectedIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const issuedCount = certificates.filter((c) => c.status === "issued").length;
  const pendingCount = certificates.filter((c) => c.status === "pending").length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Certificates</h1>
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Certificates</h1>
          <p className="text-gray-500 text-sm">{certificates.length} certificates total</p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Issue Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Issue Certificates</DialogTitle>
            </DialogHeader>
            <form onSubmit={issueCertificates} className="space-y-4">
              <div className="space-y-2">
                <Label>Selected students</Label>
                <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700">
                  {selectedIds.length > 0 ? `${selectedIds.length} selected` : "No students selected"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Certificate Title *</Label>
                <Input
                  value={certificateTitle}
                  onChange={(e) => setCertificateTitle(e.target.value)}
                  placeholder="e.g., Certificate of Completion"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={certificateStatus} onValueChange={(v) => setCertificateStatus(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="issued">Issued</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setOpenDialog(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || selectedIds.length === 0}>
                  {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Issuing...</> : "Issue Certificates"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-green-500">{issuedCount}</p>
            <p className="text-sm text-gray-500">Issued</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-orange-500">{pendingCount}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-blue-500">{certificates.length}</p>
            <p className="text-sm text-gray-500">Total</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
            <div>
              <CardTitle className="text-lg">Student List</CardTitle>
              <p className="text-sm text-gray-500">Filter by program and select students to issue certificates.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <Input
                  className="border-0 p-0 outline-none focus:ring-0"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
              <div className="min-w-[220px]">
                <Label className="text-sm">Filter by Program</Label>
                <Select value={programFilter} onValueChange={(v) => setProgramFilter(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Programs" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Programs</SelectItem>
                    {programOptions.map((program) => (
                      <SelectItem key={program} value={program}>
                        {program}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={allFilteredSelected}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificates</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const studentCertificates = certificateMap.get(student.id) ?? [];
                    return (
                      <tr key={student.id}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(student.id)}
                            onChange={() => toggleStudentSelection(student.id)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                          <div className="text-xs text-gray-500">{student.studentId}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{student.program}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">Level {student.level}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 space-y-1">
                          {studentCertificates.length > 0 ? (
                            studentCertificates.map((cert) => (
                              <div key={cert.id} className="flex items-center gap-2">
                                <Badge variant={cert.status === "issued" ? "default" : "secondary"} className="text-xs">
                                  {cert.status}
                                </Badge>
                                <span>{cert.title}</span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">No certificates</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">All Certificates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {certificates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Award className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No certificates issued yet</p>
            </div>
          ) : (
            certificates.map((c) => {
              const student = students.find((s) => s.id === c.studentId);
              return (
                <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <Award className="h-6 w-6 text-yellow-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{c.title}</p>
                      <p className="text-xs text-gray-400">
                        {student?.firstName} {student?.lastName} · {c.certNo}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={c.status === "issued" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {c.status === "issued" ? "Issued" : "Pending"}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={() => {
                        setViewingCertificate(c);
                        setViewModalOpen(true);
                      }}
                    >
                      View
                    </Button>
                    <a
                      href={`/api/certificates/${c.id}/download`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Download
                    </a>
                    {c.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={async () => {
                          try {
                            const res = await fetch(`/api/admin/certificates/${c.id}`, {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ status: "issued" }),
                            });
                            if (res.ok) {
                              toast({ title: "Certificate issued successfully" });
                              fetchData();
                            }
                          } catch (error) {
                            toast({ title: "Failed to issue certificate", variant: "destructive" });
                          }
                        }}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {viewingCertificate && (
        <CertificateViewModal
          isOpen={viewModalOpen}
          onOpenChange={setViewModalOpen}
          certificateId={viewingCertificate.id}
          certificateTitle={viewingCertificate.title}
          certNo={viewingCertificate.certNo}
        />
      )}
    </div>
  );
}