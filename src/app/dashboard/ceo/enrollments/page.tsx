"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Clock, Loader2, Download, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Enrollment {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  program: string;
  status: string;
  matricle?: string;
  createdAt: string;
}

export default function CeoEnrollmentsPage() {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<{ [key: number]: string }>({});

  async function fetchEnrollments() {
    const res = await fetch("/api/enrollments");
    if (res.ok) setEnrollments(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    fetchEnrollments();
  }, []);

  async function updateStatus(
    id: number,
    status: "approved" | "rejected"
  ) {
    setUpdating(id);
    const res = await fetch(`/api/enrollments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        rejectedReason: rejectionReason[id],
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      setEnrollments((prev) =>
        prev.map((e) => (e.id === id ? updated : e))
      );
      toast({
        title: `Application ${status}${
          status === "approved" ? ` - Matricle: ${updated.matricle}` : ""
        }`,
      });
      setRejectionReason((prev) => ({ ...prev, [id]: "" }));
    } else {
      toast({ title: "Update failed", variant: "destructive" });
    }
    setUpdating(null);
  }

  function downloadForm(id: number) {
    window.location.href = `/api/enrollments/${id}/download`;
  }

  const pending = enrollments.filter((e) => e.status === "pending").length;
  const approved = enrollments.filter((e) => e.status === "approved").length;
  const rejected = enrollments.filter((e) => e.status === "rejected").length;
  const pendingEnrollments = enrollments.filter((e) => e.status === "pending");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Enrollment Applications</h1>
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-orange-200">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-orange-500">{pending}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-green-200">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-green-500">{approved}</p>
            <p className="text-sm text-gray-500">Approved</p>
          </CardContent>
        </Card>
        <Card className="border-red-200">
          <CardContent className="pt-5 text-center">
            <p className="text-3xl font-bold text-red-500">{rejected}</p>
            <p className="text-sm text-gray-500">Rejected</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Applicant</TableHead>
                    <TableHead className="min-w-[120px]">Program</TableHead>
                    <TableHead className="min-w-[120px]">Phone</TableHead>
                    <TableHead className="min-w-[100px]">Applied</TableHead>
                    <TableHead className="min-w-[100px]">Matricle</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="min-w-[200px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingEnrollments.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">
                            {e.firstName} {e.lastName}
                          </p>
                          <p className="text-xs text-gray-400">{e.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{e.program}</TableCell>
                      <TableCell className="text-sm">{e.phone}</TableCell>
                      <TableCell className="text-xs text-gray-400">
                        {new Date(e.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-blue-50 px-2 py-1 rounded border border-blue-200">
                          {e.matricle || "-"}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            e.status === "approved"
                              ? "default"
                              : e.status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                          className="text-xs capitalize"
                        >
                          {e.status === "pending" && (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => downloadForm(e.id)}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          {e.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                disabled={updating === e.id}
                                onClick={() =>
                                  updateStatus(e.id, "approved")
                                }
                              >
                                {updating === e.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="h-3 w-3 mr-1" />
                                    Approve
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 text-xs"
                                disabled={updating === e.id}
                                onClick={() =>
                                  updateStatus(e.id, "rejected")
                                }
                              >
                                <X className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingEnrollments.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center text-gray-400 py-8"
                      >
                        No pending applications
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
