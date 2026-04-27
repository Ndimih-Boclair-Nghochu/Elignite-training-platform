"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DollarSign, TrendingUp, TrendingDown, Search, Loader2,
  Download, Plus, CheckCircle2, Clock, AlertCircle, Trash2,
} from "lucide-react";

interface Student {
  id: number;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  status: string;
  feeDue: number;
  paidAmount: number;
  totalFeeAmount: number;
  allFeesPaid: boolean;
}

interface FeeRecord {
  id: number;
  studentId: number;
  description: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: string;
  receiptNo: string | null;
}

const statusBadge = (status: string) => {
  if (status === "paid") return <Badge className="bg-green-100 text-green-700 border-0">Paid</Badge>;
  if (status === "overdue") return <Badge className="bg-red-100 text-red-700 border-0">Overdue</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-700 border-0">Pending</Badge>;
};

export default function Page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fee management dialog
  const [feeDialogOpen, setFeeDialogOpen] = useState(false);
  const [feeStudent, setFeeStudent] = useState<Student | null>(null);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [feesLoading, setFeesLoading] = useState(false);

  // Add fee form
  const [addFeeOpen, setAddFeeOpen] = useState(false);
  const [newFee, setNewFee] = useState({ description: "", amount: "", dueDate: "" });
  const [addFeeLoading, setAddFeeLoading] = useState(false);

  // Record payment
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    fetch("/api/students")
      .then((r) => r.ok ? r.json() : [])
      .then(setStudents)
      .finally(() => setLoading(false));
  }, []);

  const openFeeDialog = async (student: Student) => {
    setFeeStudent(student);
    setFeeDialogOpen(true);
    setAddFeeOpen(false);
    setPaymentAmount("");
    setPaymentError("");
    setFeesLoading(true);
    const res = await fetch(`/api/fees?studentId=${student.id}`);
    setFees(res.ok ? await res.json() : []);
    setFeesLoading(false);
  };

  const toggleFeeStatus = async (fee: FeeRecord) => {
    const newStatus = fee.status === "paid" ? "pending" : "paid";
    const res = await fetch(`/api/fees/${fee.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFees((prev) => prev.map((f) => (f.id === fee.id ? updated : f)));
      refreshStudent();
    }
  };

  const setFeeStatus = async (feeId: number, status: string) => {
    const res = await fetch(`/api/fees/${feeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setFees((prev) => prev.map((f) => (f.id === feeId ? updated : f)));
      refreshStudent();
    }
  };

  const deleteFee = async (feeId: number) => {
    if (!confirm("Delete this fee record?")) return;
    const res = await fetch(`/api/fees/${feeId}`, { method: "DELETE" });
    if (res.ok) {
      setFees((prev) => prev.filter((f) => f.id !== feeId));
      refreshStudent();
    }
  };

  const addFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeStudent) return;
    setAddFeeLoading(true);
    const res = await fetch("/api/fees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: feeStudent.id,
        description: newFee.description,
        amount: Number(newFee.amount),
        dueDate: newFee.dueDate,
        status: "pending",
      }),
    });
    if (res.ok) {
      const created = await res.json();
      setFees((prev) => [...prev, created]);
      setNewFee({ description: "", amount: "", dueDate: "" });
      setAddFeeOpen(false);
      refreshStudent();
    }
    setAddFeeLoading(false);
  };

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feeStudent) return;
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) { setPaymentError("Enter a valid amount"); return; }
    const remaining = feeStudent.feeDue;
    if (amount > remaining) { setPaymentError("Cannot exceed remaining balance"); return; }
    setPaymentError("");
    setPaymentLoading(true);
    const res = await fetch(`/api/students/${feeStudent.id}/pay-fees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
      const d = await res.json();
      setPaymentError(d.error || "Failed");
    } else {
      setPaymentAmount("");
      // Reload fees to reflect any status changes
      const feesRes = await fetch(`/api/fees?studentId=${feeStudent.id}`);
      setFees(feesRes.ok ? await feesRes.json() : []);
      refreshStudent();
    }
    setPaymentLoading(false);
  };

  const refreshStudent = async () => {
    const res = await fetch("/api/students");
    if (res.ok) {
      const all: Student[] = await res.json();
      setStudents(all);
      if (feeStudent) {
        const updated = all.find((s) => s.id === feeStudent.id);
        if (updated) setFeeStudent(updated);
      }
    }
  };

  const filtered = students.filter((s) =>
    `${s.firstName} ${s.lastName} ${s.email} ${s.studentId} ${s.program}`
      .toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = students.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const totalOutstanding = students.reduce((sum, s) => sum + (s.feeDue || 0), 0);
  const totalAssigned = students.reduce((sum, s) => sum + (s.totalFeeAmount || 0), 0);
  const fullyPaid = students.filter((s) => s.allFeesPaid).length;

  const stats = [
    { label: "Fees Collected", value: `₣${totalCollected.toLocaleString()}`, icon: TrendingUp, color: "text-green-500", bg: "bg-green-50" },
    { label: "Outstanding", value: `₣${totalOutstanding.toLocaleString()}`, icon: TrendingDown, color: "text-red-500", bg: "bg-red-50" },
    { label: "Total Assigned", value: `₣${totalAssigned.toLocaleString()}`, icon: DollarSign, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Fully Paid", value: `${fullyPaid} student${fullyPaid !== 1 ? "s" : ""}`, icon: CheckCircle2, color: "text-purple-500", bg: "bg-purple-50" },
  ];

  // Computed fee totals inside dialog
  const feeTotal = fees.reduce((s, f) => s + f.amount, 0);
  const feePaid = fees.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Finance Overview</h1>
          <p className="text-sm text-gray-500">Manage student fees, payments, and installments.</p>
        </div>
        <a href="/api/fees/export-pdf" download>
          <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Export Report</Button>
        </a>
      </div>

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

      {/* Fee management dialog */}
      <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {feeStudent ? `${feeStudent.firstName} ${feeStudent.lastName} — Fee Management` : "Fee Management"}
            </DialogTitle>
          </DialogHeader>

          {feeStudent && (
            <div className="space-y-5">
              {/* Summary bar */}
              <div className="grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500">Total Billed</p>
                  <p className="font-semibold">₣{feeTotal.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Paid</p>
                  <p className="font-semibold text-green-600">₣{feePaid.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Outstanding</p>
                  <p className={`font-semibold ${feeStudent.feeDue > 0 ? "text-red-600" : "text-green-600"}`}>
                    ₣{feeStudent.feeDue.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Fee records */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">Fee Records</p>
                  <Button size="sm" variant="outline" onClick={() => setAddFeeOpen((v) => !v)}>
                    <Plus className="h-3.5 w-3.5 mr-1" />Add Fee
                  </Button>
                </div>

                {addFeeOpen && (
                  <form onSubmit={addFee} className="mb-3 rounded-xl border border-dashed border-blue-300 bg-blue-50 p-4 space-y-3">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">New Fee / Installment</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="text-xs text-gray-600">Description</label>
                        <Input
                          required
                          value={newFee.description}
                          onChange={(e) => setNewFee((p) => ({ ...p, description: e.target.value }))}
                          placeholder="e.g. Tuition — Installment 1"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Amount (₣)</label>
                        <Input
                          required type="number" min="1"
                          value={newFee.amount}
                          onChange={(e) => setNewFee((p) => ({ ...p, amount: e.target.value }))}
                          placeholder="50000"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Due Date</label>
                        <Input
                          required type="date"
                          value={newFee.dueDate}
                          onChange={(e) => setNewFee((p) => ({ ...p, dueDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={addFeeLoading}>
                        {addFeeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                      </Button>
                      <Button type="button" size="sm" variant="ghost" onClick={() => setAddFeeOpen(false)}>Cancel</Button>
                    </div>
                  </form>
                )}

                {feesLoading ? (
                  <div className="flex justify-center py-6"><Loader2 className="animate-spin text-gray-300 h-6 w-6" /></div>
                ) : fees.length === 0 ? (
                  <div className="rounded-xl border border-dashed py-8 text-center">
                    <p className="text-sm text-gray-400">No fee records yet. Click "Add Fee" to create one.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fees.map((fee) => (
                      <div key={fee.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{fee.description}</p>
                          <p className="text-xs text-gray-400">
                            Due: {new Date(fee.dueDate).toLocaleDateString()}
                            {fee.paidDate && ` · Paid: ${new Date(fee.paidDate).toLocaleDateString()}`}
                          </p>
                        </div>
                        <p className="text-sm font-semibold shrink-0">₣{fee.amount.toLocaleString()}</p>
                        {statusBadge(fee.status)}
                        <div className="flex items-center gap-1 shrink-0">
                          <Select
                            value={fee.status}
                            onValueChange={(val) => setFeeStatus(fee.id, val)}
                          >
                            <SelectTrigger className="h-7 w-28 text-xs border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            size="icon" variant="ghost"
                            className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => deleteFee(fee.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Record payment (installment) */}
              {feeStudent.feeDue > 0 && (
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold mb-3">Record Installment Payment</p>
                  <p className="text-xs text-gray-500 mb-3">
                    This records a cash payment and automatically marks fee records as paid once the balance is cleared.
                    Remaining balance: <span className="font-semibold text-red-600">₣{feeStudent.feeDue.toLocaleString()}</span>
                  </p>
                  <form onSubmit={submitPayment} className="flex gap-2">
                    <Input
                      type="number" min="1" max={feeStudent.feeDue}
                      value={paymentAmount}
                      onChange={(e) => { setPaymentAmount(e.target.value); setPaymentError(""); }}
                      placeholder="Amount paid"
                      className="max-w-[180px]"
                    />
                    <Button type="submit" size="sm" disabled={paymentLoading}>
                      {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Record Payment"}
                    </Button>
                  </form>
                  {paymentError && <p className="mt-2 text-xs text-red-600">{paymentError}</p>}
                </div>
              )}

              {feeStudent.feeDue <= 0 && fees.length > 0 && (
                <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  <p className="text-sm font-medium text-green-700">All fees cleared. No outstanding balance.</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Student table */}
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
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-400" /></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden sm:table-cell">Program</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length > 0 ? (
                    filtered.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{student.firstName} {student.lastName}</p>
                            <p className="text-xs text-gray-400">{student.studentId}</p>
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
                          {student.totalFeeAmount === 0 ? (
                            <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="h-3.5 w-3.5" />No fees</span>
                          ) : student.allFeesPaid ? (
                            <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle2 className="h-3.5 w-3.5" />Paid</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-red-500"><AlertCircle className="h-3.5 w-3.5" />Outstanding</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => openFeeDialog(student)}>
                            Manage
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-sm text-gray-400">
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
