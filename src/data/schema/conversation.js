export const types = `
  type ConversationFacebookData {
    kind: String
    senderName: String
    senderId: String
    recipientId: String
    postId: String
    pageId: String
  }

  type ConversationMessageFacebookData {
    postId: String
    commentId: String
    parentId: String
    messageId: String
    item: String
    photoId: String
    videoId: String
    link: String
    reactionType: String
    senderId: String
    senderName: String
  }

  type TwitterData {
    id: Float
    id_str: String
    created_at: Date
    isDirectMessage: Boolean

    entities: JSON
    extended_entities: JSON
    extended_tweet: JSON

    sender_id: Float
    sender_id_str: String
    recipient_id: Float
    recipient_id_str: String

    in_reply_to_status_id: Float
    in_reply_to_status_id_str: String
    in_reply_to_user_id: Float
    in_reply_to_user_id_str: String
    in_reply_to_screen_name: String
    is_quote_status: Boolean
    favorited: Boolean
    retweeted: Boolean
    quote_count: Float
    reply_count: Float
    retweet_count: Float
    favorite_count: Float
  }

  type Conversation {
    _id: String!
    content: String
    integrationId: String
    customerId: String
    userId: String
    assignedUserId: String
    participatedUserIds: [String]
    readUserIds: [String]
    createdAt: Date
    updatedAt: Date
    status: String
    messageCount: Int
    number: Int
    tagIds: [String]
    twitterData: TwitterData
    facebookData: ConversationFacebookData

    messages: [ConversationMessage]
    tags: [Tag]
    customer: Customer
    integration: Integration
    user: User
    assignedUser: User
    participatedUsers: [User]
    participatorCount: Int
  }

  type EngageData {
    messageId: String
    brandId: String
    content: String
    fromUserId: String
    fromUser: User
    kind: String
    sentAs: String
  }

  type ConversationMessage {
    _id: String!
    content: String
    attachments: [JSON]
    mentionedUserIds: [String]
    conversationId: String
    internal: Boolean
    customerId: String
    userId: String
    createdAt: Date
    isCustomerRead: Boolean
    engageData: EngageData
    formWidgetData: JSON
    twitterData: TwitterData
    facebookData: ConversationMessageFacebookData

    user: User
    customer: Customer
  }

  type ConversationChangedResponse {
    conversationId: String!
    type: String!
  }

  type ConversationsChangedResponse {
    type: String!
    customerId: String!
  }

  input ConversationMessageParams {
    content: String,
    mentionedUserIds: [String],
    conversationId: String,
    internal: Boolean,
    customerId: String,
    userId: String,
    createdAt: Date,
    isCustomerRead: Boolean,
  }
`;

const filterParams = `
  limit: Int,
  channelId: String
  status: String
  unassigned: String
  brandId: String
  tag: String
  integrationType: String
  participating: String
  starred: String
  ids: [String]
  startDate: String
  endDate: String
`;

export const queries = `
  conversations(${filterParams}): [Conversation]

  conversationMessages(
    conversationId: String!
    skip: Int
    limit: Int
  ): [ConversationMessage]

  conversationCounts(${filterParams}): JSON
  conversationsTotalCount(${filterParams}): Int
  conversationDetail(_id: String!): Conversation
  conversationsGetLast(${filterParams}): Conversation
  conversationsTotalUnreadCount: Int
`;

export const mutations = `
  conversationMessageAdd(
    conversationId: String,
    content: String,
    mentionedUserIds: [String],
    internal: Boolean,
    attachments: [JSON],
    tweetReplyToId: String,
    tweetReplyToScreenName: String,
  ): ConversationMessage

  conversationsTweet(
    integrationId: String,
    text: String,
  ): JSON

  conversationsRetweet(
    integrationId: String,
    id: String,
  ): JSON

  conversationsFavorite(
    integrationId: String,
    id: String,
  ): JSON

  conversationsAssign(conversationIds: [String]!, assignedUserId: String): [Conversation]
  conversationsUnassign(_ids: [String]!): [Conversation]
  conversationsChangeStatus(_ids: [String]!, status: String!): [Conversation]
  conversationsStar(_ids: [String]!): User
  conversationsUnstar(_ids: [String]!): User
  conversationsToggleParticipate(_ids: [String]!): [Conversation]
  conversationMarkAsRead(_id: String): Conversation
  conversationSubscribeMessageCreated(_id: String!): String
  conversationSubscribeChanged(_ids: [String], type: String!): String
`;
