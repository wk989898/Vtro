import { terser } from 'rollup-plugin-terser'
import banner from 'rollup-plugin-banner'

const comment =
  `
  This file is part of Vtro.
  Copyright (C) 2020  wk989898
  
  Vtro is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.
  
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.
  
  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <https://www.gnu.org/licenses/>.
  `

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