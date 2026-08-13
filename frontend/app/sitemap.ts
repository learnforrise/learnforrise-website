import { MetadataRoute } from 'next';
import { getPosts } from '@/lib/api';
import { CATEGORIES } from '@/types/post';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://learnforrise.com';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'always', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // Category routes
  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Dynamic post routes with accurate category paths
  let postRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await getPosts({ limit: 1000 });
    if (res && res.data && res.data.length > 0) {
      postRoutes = res.data.map((post) => ({
        url: `${baseUrl}/${post.category || 'latest-jobs'}/${post.slug}`,
        lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.createdAt || Date.now()),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (e) {
    // Fallback if API fails during build
  }

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
