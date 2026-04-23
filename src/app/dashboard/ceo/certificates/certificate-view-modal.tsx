"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Download, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CertificateViewModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  certificateId: number;
  certificateTitle: string;
  certNo: string;
}

export function CertificateViewModal({
  isOpen,
  onOpenChange,
  certificateId,
  certificateTitle,
  certNo,
}: CertificateViewModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCertificate();
    }
  }, [isOpen, certificateId]);

  async function loadCertificate() {
    try {
      setLoading(true);
      setError(null);
      setContent(null);

      const res = await fetch(`/api/certificates/${certificateId}/preview`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || `Failed to load certificate (${res.status})`);
      }

      const html = await res.text();
      setContent(html);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load certificate";
      setError(errorMessage);
      console.error("Certificate preview error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    try {
      setLoading(true);
      const res = await fetch(`/api/certificates/${certificateId}/download`);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Failed to download certificate");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certNo}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Certificate downloaded successfully" });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to download certificate";
      toast({ title: errorMessage, variant: "destructive" });
      console.error("Download error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{certificateTitle}</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">{certNo}</p>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-gray-50 border border-gray-200 rounded-md">
          {loading && !content && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-gray-600">Loading certificate...</p>
              </div>
            </div>
          )}

          {error && !content && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center max-w-sm">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-500" />
                <p className="font-medium text-red-700">Failed to load certificate</p>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
                <Button
                  onClick={loadCertificate}
                  className="mt-4"
                  variant="outline"
                >
                  Try again
                </Button>
              </div>
            </div>
          )}

          {content && (
            <div
              className="p-6 bg-white"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Close
          </Button>
          <Button
            onClick={handleDownload}
            disabled={loading || !content}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
