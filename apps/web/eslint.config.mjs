// eslint-config-next 16 ships a native flat config; FlatCompat over it now
// throws "Converting circular structure to JSON".
import nextVitals from 'eslint-config-next/core-web-vitals'

const eslintConfig = [
  ...nextVitals,
  {
    // New React Compiler rules from eslint-plugin-react-hooks 7 (pulled in by
    // eslint-config-next 16). Existing components trip them; warn until they
    // are refactored rather than fail CI on a security bump.
    rules: {
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
    },
  },
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
]

export default eslintConfig
