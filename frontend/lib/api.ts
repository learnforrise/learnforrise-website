import type {
  Post,
  PostsResponse,
  SinglePostResponse,
  TrendingResponse,
  CategoryPostsResponse,
  SearchResponse,
  CategoriesResponse,
  PostCategory,
} from '@/types/post';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

/**
 * Robust fetch wrapper with error handling and fallback
 */
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit & { revalidate?: number }
): Promise<T> {
  const { revalidate = 60, ...fetchOptions } = options || {};

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...fetchOptions,
      next: { revalidate },
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions?.headers,
      },
    });

    if (!res.ok) {
      console.warn(`[API Warning] ${endpoint} returned status ${res.status}`);
      return { success: false, data: [] } as unknown as T;
    }

    return await res.json();
  } catch (error: any) {
    console.warn(`[API Fetch Warning] ${endpoint}: ${error?.message || 'Network error'}`);
    return { success: false, data: [] } as unknown as T;
  }
}

// ─── Posts ───────────────────────────────────────────────────────────────────

export async function getPosts(params?: {
  category?: PostCategory;
  state?: string;
  qualification?: string;
  department?: string;
  page?: number;
  limit?: number;
}): Promise<PostsResponse> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set('category', params.category);
  if (params?.state) searchParams.set('state', params.state);
  if (params?.qualification) searchParams.set('qualification', params.qualification);
  if (params?.department) searchParams.set('department', params.department);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const query = searchParams.toString();
  const res = await fetchAPI<PostsResponse>(`/posts${query ? `?${query}` : ''}`);
  if (!res || !res.data) {
    return { success: false, data: [], pagination: { page: 1, limit: 12, total: 0, pages: 1 } };
  }
  return res;
}

export async function getPostBySlug(slug: string): Promise<SinglePostResponse> {
  const res = await fetchAPI<SinglePostResponse>(`/posts/${encodeURIComponent(slug)}`, { revalidate: 30 });
  if (!res || !res.data) {
    return { success: false, data: null as any };
  }
  return res;
}

export async function getTrendingPosts(limit = 6): Promise<TrendingResponse> {
  const res = await fetchAPI<TrendingResponse>(`/posts/trending?limit=${limit}`);
  if (!res || !res.data) {
    return { success: false, data: [] };
  }
  return res;
}

export async function getPostsByCategory(limit = 5): Promise<CategoryPostsResponse> {
  const res = await fetchAPI<CategoryPostsResponse>(`/posts/by-category?limit=${limit}`);
  if (!res || !res.data) {
    return { success: false, data: [] };
  }
  return res;
}

export async function getRelatedPosts(slug: string): Promise<TrendingResponse> {
  const res = await fetchAPI<TrendingResponse>(`/posts/${encodeURIComponent(slug)}/related`);
  if (!res || !res.data) {
    return { success: false, data: [] };
  }
  return res;
}

export async function getPostById(id: string): Promise<SinglePostResponse> {
  const res = await fetchAPI<SinglePostResponse>(`/posts/id/${encodeURIComponent(id)}`, { revalidate: 0 });
  if (!res || !res.data) {
    return { success: false, data: null as any };
  }
  return res;
}

export async function createPost(data: Partial<Post>): Promise<SinglePostResponse> {
  const res = await fetchAPI<SinglePostResponse>('/posts', {
    method: 'POST',
    body: JSON.stringify(data),
    revalidate: 0,
  });
  return res;
}

export async function updatePost(id: string, data: Partial<Post>): Promise<SinglePostResponse> {
  const res = await fetchAPI<SinglePostResponse>(`/posts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
    revalidate: 0,
  });
  return res;
}

export async function deletePost(id: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetchAPI<{ success: boolean; message?: string }>(`/posts/${id}`, {
    method: 'DELETE',
    revalidate: 0,
  });
  return res;
}

// ─── Search ─────────────────────────────────────────────────────────────────

export async function searchPosts(
  query: string,
  params?: { category?: PostCategory; page?: number; limit?: number }
): Promise<SearchResponse> {
  const searchParams = new URLSearchParams({ q: query });
  if (params?.category) searchParams.set('category', params.category);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));

  const res = await fetchAPI<SearchResponse>(`/search?${searchParams.toString()}`, { revalidate: 0 });
  if (!res || !res.data) {
    return { success: false, query, data: [], pagination: { page: 1, limit: 12, total: 0, pages: 1 } };
  }
  return res;
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function getCategories(): Promise<CategoriesResponse> {
  const res = await fetchAPI<CategoriesResponse>('/categories', { revalidate: 0 });
  if (!res || !res.data) {
    return { success: false, data: [] };
  }
  return res;
}

export async function createCategory(data: { name: string; slug?: string; description?: string; icon?: string }): Promise<{ success: boolean; data?: any; message?: string }> {
  const res = await fetchAPI<{ success: boolean; data?: any; message?: string }>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
    revalidate: 0,
  });
  return res;
}

export async function deleteCategory(id: string): Promise<{ success: boolean; message?: string }> {
  const res = await fetchAPI<{ success: boolean; message?: string }>(`/categories/${id}`, {
    method: 'DELETE',
    revalidate: 0,
  });
  return res;
}

// ─── Settings & Social Links ──────────────────────────────────────────────────

export interface SocialLinks {
  telegram: string;
  whatsapp: string;
  youtube: string;
  instagram: string;
  facebook: string;
  twitter: string;
  playstore: string;
}

export interface SettingsResponse {
  success: boolean;
  data?: {
    socialLinks: SocialLinks;
  };
  message?: string;
}

export async function getSettings(): Promise<SettingsResponse> {
  const res = await fetchAPI<SettingsResponse>('/settings', { revalidate: 60 });
  if (!res || !res.data) {
    return {
      success: true,
      data: {
        socialLinks: {
          telegram: 'https://t.me/LearnForRiseExam_info',
          whatsapp: 'https://whatsapp.com/channel/0029VaAbQf01NCrYADMLt00L',
          youtube: 'https://www.youtube.com/channel/UCN3yxHYTmoiVXJC3UxrlOqQ',
          instagram: 'https://www.instagram.com/learnforrise/',
          facebook: 'https://www.facebook.com/people/LF-Rise/61590147007558/',
          twitter: 'https://twitter.com/LearnForRise',
          playstore: 'https://play.google.com/store/apps/details?id=com.vinod.sarkarinaukri',
        },
      },
    };
  }
  return res;
}

export async function updateSettings(
  socialLinks: Partial<SocialLinks>,
  token: string
): Promise<SettingsResponse> {
  const res = await fetchAPI<SettingsResponse>('/settings', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ socialLinks }),
    revalidate: 0,
  });
  return res;
}

// ─── All slugs for static generation ────────────────────────────────────────

export async function getAllPostSlugs(category?: PostCategory): Promise<string[]> {
  try {
    const params: Record<string, string> = { limit: '1000' };
    if (category) params.category = category;
    const searchParams = new URLSearchParams(params);
    const res = await fetchAPI<PostsResponse>(`/posts?${searchParams.toString()}`);
    return res?.data?.map((post) => post.slug) || [];
  } catch (err) {
    return [];
  }
}
