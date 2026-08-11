"use client";

import { useCallback, useEffect, useState } from "react";
import api, { getApiErrorMessage } from "@/lib/api";
import type { Course, CourseRequest } from "@/types/course";

export function useCourses(autoLoad = true) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState("");

  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get<Course[]>("/Course");
      setCourses(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Could not load courses."));
    } finally {
      setLoading(false);
    }
  }, []);

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
