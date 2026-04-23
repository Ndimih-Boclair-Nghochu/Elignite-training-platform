"use client";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Award, Download, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Certificate {
  id: number;
  certNo: string;
  title: string;
  issuedDate: string | null;
  status: string;
  createdAt: string;
}

export default function CertificatesPage() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewCertId, setPreviewCertId] = useState<number | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>("");
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    try {
      setLoading(true);
      const res = await fetch("/api/certificates");
      if (res.ok) {
        setCertificates(await res.json());
      } else {
        toast({ title: "Failed to load certificates", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast({ title: "Error loading certificates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleViewPreview(certId: number) {
    try {
      setPreviewLoading(true);
      setPreviewCertId(certId);
      const res = await fetch(`/api/certificates/${certId}/preview`);
      if (res.ok) {
        const html = await res.text();
        setPreviewContent(html);
        setPreviewOpen(true);
      } else {
        toast({ title: "Failed to load certificate preview", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error loading preview:", error);
      toast({ title: "Error loading preview", variant: "destructive" });
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleDownload(certId: number) {
    try {
      setDownloadingId(certId);
      const cert = certificates.find((c) => c.id === certId);
      if (!cert) return;

      const res = await fetch(`/api/certificates/${certId}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${cert.certNo}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        toast({ title: "Failed to download certificate", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      toast({ title: "Error downloading certificate", variant: "destructive" });
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-5">
        <h1 className="text-2xl font-bold">My Certificates</h1>
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Certificates</h1>
        <Badge variant="secondary">{certificates.length} certificates</Badge>
      </div>

      {certificates.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Award className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No certificates yet</p>
          <p className="text-sm mt-2">Certificates will appear here upon program completion</p>
        </div>
      ) : (
        <div className="space-y-4">
          {certificates.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{c.title}</p>
                      <p className="text-xs text-gray-400">
                        Certificate: {c.certNo} · {c.issuedDate ? new Date(c.issuedDate).toLocaleDateString() : "Pending"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      className={`text-xs ${
                        c.status === "issued"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                      variant="outline"
                    >
                      {c.status === "issued" ? "✓ Issued" : "⏳ Pending"}
                    </Badge>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewPreview(c.id)}
                      disabled={previewLoading && previewCertId === c.id}
                    >
                      {previewLoading && previewCertId === c.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Eye className="h-3 w-3 mr-1" />
                      )}
                      View
                    </Button>

                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleDownload(c.id)}
                      disabled={downloadingId === c.id || c.status !== "issued"}
                    >
                      {downloadingId === c.id ? (
                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Download className="h-3 w-3 mr-1" />
                      )}
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Certificate Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>

          <div className="overflow-auto">
            {previewContent ? (
              <div
                className="bg-gray-100 p-6"
                dangerouslySetInnerHTML={{ __html: previewContent }}
              />
            ) : (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="px-6 py-4 border-t flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setPreviewOpen(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                if (previewCertId) {
                  setPreviewOpen(false);
                  handleDownload(previewCertId);
                }
              }}
              disabled={downloadingId === previewCertId}
            >
              {downloadingId === previewCertId ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download Certificate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
