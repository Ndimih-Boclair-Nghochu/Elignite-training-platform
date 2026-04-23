"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Trash2, Star, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface Testimony {
  id: number;
  name: string;
  program: string;
  year: string;
  text: string;
  rating: number;
  status: "pending" | "approved" | "rejected";
  rejectionNote?: string;
  createdAt: string;
}

export default function StudentTestimoniesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [testimonies, setTestimonies] = useState<Testimony[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [programOptions, setProgramOptions] = useState<string[]>(["General"]);
  const [selectedProgram, setSelectedProgram] = useState("General");
  const [formData, setFormData] = useState({
    name: user?.firstName + " " + user?.lastName || "",
    program: "General",
    year: "",
    text: "",
    rating: 5,
  });

  const fetchTestimonies = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/testimonies");
      if (!response.ok) throw new Error("Failed to fetch testimonies");
      const data = await response.json();
      // Filter to only show current user's testimonies
      const userTestimonies = data.filter(
        (t: Testimony & { user: { email: string } }) => t.user?.email === user?.email
      );
      setTestimonies(userTestimonies);
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
    fetchPrograms();
  }, [user?.email]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, program: selectedProgram }));
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    try {
      const response = await fetch("/api/programs");
      if (!response.ok) throw new Error("Failed to load programs");
      const data = await response.json();
      const titles = data.map((program: { title: string }) => program.title);
      setProgramOptions(["General", ...titles]);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      toast({ title: "Error", description: "Please write a testimony" });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch("/api/testimonies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit testimony");

      const newTestimony = await response.json();
      setTestimonies([newTestimony, ...testimonies]);
      setSelectedProgram("General");
      setFormData({ name: formData.name, program: "General", year: "", text: "", rating: 5 });

      toast({
        title: "Success",
        description: "Testimony submitted for approval",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to submit testimony",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimony?")) return;

    try {
      const response = await fetch(`/api/testimonies/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete testimony");

      setTestimonies(testimonies.filter((t) => t.id !== id));
      toast({
        title: "Success",
        description: "Testimony deleted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to delete testimony",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-800">✓ Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">✗ Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const pendingCount = testimonies.filter((t) => t.status === "pending").length;
  const approvedCount = testimonies.filter((t) => t.status === "approved").length;
  const rejectedCount = testimonies.filter((t) => t.status === "rejected").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Share Your Experience</h1>
        <p className="text-gray-500 text-sm mt-1">
          Help future students by sharing your testimony. Your feedback will be reviewed before being published.
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

      {/* Tabs */}
      <Tabs defaultValue="submit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="submit">Submit Testimony</TabsTrigger>
          <TabsTrigger value="myTestimonies">My Testimonies ({testimonies.length})</TabsTrigger>
        </TabsList>

        {/* Submit Form */}
        <TabsContent value="submit">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Write Your Testimony</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="program">Testimony Type</Label>
                    <Select value={selectedProgram} onValueChange={setSelectedProgram}>
                      <SelectTrigger id="program">
                        <SelectValue placeholder="Select program or general" />
                      </SelectTrigger>
                      <SelectContent>
                        {programOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option === "General" ? "General" : option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Graduation Year</Label>
                    <Input
                      id="year"
                      value={formData.year}
                      onChange={(e) =>
                        setFormData({ ...formData, year: e.target.value })
                      }
                      placeholder="e.g., 2023"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating (1-5 stars)</Label>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setFormData({ ...formData, rating: star })}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= formData.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="text">Your Message</Label>
                  <Textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) =>
                      setFormData({ ...formData, text: e.target.value })
                    }
                    placeholder="Share your experience, what you learned, achievements, or advice for current students..."
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {formData.text.length} characters
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? "Submitting..." : "Submit Testimony"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Testimonies */}
        <TabsContent value="myTestimonies">
          <div className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="pt-5">
                  <p className="text-center text-gray-400">Loading...</p>
                </CardContent>
              </Card>
            ) : testimonies.length === 0 ? (
              <Card>
                <CardContent className="pt-5">
                  <p className="text-center text-gray-400">
                    No testimonies yet. Share your first one!
                  </p>
                </CardContent>
              </Card>
            ) : (
              testimonies.map((testimony) => (
                <Card key={testimony.id} className="hover:shadow-md transition">
                  <CardContent className="pt-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {testimony.name}
                          </h3>
                          {getStatusBadge(testimony.status)}
                        </div>
                        <div className="flex gap-4 text-xs text-gray-500">
                          {testimony.program && (
                            <span>📚 {testimony.program}</span>
                          )}
                          {testimony.year && <span>📅 {testimony.year}</span>}
                          <span>
                            ⭐ {testimony.rating}/5
                          </span>
                          <span>
                            {new Date(testimony.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {testimony.status === "pending" && (
                        <button
                          onClick={() => handleDelete(testimony.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-gray-700 mb-3">{testimony.text}</p>

                    {testimony.status === "rejected" && testimony.rejectionNote && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                        <strong>Rejection reason:</strong> {testimony.rejectionNote}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
