import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import FeedScreen from '../screens/user/FeedScreen'
import ExploreScreen from '../screens/user/ExploreScreen'
import ChatListScreen from '../screens/user/ChatListScreen'
import ProfileScreen from '../screens/user/ProfileScreen'
import OutfitDetailScreen from '../screens/user/OutfitDetailScreen'
import PartnerPublicScreen from '../screens/user/PartnerPublicScreen'
import CartScreen from '../screens/user/CartScreen'
import CheckoutScreen from '../screens/user/CheckoutScreen'
import OrderConfirmScreen from '../screens/user/OrderConfirmScreen'
import OrdersScreen from '../screens/user/OrdersScreen'
import OrderDetailScreen from '../screens/user/OrderDetailScreen'
import NotificationsScreen from '../screens/user/NotificationsScreen'
import ChatDetailScreen from '../screens/user/ChatDetailScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const UserTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName
          if (route.name === 'Feed') iconName = focused ? 'home' : 'home-outline'
          else if (route.name === 'Explore') iconName = focused ? 'search' : 'search-outline'
          else if (route.name === 'Chat') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline'
          else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline'
          return <Ionicons name={iconName} size={size} color={color} />
        },
        tabBarActiveTintColor: '#E91E63',
        tabBarInactiveTintColor: '#ADB5BD',
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
          paddingTop: 10,
          borderTopColor: '#E9ECEF',
        },
      })}
    >
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Explore" component={ExploreScreen} />
      <Tab.Screen 
        name="Chat" 
        component={ChatListScreen}
        options={{ tabBarBadge: 2 }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

const UserNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserTabs" component={UserTabs} />
      <Stack.Screen name="OutfitDetail" component={OutfitDetailScreen} />
      <Stack.Screen name="PartnerPublic" component={PartnerPublicScreen} />
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderConfirm" component={OrderConfirmScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </Stack.Navigator>
  )
}

export default UserNavigator
