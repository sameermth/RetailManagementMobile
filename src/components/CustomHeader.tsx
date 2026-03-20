import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { colors } from '@theme/color';
import { typography } from '@theme/typography';

interface CustomHeaderProps {
    title?: string;
    showBackButton?: boolean;
    rightComponent?: React.ReactNode;
    headerLeft?: React.ReactNode;
    headerRight?: React.ReactNode;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
                                                       title,
                                                       showBackButton = true,
                                                       rightComponent,
                                                       headerLeft,
                                                       headerRight
                                                   }) => {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <View style={[
            styles.container,
            {
                paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 8,
                paddingBottom: 12,
            }
        ]}>
            {/* Left Container */}
            <View style={styles.leftContainer}>
                {headerLeft ? headerLeft : (
                    showBackButton && navigation.canGoBack() && (
                        <TouchableOpacity
                            onPress={handleBack}
                            style={styles.backButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Icon name="chevron-left" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                    )
                )}
            </View>

            {/* Title Container */}
            <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {title || ''}
                </Text>
            </View>

            {/* Right Container */}
            <View style={styles.rightContainer}>
                {headerRight ? headerRight : rightComponent}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        paddingHorizontal: 16,
        width: '100%',
    },
    leftContainer: {
        width: 44,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    titleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightContainer: {
        width: 44,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    backButton: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.semiBold,
        color: colors.text.primary,
        textAlign: 'center',
    },
});

export default CustomHeader;