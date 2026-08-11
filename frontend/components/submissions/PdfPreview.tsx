"use client";

import { useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import { Alert } from "@/components/ui/Alert";
import { Loading } from "@/components/ui/Loading";

export function PdfPreview({
  fileUrl,
  title,
}: {
  fileUrl: string;
  title: string;
}) {
  const [blobUrl, setBlobUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let objectUrl = "";
    let cancelled = false;

    async function loadPdf() {
      setError("");
      try {
        const { data } = await api.get<Blob>(fileUrl, {
          responseType: "blob",
        });

        if (cancelled) {
          return;
        }

        objectUrl = URL.createObjectURL(data);
        setBlobUrl(objectUrl);
      } catch (err) {
        console.error(err);
        setError(getApiErrorMessage(err, "Could not load PDF preview."));
      }
    }

    void loadPdf();

    return () => {
      cancelled = true;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileUrl]);

  if (error) {
    return <Alert>{error}</Alert>;
  }

  if (!blobUrl) {
    return <Loading label="Loading PDF preview" />;
  }

  return (
    <iframe
      title={title}
      src={blobUrl}
      className="h-[680px] w-full rounded-md border border-slate-200 bg-white"
    />
  );
}
