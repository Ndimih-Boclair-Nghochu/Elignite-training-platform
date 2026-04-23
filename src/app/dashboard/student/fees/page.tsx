"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface Fee { id: number; description: string; amount: number; dueDate: string; paidDate: string | null; status: string; receiptNo: string | null; }

export default function StudentFeesPage() {
  const [fees, setFees] = useState<Fee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/fees").then((r) => r.json()).then(setFees).finally(() => setLoading(false));
  }, []);

  const paid = fees.filter((f) => f.status === "paid").reduce((s, f) => s + f.amount, 0);
  const due = fees.filter((f) => f.status !== "paid").reduce((s, f) => s + f.amount, 0);
  const hasOverdue = fees.some((f) => f.status === "overdue");

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Fee Statement</h1>

      {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-green-200 bg-green-50"><CardContent className="pt-5 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-700">₣{paid.toLocaleString()}</p>
              <p className="text-sm text-green-600">Total Paid</p>
            </CardContent></Card>
            <Card className="border-orange-200 bg-orange-50"><CardContent className="pt-5 text-center">
              <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-orange-700">₣{due.toLocaleString()}</p>
              <p className="text-sm text-orange-600">Outstanding</p>
            </CardContent></Card>
            <Card><CardContent className="pt-5 text-center">
              <CreditCard className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-700">₣{(paid + due).toLocaleString()}</p>
              <p className="text-sm text-gray-500">Total Fees</p>
            </CardContent></Card>
          </div>

          {hasOverdue && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">You have overdue payments. Please contact the accounts office immediately.</p>
            </div>
          )}

          <Card>
            <CardHeader><CardTitle>Fee Records</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>Receipt No.</TableHead><TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead><TableHead>Due Date</TableHead>
                  <TableHead>Paid Date</TableHead><TableHead>Status</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {fees.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-mono text-xs">{f.receiptNo || "–"}</TableCell>
                      <TableCell className="text-sm">{f.description}</TableCell>
                      <TableCell className="font-semibold">₣{f.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-gray-500">{new Date(f.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell className="text-sm text-gray-500">{f.paidDate ? new Date(f.paidDate).toLocaleDateString() : "–"}</TableCell>
                      <TableCell><Badge variant={f.status === "paid" ? "default" : f.status === "overdue" ? "destructive" : "secondary"} className="text-xs capitalize">{f.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                  {fees.length === 0 && <TableRow><TableCell colSpan={6} className="text-center text-gray-400 py-8">No fee records found</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
