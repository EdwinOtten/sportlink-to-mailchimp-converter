import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: 'src/sportlink-to-mailchimp-converter.ts',
  output: {
    file: 'dist/sportlink-to-mailchimp-converter.umd.js',
    format: 'umd',
    name: 'SportlinkToMailchimpConverter'
  },
  plugins: [
    resolve(),
    typescript()
  ]
};
