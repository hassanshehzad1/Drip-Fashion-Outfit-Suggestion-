import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { getMessages, sendMessage, deleteMessage } from '../../api/chat.api'
import useSocketStore from '../../stores/socket.store'
import { colors, typography } from '../../theme'
import { timeAgo } from '../../utils/format'
import Toast from 'react-native-toast-message'

const ChatDetailScreen = () => {
  const navigation = useNavigation()
  const route = useRoute()
  const { otherPartyId, otherPartyModel, partnerName } = route.params
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const flatListRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const { socket, isConnected } = useSocketStore()

  const loadMessages = async () => {
    setLoading(true)
    try {
      const response = await getMessages(otherPartyId, otherPartyModel)
      setMessages(response.data.data.messages || [])
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to load messages',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!text.trim()) return
    
    setSending(true)
    try {
      await sendMessage(otherPartyId, { text, otherPartyModel })
      setText('')
      await loadMessages()
      // Emit stop typing after sending
      socket?.emit('stop_typing', { otherPartyId, otherPartyModel })
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to send message',
      })
    } finally {
      setSending(false)
    }
  }

  const handleTextChange = (newText) => {
    setText(newText)
    
    // Emit typing event
    if (newText.trim() && isConnected) {
      socket?.emit('typing', { otherPartyId, otherPartyModel })
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      // Emit stop_typing after 2 seconds of no typing
      typingTimeoutRef.current = setTimeout(() => {
        socket?.emit('stop_typing', { otherPartyId, otherPartyModel })
      }, 2000)
    }
  }

  const handleDelete = async (messageId) => {
    try {
      await deleteMessage(messageId)
      setMessages(prev => prev.filter(m => m._id !== messageId))
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to delete message',
      })
    }
  }

  useEffect(() => {
    navigation.setOptions({
      title: partnerName || 'Chat',
    })
    loadMessages()

    // Socket event listeners
    if (socket && isConnected) {
      const unsubscribeNewMessage = socket.on('new_message', (data) => {
        if (data.conversationId === `${otherPartyId}-${otherPartyModel}`) {
          loadMessages()
        }
      })

      const unsubscribeTyping = socket.on('user_typing', (data) => {
        if (data.otherPartyId === otherPartyId) {
          setIsTyping(true)
        }
      })

      const unsubscribeStopTyping = socket.on('stop_typing', (data) => {
        if (data.otherPartyId === otherPartyId) {
          setIsTyping(false)
        }
      })

      const unsubscribeMessagesRead = socket.on('messages_read', (data) => {
        setMessages(prev => prev.map(msg => 
          msg._id === data.messageId ? { ...msg, read: true } : msg
        ))
      })

      socket.emit('join_conversation', {
        otherPartyId,
        otherPartyModel,
      })

      return () => {
        unsubscribeNewMessage?.()
        unsubscribeTyping?.()
        unsubscribeStopTyping?.()
        unsubscribeMessagesRead?.()
        socket.emit('leave_conversation', {
          otherPartyId,
          otherPartyModel,
        })
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    }
  }, [otherPartyId, otherPartyModel, socket, isConnected])

  const renderMessage = ({ item }) => {
    const isOwn = item.senderModel === 'User'
    
    return (
      <View style={[
        styles.messageRow,
        isOwn ? styles.messageRowOwn : styles.messageRowOther,
      ]}>
        {!isOwn && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {partnerName?.charAt(0) || '?'}
            </Text>
          </View>
        )}
        
        <TouchableOpacity
          style={[
            styles.messageBubble,
            isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
          ]}
          onLongPress={() => handleDelete(item._id)}
        >
          {item.isDeleted ? (
            <Text style={[
              styles.messageText,
              isOwn ? styles.messageTextOwn : styles.messageTextOther,
              styles.deletedText,
            ]}>
              This message was deleted
            </Text>
          ) : (
            <Text style={[
              styles.messageText,
              isOwn ? styles.messageTextOwn : styles.messageTextOther,
            ]}>
              {item.text}
            </Text>
          )}
          <View style={styles.messageFooter}>
            <Text style={[
              styles.messageTime,
              isOwn ? styles.messageTimeOwn : styles.messageTimeOther,
            ]}>
              {timeAgo(item.createdAt)}
            </Text>
            {isOwn && item.read && (
              <Text style={styles.readReceipt}>✓✓</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand} />
        </View>
      ) : (
        <>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages yet</Text>
                <Text style={styles.emptySubtext}>Start the conversation!</Text>
              </View>
            }
          />

          <View style={styles.inputContainer}>
            {isTyping && (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>typing...</Text>
              </View>
            )}
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              value={text}
              onChangeText={handleTextChange}
              multiline
              onBlur={() => {
                socket?.emit('stop_typing', { otherPartyId, otherPartyModel })
                setIsTyping(false)
              }}
            />
            <TouchableOpacity
              style={[styles.sendButton, sending && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!text.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.textInverse} />
              ) : (
                <Text style={styles.sendButtonText}>Send</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
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
  list: {
    padding: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  messageRowOwn: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brand,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 12,
    borderRadius: 16,
  },
  messageBubbleOwn: {
    backgroundColor: colors.brand,
    borderBottomRightRadius: 4,
  },
  messageBubbleOther: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...typography.body1,
    marginBottom: 4,
  },
  messageTextOwn: {
    color: colors.textInverse,
  },
  messageTextOther: {
    color: colors.textPrimary,
  },
  messageTime: {
    ...typography.caption,
  },
  messageTimeOwn: {
    color: 'rgba(255,255,255,0.7)',
  },
  messageTimeOther: {
    color: colors.textMuted,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  readReceipt: {
    ...typography.caption,
    color: colors.success,
    marginLeft: 4,
  },
  deletedText: {
    fontStyle: 'italic',
    opacity: 0.6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    ...typography.body1,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    ...typography.caption,
    color: colors.textMuted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  typingIndicator: {
    position: 'absolute',
    top: -30,
    left: 16,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typingText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 20,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.brand,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    ...typography.body2,
    color: colors.textInverse,
    fontWeight: '600',
  },
})

export default ChatDetailScreen
