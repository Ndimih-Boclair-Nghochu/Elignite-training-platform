"use client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Filter,
} from "lucide-react";

interface Testimony {
  id: number;
  name: string;
  program: string;
  year: string;
  text: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  submitterType: "student" | "teacher";
  rejectionNote?: string;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    photoUrl: string | null;
  };
}

export default function CeoTestimoniesPage() {
  const { toast } = useToast();
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "student" | "teacher">(
    "all"
  );
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionNote, setRejectionNote] = useState("");

  const fetchTestimonies = async (status?: string) => {
    try {
      setLoading(true);
      const url = status
        ? `/api/testimonies?status=${status}`
        : "/api/testimonies";
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch testimonies");
      const data = await response.json();
      setTestimonies(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load testimonies",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonies();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch(`/api/testimonies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (!response.ok) throw new Error("Failed to approve testimony");

      const updated = await response.json();
      setTestimonies((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );

      toast({
        title: "Success",
        description: "Testimony approved and will be published",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to approve testimony",
      });
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectionNote.trim()) {
      toast({
        title: "Error",
        description: "Please provide a rejection reason",
      });
      return;
    }

    try {
      const response = await fetch(`/api/testimonies/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          rejectionNote: rejectionNote.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to reject testimony");

      const updated = await response.json();
      setTestimonies((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );

      setRejectingId(null);
      setRejectionNote("");

      toast({
        title: "Success",
        description: "Testimony rejected",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reject testimony",
      });
    }
  };

  const getFilteredTestimonies = (status: string) => {
    return testimonies.filter((t) => {
      const statusMatch = t.status === status;
      const typeMatch =
        filterType === "all" || t.submitterType === filterType;
      return statusMatch && typeMatch;
    });
  };

  const pendingCount = testimonies.filter(
    (t) => t.status === "pending"
  ).length;
  const approvedCount = testimonies.filter(
    (t) => t.status === "approved"
  ).length;
  const rejectedCount = testimonies.filter(
    (t) => t.status === "rejected"
  ).length;

  const renderTestimonyCard = (testimony: Testimony) => (
    <Card key={testimony.id} className="hover:shadow-lg transition">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {testimony.user?.photoUrl ? (
              <img
                src={testimony.user.photoUrl}
                alt={testimony.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                {testimony.name[0]}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{testimony.name}</p>
              <p className="text-xs text-gray-500">
                {testimony.user?.email}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="text-xs">
              {testimony.submitterType === "student" ? "👨‍🎓" : "👨‍🏫"}{" "}
              {testimony.submitterType}
            </Badge>
            <Badge
              className={`text-xs ${
                testimony.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : testimony.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {testimony.status === "approved" ? "✓" : testimony.status === "rejected" ? "✗" : "⏳"} {testimony.status}
            </Badge>
          </div>
        </div>

        <div className="mb-3 flex gap-4 text-sm text-gray-600">
          {testimony.program && <span>📚 {testimony.program}</span>}
          {testimony.year && <span>📅 {testimony.year}</span>}
          <span>⭐ {testimony.rating}/5</span>
          <span className="text-gray-400">
            {new Date(testimony.createdAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex mb-3">
          {Array.from({ length: testimony.rating }).map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>

        <p className="text-gray-700 mb-4">{testimony.text}</p>

        {testimony.status === "rejected" && testimony.rejectionNote && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
            <strong>Rejection reason:</strong> {testimony.rejectionNote}
          </div>
        )}

        {testimony.status === "pending" && (
          <>
            {rejectingId !== testimony.id ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(testimony.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setRejectingId(testimony.id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </div>
            ) : (
              <div className="space-y-2 border-t pt-4">
                <Label htmlFor={`rejection-${testimony.id}`} className="text-sm">
                  Rejection Reason
                </Label>
                <Textarea
                  id={`rejection-${testimony.id}`}
                  value={rejectionNote}
                  onChange={(e) => setRejectionNote(e.target.value)}
                  placeholder="Explain why you're rejecting this testimony..."
                  rows={3}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    onClick={() => handleReject(testimony.id)}
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setRejectingId(null);
                      setRejectionNote("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Testimonies</h1>
        <p className="text-gray-500 text-sm mt-1">
          Review and approve testimonies from students and teachers before publishing
          them on the website.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Pending Review",
            value: pendingCount,
            icon: Clock,
            color: "text-yellow-500",
            bg: "bg-yellow-50",
          },
          {
            label: "Approved",
            value: approvedCount,
            icon: CheckCircle,
            color: "text-green-500",
            bg: "bg-green-50",
          },
          {
            label: "Rejected",
            value: rejectedCount,
            icon: AlertCircle,
            color: "text-red-500",
            bg: "bg-red-50",
          },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <Label className="text-sm">Filter by Submitter Type:</Label>
            <div className="flex gap-2">
              {["all", "student", "teacher"].map((type) => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFilterType(type as "all" | "student" | "teacher")
                  }
                >
                  {type === "all"
                    ? "All"
                    : type === "student"
                    ? "👨‍🎓 Students"
                    : "👨‍🏫 Teachers"}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingCount})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedCount})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedCount})
          </TabsTrigger>
        </TabsList>

        {/* Pending */}
        <TabsContent value="pending">
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="pt-5">
                  <p className="text-center text-gray-400">Loading...</p>
                </CardContent>
              </Card>
            ) : getFilteredTestimonies("pending").length === 0 ? (
              <Card>
                <CardContent className="pt-5">
                  <p className="text-center text-gray-400">
                    No pending testimonies
                  </p>
                </CardContent>
              </Card>
            ) : (
              getFilteredTestimonies("pending").map(renderTestimonyCard)
            )}
          </div>
        </TabsContent>

        {/* Approved */}
        <TabsContent value="approved">
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="pt-5">
                  <p className="text-center text-gray-400">Loading...</p>
                </CardContent>
              </Card>
            ) : getFilteredTestimonies("approved").length === 0 ? (
              <Card>
                <CardContent className="pt-5">
                  <p className="text-center text-gray-400">
                    No approved testimonies yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              getFilteredTestimonies("approved").map(renderTestimonyCard)
            )}
          </div>
        </TabsContent>

        {/* Rejected */}
        <TabsContent value="rejected">
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="pt-5">
                  <p className="text-center text-gray-400">Loading...</p>
                </CardContent>
              </Card>
            ) : getFilteredTestimonies("rejected").length === 0 ? (
              <Card>
                <CardContent className="pt-5">
                  <p className="text-center text-gray-400">
                    No rejected testimonies
                  </p>
                </CardContent>
              </Card>
            ) : (
              getFilteredTestimonies("rejected").map(renderTestimonyCard)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}