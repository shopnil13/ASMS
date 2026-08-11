"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import type { Assignment, AssignmentRequest } from "@/types/assignment";

export function useAssignments(courseId?: string) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(Boolean(courseId));
  const [error, setError] = useState("");

  const loadAssignments = useCallback(async () => {
    if (!courseId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await api.get<Assignment[]>(
        `/Assignment/course/${courseId}`,
      );
      setAssignments(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load assignments."));
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAssignments();
  }, [loadAssignments]);

  return {
    assignments,
    loading,
    error,
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
