import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native'
import { colors, typography } from '../../theme'
import { formatCompact } from '../../utils/format'
import Toast from 'react-native-toast-message'
import { adminAPI } from '../../api/admin.api'

const AdminDashboardScreen = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPartners: 0,
    totalOutfits: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingPartners: 0,
    pendingOrders: 0,
  })

  const loadStats = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getPlatformAnalytics()
      if (response.data && response.data.data) {
        const analytics = response.data.data.analytics || response.data.data
        setStats({
          totalUsers: analytics.totalUsers || 0,
          totalPartners: analytics.totalPartners || 0,
          totalOutfits: analytics.totalOutfits || 0,
          totalOrders: analytics.totalOrders || 0,
          totalRevenue: analytics.totalRevenue || 0,
          pendingPartners: analytics.pendingPartners || 0,
          pendingOrders: analytics.pendingOrders || 0,
        })
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load stats',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{formatCompact(value)}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  )

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Platform Overview</Text>
      
      <View style={styles.statsGrid}>
        <StatCard title="Total Users" value={stats.totalUsers} icon="👤" color={colors.brand} />
        <StatCard title="Total Partners" value={stats.totalPartners} icon="🏪" color={colors.success} />
        <StatCard title="Total Outfits" value={stats.totalOutfits} icon="👗" color={colors.info} />
        <StatCard title="Total Orders" value={stats.totalOrders} icon="📦" color={colors.warning} />
      </View>

      <View style={styles.statsGrid}>
        <StatCard title="Total Revenue" value={stats.totalRevenue} icon="💰" color={colors.success} />
        <StatCard title="Pending Partners" value={stats.pendingPartners} icon="⏳" color={colors.warning} />
        <StatCard title="Pending Orders" value={stats.pendingOrders} icon="📋" color={colors.warning} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionTitle}>Manage Users</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>🏪</Text>
          <Text style={styles.actionTitle}>Manage Partners</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>👗</Text>
          <Text style={styles.actionTitle}>Moderate Content</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Text style={styles.actionIcon}>📊</Text>
          <Text style={styles.actionTitle}>View Analytics</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderUsers = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>User Management</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>User management module</Text>
        <Text style={styles.emptySubtext}>View, ban, and manage user accounts</Text>
      </View>
    </View>
  )

  const renderPartners = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Partner Management</Text>
      
      <View style={styles.alertCard}>
        <Text style={styles.alertTitle}>⚠️ Pending Approvals</Text>
        <Text style={styles.alertText}>{stats.pendingPartners} partners waiting for approval</Text>
        <TouchableOpacity style={styles.alertButton}>
          <Text style={styles.alertButtonText}>Review Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Partner list coming soon</Text>
      </View>
    </View>
  )

  const renderContent = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Content Moderation</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Content moderation tools</Text>
        <Text style={styles.emptySubtext}>Review and moderate outfits and comments</Text>
      </View>
    </View>
  )

  const renderOrders = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Order Management</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Order management tools</Text>
        <Text style={styles.emptySubtext}>View and manage all platform orders</Text>
      </View>
    </View>
  )

  const renderAnalytics = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Platform Analytics</Text>
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Analytics dashboard</Text>
        <Text style={styles.emptySubtext}>View detailed platform metrics and trends</Text>
      </View>
    </View>
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👤' },
    { id: 'partners', label: 'Partners', icon: '🏪' },
    { id: 'content', label: 'Content', icon: '👗' },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ]

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brand} />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <Text style={styles.headerSubtitle}>Platform Management</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text style={styles.tabIcon}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.contentScroll}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'partners' && renderPartners()}
        {activeTab === 'content' && renderContent()}
        {activeTab === 'orders' && renderOrders()}
        {activeTab === 'analytics' && renderAnalytics()}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  headerSubtitle: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  tabsScroll: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.brand,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.brand,
    fontWeight: '600',
  },
  contentScroll: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    ...typography.h2,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statTitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  actionTitle: {
    ...typography.body1,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
  actionArrow: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  alertCard: {
    backgroundColor: colors.warning + '20',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  alertTitle: {
    ...typography.body1,
    color: colors.warning,
    fontWeight: '600',
    marginBottom: 8,
  },
  alertText: {
    ...typography.body2,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  alertButton: {
    backgroundColor: colors.warning,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  alertButtonText: {
    ...typography.body2,
    color: colors.textInverse,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.h3,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    ...typography.body2,
    color: colors.textMuted,
    textAlign: 'center',
  },
})

export default AdminDashboardScreen
