import React from 'react';
import { Platform, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { colors } from '@theme/color';

export type IconType =
    | 'material'
    | 'evil'
    | 'ionicon'
    | 'fontawesome';

interface IconProps {
    name: string;
    size?: number;
    color?: string;
    type?: IconType;
    style?: any;
}

const Icon: React.FC<IconProps> = ({
                                       name,
                                       size = 24,
                                       color = colors.text.primary,
                                       type = 'material',
                                       style
                                   }) => {
    // Choose the appropriate icon set
    const getIconComponent = () => {
        switch (type) {
            case 'evil':
                return EvilIcons;
            case 'ionicon':
                return Ionicons;
            case 'fontawesome':
                return FontAwesome;
            default:
                return MaterialCommunityIcons;
        }
    };

    const IconComponent = getIconComponent();

    return (
        <IconComponent
            name={name}
            size={size}
            color={color}
            style={style}
        />
    );
};

export default Icon;