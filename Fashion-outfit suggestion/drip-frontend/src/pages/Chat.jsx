/**
 * @fileoverview Professional Chat Page - Enhanced messaging with replies, date separators, and modern UI
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Avatar from '../components/ui/Avatar'
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  Phone, 
  Video,
  Check,
  CheckCheck,
  ShoppingBag,
  Reply,
  X,
  Smile,
  Paperclip,
  MessageCircle
} from 'lucide-react'
import { getConversations, getMessages, sendMessage } from '../api/chat.api'
import { getPartnerPublicProfile } from '../api/partner.api'
import useAuthStore from '../stores/authStore'
import useNotificationStore from '../stores/notificationStore'
import { useSocket } from '../hooks/useSocket'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

// Format date for separators
const formatMessageDate = (date) => {
  const messageDate = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (messageDate.toDateString() === today.toDateString()) {
    return 'Today'
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  } else if (messageDate.getFullYear() === today.getFullYear()) {
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } else {
    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}

// Format time for messages
const formatMessageTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

// Group messages by date
const groupMessagesByDate = (messages) => {
  const groups = {}
  messages.forEach(msg => {
    const date = new Date(msg.createdAt).toDateString()
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
  })
  return Object.entries(groups).map(([date, msgs]) => ({
    date,
    messages: msgs,
    label: formatMessageDate(date)
  }))
}

const Chat = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user, partner, currentEntity } = useAuthStore()
  const { socket } = useSocket()
  const { resetChatUnread } = useNotificationStore()
  
  // Get current user/partner ID for message alignment (convert to string for reliable comparison)
  const currentUserId = String(currentEntity()?._id || currentEntity()?.id || '')
  const [message, setMessage] = useState('')
  const [typing, setTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const [selectedPartnerId, setSelectedPartnerId] = useState(null)
  
  // Reply functionality
  const [replyingTo, setReplyingTo] = useState(null)
  
  // Context menu for messages
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, messageId: null })
  
  // Track if user is near bottom (for auto-scroll)
  const [isNearBottom, setIsNearBottom] = useState(true)

  // Get partner from URL query param
  const partnerIdFromUrl = searchParams.get('partner')

  // Fetch conversations
  const { data: conversationsData, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations
  })

  const conversations = useMemo(() => conversationsData?.data?.data?.conversations || conversationsData?.data?.conversations || [], [conversationsData])

  // Set selected partner from URL or first conversation
  useEffect(() => {
    if (partnerIdFromUrl) {
      setSelectedPartnerId(partnerIdFromUrl)
    } else if (conversations.length > 0 && !selectedPartnerId) {
      setSelectedPartnerId(conversations[0].otherParty.id)
    }
  }, [partnerIdFromUrl, conversations, selectedPartnerId])

  // Get selected partner details from existing conversations
  const selectedConversation = conversations.find(c => c.otherParty.id === selectedPartnerId)
  const selectedOtherParty = selectedConversation?.otherParty

  // Fetch partner details if coming from partner page (no conversation yet)
  const { data: partnerProfileData, isLoading: partnerLoading } = useQuery({
    queryKey: ['partner-public', selectedPartnerId],
    queryFn: () => getPartnerPublicProfile(selectedPartnerId),
    enabled: !!selectedPartnerId && !selectedOtherParty // Only fetch if we have partnerId but no conversation
  })

  // Use partner profile data if no conversation exists
  const otherPartyFromProfile = partnerProfileData?.data?.data?.partner
  const displayOtherParty = selectedOtherParty || (otherPartyFromProfile ? {
    id: otherPartyFromProfile.id || selectedPartnerId,
    name: otherPartyFromProfile.brandName,
    avatar: otherPartyFromProfile.logo,
    model: 'FashionPartner'
  } : null)

  // Fetch messages for selected partner
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedPartnerId],
    queryFn: () => {
      const otherPartyModel = selectedOtherParty?.model || 'FashionPartner'
      return getMessages(selectedPartnerId, otherPartyModel)
    },
    enabled: !!selectedPartnerId
  })

  const messages = useMemo(() => messagesData?.data?.data?.messages || [], [messagesData])
  
  // Group messages by date for separators
  const groupedMessages = useMemo(() => groupMessagesByDate(messages), [messages])

  // Send message mutation with reply support
  const sendMessageMutation = useMutation({
    mutationFn: (text) => sendMessage(selectedPartnerId, { 
      text, 
      otherPartyModel: displayOtherParty?.model || 'FashionPartner',
      replyTo: replyingTo?._id || undefined
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedPartnerId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      setMessage('')
      setReplyingTo(null)
    }
  })

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return

    socket.on('new_message', (data) => {
      if (data.sender._id === selectedPartnerId) {
        queryClient.invalidateQueries({ queryKey: ['messages', selectedPartnerId] })
      }
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    })

    socket.on('messages_read', () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedPartnerId] })
    })

    return () => {
      socket.off('new_message')
      socket.off('messages_read')
    }
  }, [socket, selectedPartnerId, queryClient])

  // Scroll to bottom on new messages (only if user is near bottom)
  useEffect(() => {
    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isNearBottom])
  
  // Handle scroll to detect if user is near bottom
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container
      setIsNearBottom(scrollHeight - scrollTop - clientHeight < 100)
    }
  }, [])
  
  // Context menu handlers
  const handleMessageContextMenu = (e, msg) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      messageId: msg._id,
      message: msg
    })
  }
  
  const handleReply = () => {
    if (contextMenu.message) {
      setReplyingTo(contextMenu.message)
    }
    setContextMenu({ show: false, x: 0, y: 0, messageId: null, message: null })
  }
  
  const cancelReply = () => {
    setReplyingTo(null)
  }
  
  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ show: false, x: 0, y: 0, messageId: null, message: null })
    }
    if (contextMenu.show) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [contextMenu.show])

  // Typing indicator
  useEffect(() => {
    if (!socket || !selectedPartnerId) return
    
    const timeout = setTimeout(() => {
      if (message.length > 0) {
        socket.emit('typing', { receiverId: selectedPartnerId, receiverModel: 'FashionPartner' })
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [message, socket, selectedPartnerId])

  // Listen for partner typing
  useEffect(() => {
    if (!socket) return

    socket.on('partner_typing', ({ senderId }) => {
      if (senderId === selectedPartnerId) {
        setTyping(true)
        setTimeout(() => setTyping(false), 3000)
      }
    })

    return () => socket.off('partner_typing')
  }, [socket, selectedPartnerId])

  // Reset chat unread count when chat page is opened
  useEffect(() => {
    resetChatUnread()
  }, [resetChatUnread])

  const handleSend = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    sendMessageMutation.mutate(message)
  }

  const handleSelectConversation = (otherPartyId) => {
    setSelectedPartnerId(otherPartyId)
    searchParams.delete('partner')
    setSearchParams(searchParams)
  }

  if (conversationsLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
      {/* Left Panel - Conversations */}
      <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Messages</h2>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start chatting with a partner from their profile</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.otherParty.id}
                onClick={() => handleSelectConversation(conv.otherParty.id)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedPartnerId === conv.otherParty.id ? 'bg-gray-100 dark:bg-gray-700' : ''
                }`}
              >
                {/* Avatar */}
                <Avatar
                  src={conv.otherParty.avatar}
                  name={conv.otherParty.name}
                  size="md"
                />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {conv.otherParty.name}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {conv.lastMessage?.createdAt && (() => {
                        const diff = Date.now() - new Date(conv.lastMessage.createdAt).getTime()
                        const mins = Math.floor(diff / 60000)
                        const hours = Math.floor(mins / 60)
                        const days = Math.floor(hours / 24)
                        if (mins < 1) return 'just now'
                        if (mins < 60) return `${mins}m ago`
                        if (hours < 24) return `${hours}h ago`
                        return `${days}d ago`
                      })()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {conv.lastMessage?.isDeleted ? 'This message was deleted' : conv.lastMessage?.text || 'No messages'}
                  </p>
                </div>
                {conv.unreadCount > 0 && (
                  <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[1.5rem] text-center">
                    {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Messages */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
        {displayOtherParty ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar
                  src={displayOtherParty.avatar}
                  name={displayOtherParty.name}
                  size="sm"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{displayOtherParty.name}</h3>
                  {typing && <p className="text-sm text-green-500">typing...</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <Video className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                  <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={messagesContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-2"
            >
              {partnerLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Spinner />
                </div>
              ) : messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Spinner />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-purple-500" />
                  </div>
                  <p className="text-lg font-medium">Start a conversation with {displayOtherParty.name}</p>
                  <p className="text-sm mt-2 opacity-75">Send your first message below</p>
                </div>
              ) : (
                groupedMessages.map((group, groupIndex) => (
                  <div key={group.date} className="space-y-2">
                    {/* Date Separator */}
                    <div className="flex items-center justify-center my-4">
                      <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-4 py-1 rounded-full">
                        {group.label}
                      </div>
                    </div>
                    
                    {/* Messages for this date */}
                    {group.messages.map((msg, msgIndex) => {
                      // Check if message is from current user by comparing sender ID (convert to string for reliable comparison)
                      const senderId = String(msg.sender?._id || msg.sender?.id || '')
                      const isMe = senderId === currentUserId
                      const prevMsg = group.messages[msgIndex - 1]
                      const prevSenderId = prevMsg?.sender?._id || prevMsg?.sender?.id
                      const isFirstInGroup = msgIndex === 0 || prevSenderId !== senderId
                      
                      // Get sender name
                      const senderName = msg.sender?.name || msg.sender?.brandName || 'Unknown'
                      
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}
                          onContextMenu={(e) => handleMessageContextMenu(e, msg)}
                        >
                          <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar - only show for first message in group */}
                            {isFirstInGroup && (
                              <Avatar
                                src={isMe ? currentEntity()?.avatar : displayOtherParty?.avatar}
                                name={isMe ? (currentEntity()?.name || currentEntity()?.brandName || 'Me') : displayOtherParty?.name}
                                size="sm"
                              />
                            )}
                            {!isMe && !isFirstInGroup && <div className="w-8 flex-shrink-0" />}
                            
                            {/* Message Bubble */}
                            <div className="flex flex-col">
                              {/* Sender Name - only show for first message in group from other party */}
                              {!isMe && isFirstInGroup && (
                                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1 ml-1">
                                  {senderName}
                                </span>
                              )}
                              <div
                                className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${
                                  isMe
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                                }`}
                              >
                              {/* Reply Preview (if this message is a reply) */}
                              {msg.replyTo && msg.replySnapshot && (
                                <div className={`mb-2 pl-2 border-l-2 ${
                                  isMe ? 'border-white/40' : 'border-purple-400'
                                }`}>
                                  <p className={`text-xs font-medium ${isMe ? 'text-white/80' : 'text-purple-600 dark:text-purple-400'}`}>
                                    {msg.replySnapshot.senderName}
                                  </p>
                                  <p className={`text-xs truncate max-w-[200px] ${isMe ? 'text-white/60' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {msg.replySnapshot.text || 'Media'}
                                  </p>
                                </div>
                              )}
                              
                              {msg.isDeleted ? (
                                <p className="italic opacity-75 text-sm">This message was deleted</p>
                              ) : (
                                <>
                                  {/* Message Text */}
                                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                  
                                  {/* Outfit Share */}
                                  {msg.messageType === 'outfit_share' && (msg.outfitSnapshot) && (
                                    <div 
                                      className={`mt-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                        isMe 
                                          ? 'bg-white/20 hover:bg-white/30' 
                                          : 'bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500'
                                      }`}
                                      onClick={() => navigate(`/outfit/${msg.outfitRef}`)}
                                    >
                                      <div className="flex items-center gap-2">
                                        {msg.outfitSnapshot?.thumbnailUrl ? (
                                          <img
                                            src={msg.outfitSnapshot.thumbnailUrl}
                                            alt={msg.outfitSnapshot.title}
                                            className="w-10 h-10 rounded object-cover"
                                          />
                                        ) : (
                                          <ShoppingBag className={`w-10 h-10 p-2 rounded ${isMe ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-500'}`} />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-xs font-medium truncate ${isMe ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                                            {msg.outfitSnapshot?.title || 'Outfit'}
                                          </p>
                                          {msg.outfitSnapshot?.price > 0 && (
                                            <p className={`text-xs ${isMe ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                                              PKR {msg.outfitSnapshot.price.toLocaleString()}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </> 
                              )}
                              
                              {/* Time and Read Status */}
                              <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <span className={`text-[10px] ${isMe ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                                  {formatMessageTime(msg.createdAt)}
                                </span>
                                {isMe && (
                                  msg.readAt ? (
                                    <CheckCheck className="w-3 h-3 text-white/80" />
                                  ) : (
                                    <Check className="w-3 h-3 text-white/60" />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview */}
            {replyingTo && (
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Reply className="w-4 h-4 text-purple-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                      Replying to <span className="font-medium text-gray-900 dark:text-white">
                        {(replyingTo.sender?._id || replyingTo.sender?.id) === currentUserId ? 'yourself' : displayOtherParty?.name}
                      </span>
                    </span>
                  </div>
                  <button 
                    onClick={cancelReply}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 ml-6 truncate max-w-[80%]">
                  {replyingTo.text || 'Media message'}
                </p>
              </div>
            )}

            {/* Chat Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-white dark:bg-gray-800">
              <button 
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
                className="flex-1 bg-gray-100 dark:bg-gray-700 border-0 focus:ring-2 focus:ring-purple-500"
                disabled={sendMessageMutation.isPending}
              />
              <button 
                type="button"
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500"
              >
                <Smile className="w-5 h-5" />
              </button>
              <Button
                type="submit"
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600 px-4"
              >
                {sendMessageMutation.isPending ? (
                  <Spinner size="sm" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-10 h-10 text-purple-500" />
              </div>
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1 opacity-75">Choose a chat from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.show && (
        <div 
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[150px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleReply}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <Reply className="w-4 h-4" />
            Reply
          </button>
        </div>
      )}
    </div>
  )
}

export default Chat
