import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createDrawerNavigator } from '@react-navigation/drawer'
import { Ionicons } from '@expo/vector-icons'
import DashboardScreen from '../screens/partner/DashboardScreen'
import UploadOutfitScreen from '../screens/partner/UploadOutfitScreen'
import ManageOutfitsScreen from '../screens/partner/ManageOutfitsScreen'
import PartnerOrdersScreen from '../screens/partner/PartnerOrdersScreen'
import PartnerProfileScreen from '../screens/partner/PartnerProfileScreen'

const Stack = createNativeStackNavigator()
const Drawer = createDrawerNavigator()

const PartnerDrawer = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#E91E63',
        drawerInactiveTintColor: '#6C757D',
        drawerStyle: {
          backgroundColor: '#FFFFFF',
          width: 280,
        },
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Upload Outfit" 
        component={UploadOutfitScreen}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="add-circle-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Manage Outfits" 
        component={ManageOutfitsScreen}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="shirt-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Partner Orders" 
        component={PartnerOrdersScreen}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="list-outline" size={size} color={color} />
        }}
      />
      <Drawer.Screen 
        name="Partner Profile" 
        component={PartnerProfileScreen}
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />
        }}
      />
    </Drawer.Navigator>
  )
}

const PartnerNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PartnerDrawer" component={PartnerDrawer} />
    </Stack.Navigator>
  )
}

export default PartnerNavigator
