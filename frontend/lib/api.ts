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
import fallbackPostsData from './postsFallback.json';

const fallbackPosts: Post[] = fallbackPostsData as unknown as Post[];

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

  if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res;
  }

  // Fallback to local 120 posts data if API is unreachable
  let filtered = [...fallbackPosts];

  if (params?.category) {
    filtered = filtered.filter((p) => p.category === params.category);
  }
  if (params?.state) {
    filtered = filtered.filter((p) => p.state && p.state.toLowerCase() === params.state?.toLowerCase());
  }
  if (params?.qualification) {
    filtered = filtered.filter((p) => p.qualification && p.qualification.toLowerCase().includes(params.qualification!.toLowerCase()));
  }
  if (params?.department) {
    filtered = filtered.filter((p) => p.department && p.department.toLowerCase().includes(params.department!.toLowerCase()));
  }

  const page = params?.page || 1;
  const limit = params?.limit || 12;
  const total = filtered.length;
  const pages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  return {
    success: true,
    data: paginatedData,
    pagination: { page, limit, total, pages },
  };
}

export async function getPostBySlug(slug: string): Promise<SinglePostResponse> {
  const res = await fetchAPI<SinglePostResponse>(`/posts/${encodeURIComponent(slug)}`, { revalidate: 30 });
  if (res && res.success && res.data) {
    return res;
  }

  // Fallback match by slug
  const decodedSlug = decodeURIComponent(slug);
  const found = fallbackPosts.find((p) => p.slug === slug || p.slug === decodedSlug);
  if (found) {
    return { success: true, data: found };
  }

  return { success: false, data: null as any };
}

export async function getTrendingPosts(limit = 6): Promise<TrendingResponse> {
  const res = await fetchAPI<TrendingResponse>(`/posts/trending?limit=${limit}`);
  if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res;
  }

  // Fallback trending posts
  const trending = fallbackPosts.filter((p) => p.isTrending || p.isFeatured).slice(0, limit);
  return {
    success: true,
    data: trending.length > 0 ? trending : fallbackPosts.slice(0, limit),
  };
}

export async function getPostsByCategory(limit = 3): Promise<CategoryPostsResponse> {
  const res = await fetchAPI<CategoryPostsResponse>(`/posts/by-category?limit=${limit}`);
  if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res;
  }

  // Fallback group by category
  const categories: PostCategory[] = ['latest-jobs', 'result', 'admit-card', 'answer-key', 'syllabus', 'admission'];
  const grouped = categories.map((cat) => ({
    category: cat,
    posts: fallbackPosts.filter((p) => p.category === cat).slice(0, limit),
  }));

  return {
    success: true,
    data: grouped,
  };
}

export async function getRelatedPosts(slug: string): Promise<TrendingResponse> {
  const res = await fetchAPI<TrendingResponse>(`/posts/${encodeURIComponent(slug)}/related`);
  if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res;
  }

  const currentPost = fallbackPosts.find((p) => p.slug === slug);
  const category = currentPost?.category || 'latest-jobs';
  const related = fallbackPosts.filter((p) => p.slug !== slug && p.category === category).slice(0, 4);

  return {
    success: true,
    data: related,
  };
}

export async function getPostById(id: string): Promise<SinglePostResponse> {
  const res = await fetchAPI<SinglePostResponse>(`/posts/id/${encodeURIComponent(id)}`, { revalidate: 0 });
  if (res && res.success && res.data) {
    return res;
  }

  const found = fallbackPosts.find((p) => p._id === id);
  if (found) {
    return { success: true, data: found };
  }

  return { success: false, data: null as any };
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
  if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res;
  }

  // Fallback local search
  const q = query.toLowerCase();
  let results = fallbackPosts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      (p.shortDescription && p.shortDescription.toLowerCase().includes(q)) ||
      (p.department && p.department.toLowerCase().includes(q)) ||
      (p.state && p.state.toLowerCase().includes(q))
  );

  if (params?.category) {
    results = results.filter((p) => p.category === params.category);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 12;
  const total = results.length;
  const pages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;

  return {
    success: true,
    query,
    data: results.slice(startIndex, startIndex + limit),
    pagination: { page, limit, total, pages },
  };
}

// ─── Categories ─────────────────────────────────────────────────────────────

export async function getCategories(): Promise<CategoriesResponse> {
  const res = await fetchAPI<CategoriesResponse>('/categories', { revalidate: 0 });
  if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
    return res;
  }
  return { success: true, data: [] };
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

// ─── All slugs for static generation & sitemaps ──────────────────────────────

export async function getAllPostSlugs(category?: PostCategory): Promise<string[]> {
  try {
    const params: Record<string, string> = { limit: '1000' };
    if (category) params.category = category;
    const searchParams = new URLSearchParams(params);
    const res = await fetchAPI<PostsResponse>(`/posts?${searchParams.toString()}`);
    if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
      return res.data.map((post) => post.slug);
    }
  } catch (err) {}

  // Fallback to local 120 post slugs
  let filtered = [...fallbackPosts];
  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }
  return filtered.map((p) => p.slug);
}
