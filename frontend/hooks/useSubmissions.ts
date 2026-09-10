"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import type { Submission } from "@/types/submission";
import type { PagedResult } from "@/types/paged";

export function useSubmissions(assignmentId?: string, pageSize = 20) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(Boolean(assignmentId));
  const [error, setError] = useState("");
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const loadSubmissions = useCallback(async () => {
    if (!assignmentId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.get<PagedResult<Submission>>(
        `/Submission/assignment/${assignmentId}`,
        { params: { search: search || undefined, page, pageSize } },
      );
      setSubmissions(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load submissions."));
    } finally {
      setLoading(false);
    }
  }, [assignmentId, search, page, pageSize]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadSubmissions();
  }, [loadSubmissions]);

  return {
    submissions,
    loading,
    error,
    search,
    setSearch(value: string) {
      setPage(1);
      setSearchState(value);
    },
    page,
    setPage,
    totalPages,
    totalCount,
    loadSubmissions,
    async createSubmission(request: {
      assignmentId: string;
      content?: string;
      pdfFile: File;
    }) {
      const formData = new FormData();
      formData.append("assignmentId", request.assignmentId);
      formData.append("content", request.content ?? "");
      formData.append("pdfFile", request.pdfFile);

      const { data } = await api.post<Submission>("/Submission", formData);
      return data;
    },
    async gradeSubmission(
      id: string,
      request: { marksObtained: number; feedback?: string },
    ) {
      const { data } = await api.put<Submission>(`/Submission/${id}/grade`, null, {
        params: request,
      });
      setSubmissions((items) => items.map((item) => (item.id === id ? data : item)));
      return data;
    },
  };
}
