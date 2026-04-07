import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [react(), mdx()],
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-dark',
        dark: 'github-dark',
      },
      transformers: [
        {
          pre(node) {
            // Force tight line-height on all code blocks
            node.properties.style = (node.properties.style || '') + ';line-height:1.35';
          },
        },
      ],
    },
  },
});
