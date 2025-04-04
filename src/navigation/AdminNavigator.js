// navigation/AdminNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { COLORS } from '../constants/colors';
import { ROUTES, SCREEN_TITLES } from '../constants/navigation';

// 관리자 화면
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import SalesSimulationScreen from '../screens/admin/SalesSimulationScreen';

const AdminStack = createStackNavigator();

/**
 * 관리자 모드 네비게이션
 */
const AdminNavigator = () => {
  return (
    <AdminStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyle: { backgroundColor: '#f8f8f8' },
        headerBackTitleVisible: false,
        headerLeftContainerStyle: {
          paddingLeft: 16,
        },
        headerRightContainerStyle: {
          paddingRight: 16,
        },
      }}
    >
      <AdminStack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: SCREEN_TITLES[ROUTES.ADMIN_DASHBOARD],
          headerLeft: null,
        }}
      />
      <AdminStack.Screen
        name="SalesSimulation"
        component={SalesSimulationScreen}
        options={{
          title: SCREEN_TITLES[ROUTES.SALES_SIMULATION],
        }}
      />
    </AdminStack.Navigator>
  );
};

export default AdminNavigator;