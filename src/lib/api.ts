const API_BASE = "";

export async function api<T = any>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const auth = {
  login: (email: string, password: string) =>
    api("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  signup: (email: string, password: string, full_name: string, phone?: string) =>
    api("/api/auth/signup", { method: "POST", body: JSON.stringify({ email, password, full_name, phone }) }),
};

export const products = {
  list: (category?: string) => api(`/api/products${category ? `?category=${category}` : ""}`),
  get: (id: string) => api(`/api/products/${id}`),
};

export const cart = {
  get: (userId: string) => api(`/api/cart/${userId}`),
  add: (userId: string, productId: string, quantity?: number) =>
    api("/api/cart/add", { method: "POST", body: JSON.stringify({ user_id: userId, product_id: productId, quantity }) }),
  remove: (userId: string, itemId: string) =>
    api(`/api/cart/${userId}/${itemId}`, { method: "DELETE" }),
  clear: (userId: string) => api(`/api/cart/${userId}`, { method: "DELETE" }),
};

export const orders = {
  list: (userId?: string, status?: string) => {
    const params = new URLSearchParams();
    if (userId) params.set("user_id", userId);
    if (status) params.set("status", status);
    return api(`/api/orders?${params}`);
  },
  get: (id: string) => api(`/api/orders/${id}`),
  create: (data: any) => api("/api/orders", { method: "POST", body: JSON.stringify(data) }),
  updateStatus: (id: string, status: string, note?: string) =>
    api(`/api/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status, note }) }),
};

export const admin = {
  stats: () => api("/api/admin/stats"),
  createProduct: (data: any) => api("/api/admin/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id: string, data: any) => api(`/api/admin/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id: string) => api(`/api/admin/products/${id}`, { method: "DELETE" }),
};

export const categories = {
  list: () => api<string[]>("/api/categories"),
};
