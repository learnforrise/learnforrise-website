import { Metadata } from 'next';
import { Post, PostCategory } from '@/types/post';
import { getPostBySlug, getRelatedPosts, getAllPostSlugs } from '@/lib/api';

export async function generateCategoryPostParams(category: PostCategory) {
  try {
    const slugs = await getAllPostSlugs(category);
    return slugs.map((slug) => ({ slug }));
  } catch (e) {
    return [];
  }
}

export async function generateCategoryPostMetadata(
  slug: string,
  category: PostCategory,
  categoryLabel: string
): Promise<Metadata> {
  const baseUrl = 'https://learnforrise.com';
  const canonicalUrl = `${baseUrl}/${category}/${slug}`;

  try {
    const res = await getPostBySlug(slug);
    if (res.success && res.data) {
      const post = res.data;
      const title = `${post.title} — ${categoryLabel}`;
      const description =
        post.shortDescription ||
        `${post.title}. Check notification details, exam dates, eligibility criteria, vacancies, age limit, fee, and direct official links on LearnForRise.`;

      return {
        title,
        description,
        keywords: [
          post.title,
          categoryLabel,
          post.department || '',
          post.state || '',
          'LearnForRise',
          'Sarkari Result',
          'Government Jobs 2026',
        ].filter(Boolean),
        alternates: {
          canonical: canonicalUrl,
        },
        robots: {
          index: true,
          follow: true,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
        openGraph: {
          title,
          description,
          url: canonicalUrl,
          siteName: 'LearnForRise',
          locale: 'en_IN',
          type: 'article',
          publishedTime: post.publishedAt || post.createdAt,
          modifiedTime: post.updatedAt || post.publishedAt || post.createdAt,
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
        },
      };
    }
  } catch (e) {}

  return {
    title: `${categoryLabel} Details | LearnForRise`,
    alternates: { canonical: canonicalUrl },
  };
}

export async function getPostSSRData(slug: string) {
  let initialPost: Post | null = null;
  let initialRelated: Post[] = [];

  try {
    const [postRes, relatedRes] = await Promise.all([
      getPostBySlug(slug),
      getRelatedPosts(slug),
    ]);
    if (postRes.success && postRes.data) initialPost = postRes.data;
    if (relatedRes.success && relatedRes.data) initialRelated = relatedRes.data || [];
  } catch (e) {}

  return { initialPost, initialRelated };
}
