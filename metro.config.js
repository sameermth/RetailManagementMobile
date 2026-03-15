const { getDefaultConfig } = require('@react-native/metro-config');

module.exports = (async () => {
    const {
        resolver: { sourceExts, assetExts },
    } = await getDefaultConfig();

    return {
        transformer: {
            babelTransformerPath: require.resolve('react-native-svg-transformer'),
        },
        resolver: {
            // Add common image extensions
            assetExts: [
                ...assetExts.filter(ext => ext !== 'svg'),
                'ttf',
                'png',
                'jpg',
                'jpeg',
                'gif',
                'webp',
                'otf'
            ],
            sourceExts: [...sourceExts, 'svg'],
        },
    };
})();