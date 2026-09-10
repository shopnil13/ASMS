"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import type { Course, CourseRequest } from "@/types/course";
import type { PagedResult } from "@/types/paged";

export function useCourses(autoLoad = true, pageSize = 100) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get<PagedResult<Course>>("/Course", {
        params: { search: search || undefined, page, pageSize },
      });
      setCourses(data.items);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load courses."));
    } finally {
      setLoading(false);
    }
  }, [search, page, pageSize]);

  useEffect(() => {
    if (autoLoad) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadCourses();
    }
  }, [autoLoad, loadCourses]);

  return {
    courses,
    loading,
    error,
    search,
    setSearch(value: string) {
      setPage(1);
      setSearch(value);
    },
    page,
    setPage,
    totalPages,
    totalCount,
    loadCourses,
    async createCourse(request: CourseRequest) {
      const { data } = await api.post<Course>("/Course", request);
      setCourses((items) => [data, ...items]);
      return data;
    },
    async updateCourse(id: string, request: CourseRequest) {
      const { data } = await api.put<Course>(`/Course/${id}`, request);
      setCourses((items) => items.map((item) => (item.id === id ? data : item)));
      return data;
    },
    async deleteCourse(id: string) {
      await api.delete(`/Course/${id}`);
      setCourses((items) => items.filter((item) => item.id !== id));
    },
  };
}
