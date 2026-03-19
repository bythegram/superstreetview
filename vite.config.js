import { defineConfig } from 'vite';

export default defineConfig({
  // Use a relative base so the build works when deployed to any sub-path
  // (e.g. https://bythegram.github.io/superstreetview/).
  base: './',
});
