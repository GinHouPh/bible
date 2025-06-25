module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@bible/shared': '../../packages/shared/src',
            '@bible/parser': '../../packages/bible-parser/src',
            '@bible/database': '../../packages/database/src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@navigation': './src/navigation',
            '@utils': './src/utils',
            '@assets': './assets'
          }
        }
      ]
    ]
  };
};
