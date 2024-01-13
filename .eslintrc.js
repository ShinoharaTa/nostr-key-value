module.exports = {
    extends: [
      'airbnb',
      'airbnb/hooks',
      'plugin:@typescript-eslint/recommended',
      // Prettierと組み合わせる場合は以下も追加
    //   'prettier',
    //   'prettier/react',
    //   'prettier/@typescript-eslint'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    //   ecmaFeatures: {
    //     jsx: true,
    //   },
    },
    rules: {
      // ここにカスタムルールを追加
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  };
