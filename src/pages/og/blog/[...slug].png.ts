import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { generateOgImage, ogCard, pngResponse } from '../../../lib/og-image';

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getCollection('blog');
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { post },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as {
    post: { data: { title: string; description: string } };
  };

  const png = await generateOgImage(
    ogCard({
      title: post.data.title,
      subtitle: post.data.description,
    }) as never,
  );

  return pngResponse(png);
};
