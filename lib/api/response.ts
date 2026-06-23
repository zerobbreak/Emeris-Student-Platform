import { NextResponse } from "next/server";

import type { ApiErrorBody } from "@/types/auth";

export function apiSuccess<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function apiError(
  code: string,
  message: string,
  status: number,
  details?: Record<string, unknown>,
) {
  const body: ApiErrorBody = {
    success: false,
    error: { code, message, details },
  };
  return NextResponse.json(body, { status });
}

export function validationError(details: Record<string, unknown>) {
  return apiError("VALIDATION_ERROR", "Validation failed", 400, details);
}
