import { colors } from './color';
import { typography } from './typography';

export const theme = {
    colors: {
        accent: colors.secondary[500],
        ...colors,
    },
    fonts: typography,
    roundness: 8,
};

export { colors, typography };