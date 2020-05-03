import { terser } from 'rollup-plugin-terser'
import banner from 'rollup-plugin-banner'

const comment =
  ` Vtro
  a trojan client for windows
  by <%= pkg.author %>
  repository:<%= pkg.repository %>`

export default {
  input: 'main.js',
  output: {
    file: 'lib/main.js',
    format: 'cjs',
  },
  plugins: [
    terser({
      output: {
        indent_level: 2,
        inline_script:false,
      }
    }),
    banner(comment)
  ],
}