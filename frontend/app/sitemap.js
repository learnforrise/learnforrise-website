import { getPosts } from '@/lib/api';
import { CATEGORIES } from '@/types/post';

export default async function sitemap() {
  const baseUrl = 'https://learnforrise.com';

  // Static core routes
  const staticRoutes = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'always', priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // All category listing routes
  const categoryRoutes = CATEGORIES.map((cat) => ({
    url: `${baseUrl}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.9,
  }));

  // Dynamic post routes across all categories
  let postRoutes = [];
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
    console.error('Error fetching posts for sitemap.js:', e);
  }

  return [...staticRoutes, ...categoryRoutes, ...postRoutes];
}
