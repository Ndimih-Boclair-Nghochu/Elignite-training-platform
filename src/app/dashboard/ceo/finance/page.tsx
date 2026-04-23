"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DATA = [
  { month: "Jan", income: 12500000, expenses: 8200000 },
  { month: "Feb", income: 18600000, expenses: 9100000 },
  { month: "Mar", income: 22400000, expenses: 11000000 },
  { month: "Apr", income: 16700000, expenses: 8800000 },
  { month: "May", income: 28900000, expenses: 13200000 },
  { month: "Jun", income: 31200000, expenses: 14500000 },
];

const PROGRAM_LABELS: Record<string, string> = {
  "bsc-computer-science": "BSc Computer Science",
  "bsc-business-administration": "BSc Business Admin",
  "bsc-nursing": "BSc Nursing",
  "bsc-education": "BSc Education",
  "hnd-accounting": "HND Accounting",
  "bsc-civil-engineering": "BSc Civil Engineering",
};

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
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(
    null
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  useEffect(() => {
    async function loadStudents() {
      setLoading(true);
      const res = await fetch("/api/students");
      if (res.ok) {
        setStudents(await res.json());
      }
      setLoading(false);
    }
    loadStudents();
  }, []);

  // ✅ KEEP ONLY ONE VERSION (FIXED)
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

  const submitPayment = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!selectedStudent) return;

    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      setPaymentError("Enter a valid amount");
      return;
    }

    const remaining = selectedStudent.feeDue;
    if (amount > remaining) {
      setPaymentError("Payment cannot exceed remaining balance");
      return;
    }

    setPaymentError("");
    setPaymentLoading(true);

    const res = await fetch(
      `/api/students/${selectedStudent.id}/pay-fees`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      setPaymentError(data.error || "Failed to record payment");
      setPaymentLoading(false);
      return;
    }

    setStudents((prev) =>
      prev.map((student) =>
        student.id === selectedStudent.id
          ? {
              ...student,
              paidAmount: student.paidAmount + amount,
              feeDue: student.feeDue - amount,
              allFeesPaid: amount >= remaining,
            }
          : student
      )
    );

    setPaymentLoading(false);
    closePaymentModal();
  };

  const filteredStudents = students.filter((student) =>
    `${student.firstName} ${student.lastName} ${student.email} ${student.studentId} ${
      PROGRAM_LABELS[student.program] ?? student.program
    }`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const stats = [
    {
      label: "Revenue (YTD)",
      value: "₣142.5M",
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      label: "Expenses (YTD)",
      value: "₣98.2M",
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      label: "Net Profit",
      value: "₣44.3M",
      icon: DollarSign,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Outstanding",
      value: "₣12.7M",
      icon: DollarSign,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Finance Overview</h1>
        <p className="text-sm text-gray-500">
          All enrolled students appear below for fee collection and finance
          review.
        </p>
      </div>

      {/* Dialog */}
      <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Record student payment</DialogTitle>
          </DialogHeader>

          {selectedStudent ? (
            <form onSubmit={submitPayment} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-500">Student</p>
                  <p className="font-medium">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Fee</p>
                  <p className="font-medium">
                    ₣{selectedStudent.totalFeeAmount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Remaining</p>
                  <p className="font-medium">
                    ₣{selectedStudent.feeDue.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Payment amount
                </label>
                <Input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) =>
                    setPaymentAmount(e.target.value)
                  }
                />
              </div>

              {paymentError && (
                <p className="text-red-600 text-sm">
                  {paymentError}
                </p>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closePaymentModal}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={paymentLoading}>
                  {paymentLoading ? "Saving..." : "Pay"}
                </Button>
              </div>
            </form>
          ) : (
            <p>Loading...</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Fee Due</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                      ₣{student.feeDue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => openPaymentModal(student)}
                      >
                        Pay
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
