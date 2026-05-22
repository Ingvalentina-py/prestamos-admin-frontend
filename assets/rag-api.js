const RAG_MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const RAG_ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

function ragFormatError(data, fallback) {
  if (typeof formatApiError === "function") {
    return formatApiError(data, fallback);
  }
  const message = data?.message || fallback;
  if (data?.detail) {
    const detail =
      typeof data.detail === "string"
        ? data.detail
        : JSON.stringify(data.detail);
    return `${message} (${detail})`;
  }
  return message;
}

async function ragFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !options.skipJsonContentType) {
    headers["Content-Type"] = "application/json";
  }

  const token = getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  let data = null;
  try {
    data = await response.json();
  } catch (error) {}

  if (!response.ok) {
    const err = new Error(ragFormatError(data, "Error en la solicitud RAG"));
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

function ragValidateFile(file) {
  if (!file) {
    throw new Error("Selecciona un archivo.");
  }

  const name = file.name.toLowerCase();
  const allowed = RAG_ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!allowed) {
    throw new Error("Solo se permiten archivos PDF, DOCX o TXT.");
  }

  if (file.size > RAG_MAX_UPLOAD_BYTES) {
    throw new Error("El archivo supera el límite de 10 MB.");
  }
}

async function ragPrepareWithFile(file, language = "es") {
  ragValidateFile(file);
  const form = new FormData();
  form.append("file", file);
  form.append("language", language);
  return ragFetch("/rag/documents/prepare", {
    method: "POST",
    body: form,
  });
}

async function ragPrepareWithText({ text, language = "es", filename = "inline.txt" }) {
  const trimmed = (text || "").trim();
  if (!trimmed) {
    throw new Error("Pega o escribe el contenido del documento.");
  }

  return ragFetch("/rag/documents/prepare", {
    method: "POST",
    body: JSON.stringify({
      text: trimmed,
      language,
      filename: filename || "inline.txt",
    }),
  });
}

async function ragConfirmEmbeddings(documentId, body) {
  return ragFetch(`/rag/documents/${encodeURIComponent(documentId)}/embeddings`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}
