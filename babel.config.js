module.exports = function(api) {
    api.cache(true);
    return {
        presets: [
            'babel-preset-expo'
        ],
        plugins: [
            'react-native-reanimated/plugin', // if you use reanimated
            [
                'module-resolver',
                {
                    root: ['./'],
                    alias: {
                        '@': './src',
                        '@hooks': './src/hooks',
                        '@theme': './src/theme',
                        '@utils': './src/utils',
                        '@api': './src/api',
                        '@store': './src/store',
                        '@screens': './src/screens',
                        '@components': './src/components',
                        '@navigation': './src/navigation',
                        '@constants': './src/constants',
                    },
                    extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
                },
            ],
        ],
    };
};