"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import type { Assignment, AssignmentRequest } from "@/types/assignment";
import type { PagedResult } from "@/types/paged";

export function useAssignments(courseId?: string, pageSize = 100) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(Boolean(courseId));
  const [error, setError] = useState("");
  const [search, setSearchState] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const loadAssignments = useCallback(async () => {
    if (!courseId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.get<PagedResult<Assignment>>(
        `/Assignment/course/${courseId}`,
        { params: { search: search || undefined, page, pageSize } },
      );
      setAssignments(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load assignments."));
    } finally {
      setLoading(false);
    }
  }, [courseId, search, page, pageSize]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAssignments();
  }, [loadAssignments]);

  return {
    assignments,
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
    loadAssignments,
    async createAssignment(request: AssignmentRequest) {
      const { data } = await api.post<Assignment>("/Assignment", request);
      setAssignments((items) => [data, ...items]);
      return data;
    },
    async updateAssignment(id: string, request: AssignmentRequest) {
      const { data } = await api.put<Assignment>(`/Assignment/${id}`, request);
      setAssignments((items) => items.map((item) => (item.id === id ? data : item)));
      return data;
    },
    async deleteAssignment(id: string) {
      await api.delete(`/Assignment/${id}`);
      setAssignments((items) => items.filter((item) => item.id !== id));
    },
  };
}
