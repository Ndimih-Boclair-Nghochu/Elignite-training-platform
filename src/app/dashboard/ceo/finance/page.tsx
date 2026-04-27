"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { DollarSign, TrendingUp, TrendingDown, Search, Loader2, Download } from "lucide-react";

interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  level: number;
  status: string;
  feeDue: number;
  paidAmount: number;
  totalFeeAmount: number;
  allFeesPaid: boolean;
}

export default function Page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      const res = await fetch("/api/students");
      if (res.ok) setStudents(await res.json());
      setLoading(false);
    }
    loadStudents();
  }, []);

  const openPaymentModal = (student: Student) => {
    setSelectedStudent(student);
    setPaymentAmount("");
    setPaymentError("");
    setPaymentOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentOpen(false);
    setSelectedStudent(null);
    setPaymentAmount("");
    setPaymentError("");
  };

  const submitPayment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedStudent) return;

    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) { setPaymentError("Enter a valid amount"); return; }

    const remaining = selectedStudent.feeDue;
    if (amount > remaining) { setPaymentError("Payment cannot exceed remaining balance"); return; }

    setPaymentError("");
    setPaymentLoading(true);

    const res = await fetch(`/api/students/${selectedStudent.id}/pay-fees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    if (!res.ok) {
      const data = await res.json();
      setPaymentError(data.error || "Failed to record payment");
      setPaymentLoading(false);
      return;
    }

    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? { ...s, paidAmount: s.paidAmount + amount, feeDue: s.feeDue - amount, allFeesPaid: amount >= remaining }
          : s
      )
    );
    setPaymentLoading(false);
    closePaymentModal();
  };

  const filteredStudents = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email} ${s.studentId} ${s.program}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Real computed stats from actual student fee data
  const totalCollected = students.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const totalOutstanding = students.reduce((sum, s) => sum + (s.feeDue || 0), 0);
  const totalAssigned = students.reduce((sum, s) => sum + (s.totalFeeAmount || 0), 0);
  const fullyPaid = students.filter((s) => s.allFeesPaid).length;

  const stats = [
    { label: "Fees Collected", value: `₣${totalCollected.toLocaleString()}`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
    { label: "Outstanding", value: `₣${totalOutstanding.toLocaleString()}`, icon: TrendingDown, color: "text-red-500", bg: "bg-red-50" },
    { label: "Total Assigned", value: `₣${totalAssigned.toLocaleString()}`, icon: DollarSign, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Fully Paid", value: `${fullyPaid} student${fullyPaid !== 1 ? "s" : ""}`, icon: DollarSign, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Finance Overview</h1>
          <p className="text-sm text-gray-500">All enrolled students — fee collection and finance review.</p>
        </div>
        <a href="/api/fees/export-pdf" download>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export Report</Button>
        </a>
      </div>

      {/* Real stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="mb-1 text-xs text-gray-500">{s.label}</p>
                  <p className="text-lg font-bold sm:text-xl">{s.value}</p>
                </div>
                <div className={`${s.bg} shrink-0 rounded-xl p-2.5`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record student payment</DialogTitle>
          </DialogHeader>
          {selectedStudent ? (
            <form onSubmit={submitPayment} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500">Student</p>
                  <p className="font-medium">{selectedStudent.firstName} {selectedStudent.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Fee</p>
                  <p className="font-medium">₣{selectedStudent.totalFeeAmount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Remaining</p>
                  <p className="font-medium">₣{selectedStudent.feeDue.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment amount</label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              {paymentError && <p className="text-sm text-red-600">{paymentError}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={closePaymentModal}>Cancel</Button>
                <Button type="submit" disabled={paymentLoading}>
                  {paymentLoading ? "Saving..." : "Record Payment"}
                </Button>
              </div>
            </form>
          ) : (
            <p>Loading...</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Search + Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Student Fee Records</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-gray-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Program</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{student.firstName} {student.lastName}</p>
                            <p className="text-xs text-gray-400">{student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="text-sm capitalize">{student.program.replace(/-/g, " ")}</span>
                        </TableCell>
                        <TableCell className="text-green-700 font-medium text-sm">
                          ₣{(student.paidAmount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="font-medium text-sm" style={{ color: student.feeDue > 0 ? "#dc2626" : "#16a34a" }}>
                          ₣{student.feeDue.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => openPaymentModal(student)}
                            disabled={student.feeDue <= 0}
                            variant={student.feeDue <= 0 ? "outline" : "default"}
                          >
                            {student.feeDue <= 0 ? "Paid" : "Pay"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-gray-400">
                        {students.length === 0 ? "No students enrolled yet" : "No students match your search"}
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
