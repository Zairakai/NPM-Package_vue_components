/**
 * Project ESLint configuration.
 * Extends the @zairakai/js-dev-tools base config - customize as needed.
 *
 * Example of adding project-specific rules:
 *   export default [
 *     ...baseConfig,
 *     {
 *       rules: {
 *         'no-console': 'warn',
 *       },
 *     },
 *   ]
 */

import baseConfig from '@zairakai/js-dev-tools/config/eslint.config.js'

export default [
  ...baseConfig,
  {
    // These components show HTML that the caller chose, by their API: the HTML prop of the paragraph, the renderer of
    // the Markdown (the default one escapes the text first) and the highlighter of the code block. The other
    // components show their props as text, and take HTML through slots.
    files: [
      'src/Content/Paragraph.vue',
      'src/Content/Markdown.vue',
      'src/Content/CodeBlock.vue',
    ],
    rules: { 'vue/no-v-html': 'off' },
  },
]
