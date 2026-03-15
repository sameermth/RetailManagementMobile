import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductsStackParamList } from './types';
import { colors } from '@theme/color';

// Import screens (we'll create these next)
import ProductListScreen from '@screens/products/ProductList';
import ProductDetailScreen from '@screens/products/ProductDetail';
import AddProductScreen from '@screens/products/AddProduct';
import EditProductScreen from '@screens/products/EditProduct';
import CategoriesScreen from '@screens/products/Categories';

const Stack = createNativeStackNavigator<ProductsStackParamList>();

const ProductsStack = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTitleStyle: {
                    fontSize: 18,
                    fontWeight: '600',
                    color: colors.text.primary,
                },
                headerTintColor: colors.primary[500],
                contentStyle: {
                    backgroundColor: colors.background,
                },
            }}
        >
            <Stack.Screen
                name="ProductList"
                component={ProductListScreen}
                options={{ title: 'Products' }}
            />
            <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={{ title: 'Product Details' }}
            />
            <Stack.Screen
                name="AddProduct"
                component={AddProductScreen}
                options={{ title: 'Add Product' }}
            />
            <Stack.Screen
                name="EditProduct"
                component={EditProductScreen}
                options={{ title: 'Edit Product' }}
            />
            <Stack.Screen
                name="Categories"
                component={CategoriesScreen}
                options={{ title: 'Categories' }}
            />
        </Stack.Navigator>
    );
};

export default ProductsStack;