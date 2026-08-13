import { getPosts } from '@/lib/api';
import { Post } from '@/types/post';

export async function GET() {
  const baseUrl = 'https://learnforrise.com';
  let posts: Post[] = [];

  try {
    const res = await getPosts({ limit: 100 });
    if (res && res.data) posts = res.data;
  } catch (e) {
    console.error('Error fetching posts for feed.xml:', e);
  }

  const itemsXml = posts
    .map((post) => {
      const postUrl = `${baseUrl}/${post.category || 'latest-jobs'}/${post.slug}`;
      const pubDate = post.publishedAt || post.createdAt ? new Date(post.publishedAt || post.createdAt).toUTCString() : new Date().toUTCString();
      const description = (post.shortDescription || post.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

      return `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${postUrl}</link>
      <guid isPermaLink="true">${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${description}]]></description>
      <category><![CDATA[${post.category || 'latest-jobs'}]]></category>
    </item>`;
    })
    .join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>LearnForRise — Government Jobs, Results, Admit Cards &amp; Notifications</title>
    <link>${baseUrl}</link>
    <description>Real-time Sarkari Result, Latest Jobs, Admit Card, Answer Key, and Syllabus updates across India.</description>
    <language>en-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
    },
  });
}
