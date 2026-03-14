import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PushNotification from 'react-native-push-notification';
import { useAuth } from './useAuth';

export interface Notification {
    id: string;
    type: 'LOW_STOCK' | 'DUE_REMINDER' | 'ORDER_STATUS' | 'PAYMENT' | 'SYSTEM';
    title: string;
    message: string;
    data?: any;
    read: boolean;
    createdAt: string;
}

const NOTIFICATIONS_STORAGE_KEY = '@notifications';

export const useNotifications = () => {
    const { isAuthenticated } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Load notifications from storage
    useEffect(() => {
        if (isAuthenticated) {
            loadNotifications();
        }
    }, [isAuthenticated]);

    // Configure push notifications
    useEffect(() => {
        PushNotification.configure({
            onRegister: function (token) {
                console.log('TOKEN:', token);
            },
            onNotification: function (notification) {
                console.log('NOTIFICATION:', notification);
                // Add to local notifications list
                addLocalNotification({
                    id: notification.id || Date.now().toString(),
                    type: notification.data?.type || 'SYSTEM',
                    title: notification.title || 'New Notification',
                    message: notification.message || '',
                    data: notification.data,
                    read: false,
                    createdAt: new Date().toISOString(),
                });
            },
            permissions: {
                alert: true,
                badge: true,
                sound: true,
            },
            popInitialNotification: true,
            requestPermissions: true,
        });

        // Create channel for Android
        PushNotification.createChannel(
            {
                channelId: 'retail-channel',
                channelName: 'Retail Management Notifications',
                channelDescription: 'Notifications for retail management app',
                playSound: true,
                soundName: 'default',
                importance: 4,
                vibrate: true,
            },
            (created) => console.log(`Channel created: ${created}`)
        );

        return () => {
            PushNotification.unregister();
        };
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                setNotifications(parsed);
                updateUnreadCount(parsed);
            }
        } catch (error) {
            console.error('Failed to load notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const saveNotifications = async (updatedNotifications: Notification[]) => {
        try {
            await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updatedNotifications));
            setNotifications(updatedNotifications);
            updateUnreadCount(updatedNotifications);
        } catch (error) {
            console.error('Failed to save notifications', error);
        }
    };

    const updateUnreadCount = (notifs: Notification[]) => {
        const count = notifs.filter(n => !n.read).length;
        setUnreadCount(count);

        // Update app icon badge
        PushNotification.setApplicationIconBadgeNumber(count);
    };

    const addLocalNotification = (notification: Notification) => {
        const updated = [notification, ...notifications];
        saveNotifications(updated);
    };

    const sendPushNotification = useCallback((
        title: string,
        message: string,
        data?: any,
        options?: {
            channelId?: string;
            playSound?: boolean;
            vibrate?: boolean;
        }
    ) => {
        PushNotification.localNotification({
            channelId: options?.channelId || 'retail-channel',
            title,
            message,
            data,
            playSound: options?.playSound ?? true,
            vibrate: options?.vibrate ?? true,
            priority: 'high',
            visibility: 'public',
        });
    }, []);

    const sendScheduledNotification = useCallback((
        title: string,
        message: string,
        date: Date,
        data?: any
    ) => {
        PushNotification.localNotificationSchedule({
            channelId: 'retail-channel',
            title,
            message,
            data,
            date,
            allowWhileIdle: true,
        });
    }, []);

    const markAsRead = useCallback(async (notificationId: string) => {
        const updated = notifications.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        );
        await saveNotifications(updated);
    }, [notifications]);

    const markAllAsRead = useCallback(async () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        await saveNotifications(updated);
    }, [notifications]);

    const deleteNotification = useCallback(async (notificationId: string) => {
        const updated = notifications.filter(n => n.id !== notificationId);
        await saveNotifications(updated);
    }, [notifications]);

    const clearAll = useCallback(async () => {
        await saveNotifications([]);
    }, []);

    // Helper methods for specific notification types
    const sendLowStockAlert = useCallback((
        productName: string,
        currentStock: number,
        productId: number
    ) => {
        const title = 'Low Stock Alert';
        const message = `${productName} has only ${currentStock} units left. Please reorder.`;

        sendPushNotification(title, message, { type: 'LOW_STOCK', productId });

        addLocalNotification({
            id: Date.now().toString(),
            type: 'LOW_STOCK',
            title,
            message,
            data: { productId },
            read: false,
            createdAt: new Date().toISOString(),
        });
    }, [sendPushNotification]);

    const sendDueReminder = useCallback((
        customerName: string,
        amount: number,
        dueDate: string,
        customerId: number
    ) => {
        const title = 'Payment Due Reminder';
        const message = `${customerName} has a payment of ${amount} due on ${dueDate}`;

        sendPushNotification(title, message, { type: 'DUE_REMINDER', customerId });

        addLocalNotification({
            id: Date.now().toString(),
            type: 'DUE_REMINDER',
            title,
            message,
            data: { customerId, amount, dueDate },
            read: false,
            createdAt: new Date().toISOString(),
        });
    }, [sendPushNotification]);

    const sendOrderStatusUpdate = useCallback((
        orderNumber: string,
        status: string,
        orderId: number
    ) => {
        const title = 'Order Status Update';
        const message = `Order ${orderNumber} is now ${status}`;

        sendPushNotification(title, message, { type: 'ORDER_STATUS', orderId, status });

        addLocalNotification({
            id: Date.now().toString(),
            type: 'ORDER_STATUS',
            title,
            message,
            data: { orderId, orderNumber, status },
            read: false,
            createdAt: new Date().toISOString(),
        });
    }, [sendPushNotification]);

    const sendPaymentConfirmation = useCallback((
        amount: number,
        invoiceNumber: string,
        saleId: number
    ) => {
        const title = 'Payment Received';
        const message = `Payment of ${amount} for invoice ${invoiceNumber} has been received`;

        sendPushNotification(title, message, { type: 'PAYMENT', saleId });

        addLocalNotification({
            id: Date.now().toString(),
            type: 'PAYMENT',
            title,
            message,
            data: { saleId, amount, invoiceNumber },
            read: false,
            createdAt: new Date().toISOString(),
        });
    }, [sendPushNotification]);

    return {
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        sendLowStockAlert,
        sendDueReminder,
        sendOrderStatusUpdate,
        sendPaymentConfirmation,
        sendPushNotification,
        sendScheduledNotification,
    };
};