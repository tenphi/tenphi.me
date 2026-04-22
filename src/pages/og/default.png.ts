import type { APIRoute } from 'astro';
import { generateOgImage, ogCard } from '../../lib/og-image';

export const GET: APIRoute = async () => {
  const png = await generateOgImage(
    ogCard({
      title: 'Andrey Yamanov',
      subtitle:
        'Frontend Developer & Principal UX/UI Engineer. Creator of Tasty and Glaze.',
    }) as never,
  );

  return new Response(png.buffer as ArrayBuffer, {
    headers: { 'Content-Type': 'image/png' },
  });
};
