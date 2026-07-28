import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { getPartnerMe, updatePartnerProfile, changePartnerPassword } from '../../api/partner.api'
import { uploadAvatar } from '../../api/upload.api'
import { logoutPartner } from '../../api/partner.api'
import useAuthStore from '../../stores/auth.store'
import { colors, typography } from '../../theme'
import Toast from 'react-native-toast-message'

const PartnerProfileScreen = () => {
  const navigation = useNavigation()
  const { partner, logout } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    brandName: '',
    description: '',
    category: '',
    contactEmail: '',
    contactPhone: '',
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const loadProfile = async () => {
    try {
      const response = await getPartnerMe()
      const p = response.data.data.partner
      setFormData({
        brandName: p.brandName || '',
        description: p.description || '',
        category: p.category || '',
        contactEmail: p.contactEmail || '',
        contactPhone: p.contactPhone || '',
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load profile',
      })
    }
  }

  const handleAvatarPress = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled) {
        setLoading(true)
        const uploadResponse = await uploadAvatar(result.assets[0].uri)
        await updatePartnerProfile({ avatar: uploadResponse.data.data.url })
        await loadProfile()
        useAuthStore.getState().updatePartner(response.data.data.partner)
        Toast.show({
          type: 'success',
          text1: 'Avatar updated!',
        })
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update avatar',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      await updatePartnerProfile(formData)
      setEditMode(false)
      await loadProfile()
      Toast.show({
        type: 'success',
        text1: 'Profile updated!',
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to update profile',
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Passwords do not match',
      })
      return
    }

    setLoading(true)
    try {
      await changePartnerPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      Toast.show({
        type: 'success',
        text1: 'Password changed!',
      })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to change password',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logoutPartner()
              await logout()
            } catch (error) {
              console.error('Logout error:', error)
            }
          },
        },
      ]
    )
  }

  useEffect(() => {
    loadProfile()
  }, [])

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleAvatarPress} disabled={loading}>
          {partner?.avatar ? (
            <Image source={{ uri: partner.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarText}>{partner?.brandName?.charAt(0) || '?'}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.brandName}>{partner?.brandName}</Text>
          <Text style={styles.category}>{partner?.category}</Text>
          <Text style={styles.status}>
            {partner?.isApproved ? '✅ Approved' : '⏳ Pending Approval'}
          </Text>
        </View>

        <TouchableOpacity onPress={() => setEditMode(!editMode)}>
          <Text style={styles.editText}>{editMode ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        {editMode ? (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Brand Name</Text>
              <TextInput
                style={styles.input}
                value={formData.brandName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, brandName: text }))}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contact Email</Text>
              <TextInput
                style={styles.input}
                value={formData.contactEmail}
                onChangeText={(text) => setFormData(prev => ({ ...prev, contactEmail: text }))}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contact Phone</Text>
              <TextInput
                style={styles.input}
                value={formData.contactPhone}
                onChangeText={(text) => setFormData(prev => ({ ...prev, contactPhone: text }))}
                keyboardType="phone-pad"
              />
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Brand Name</Text>
              <Text style={styles.infoValue}>{partner?.brandName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Category</Text>
              <Text style={styles.infoValue}>{partner?.category}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{partner?.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contact Email</Text>
              <Text style={styles.infoValue}>{partner?.contactEmail || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Contact Phone</Text>
              <Text style={styles.infoValue}>{partner?.contactPhone || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Description</Text>
              <Text style={[styles.infoValue, styles.descriptionValue]}>
                {partner?.description || 'No description'}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Current Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter current password"
            value={passwordData.currentPassword}
            onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            value={passwordData.newPassword}
            onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            value={passwordData.confirmPassword}
            onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handlePasswordChange}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>Change Password</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  avatarPlaceholder: {
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.h2,
    color: colors.textInverse,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  brandName: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  category: {
    ...typography.body2,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  status: {
    ...typography.caption,
    color: colors.success,
  },
  editText: {
    ...typography.body2,
    color: colors.brand,
    fontWeight: '600',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    ...typography.body2,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body2,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  descriptionValue: {
    flex: 1,
    textAlign: 'right',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    ...typography.body2,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: colors.brand,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: colors.danger,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    ...typography.button,
    color: colors.textInverse,
    fontWeight: '600',
  },
})

export default PartnerProfileScreen
