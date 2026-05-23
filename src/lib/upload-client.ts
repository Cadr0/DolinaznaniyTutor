type UploadJsonResponse = {
  url?: string;
  error?: string;
};

export async function parseUploadResponse(response: Response): Promise<UploadJsonResponse> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as UploadJsonResponse;
  }

  const text = await response.text();

  if (response.status === 413) {
    return { error: "__too_large__" };
  }

  if (response.status === 401) {
    return { error: "__unauthorized__" };
  }

  return { error: text.slice(0, 120) || "__unknown__" };
}

export function uploadErrorMessage(
  code: string | undefined,
  messages: {
    tooLarge: string;
    unauthorized: string;
    failed: string;
  },
): string {
  switch (code) {
    case "__too_large__":
      return messages.tooLarge;
    case "__unauthorized__":
      return messages.unauthorized;
    case "__unknown__":
      return messages.failed;
    default:
      return code && !code.startsWith("__") ? code : messages.failed;
  }
}
