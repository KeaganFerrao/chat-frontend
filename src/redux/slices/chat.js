import { createSlice } from "@reduxjs/toolkit";

/**
 * channels: 
 *      {
 *          'channel-id-1': {
 *              channelId: 'channel-id-1',
 *              messages: {
 *                  'message-id-1': {
 *                      id: 'message-id-1',
 *                      content: 'message-content',
 *                      sentOn: '2021-01-01',
 *                      baseUser: {
 *                          id: 'user-id-1',
 *                      }
 *                  }
 *              },
 *              user: {},
 *              lastMessage: {},
 *              unreadMessageCount: 0
 *          },   
 *      }
 */
const initialChatState = {
    channels: {},
    selectedChannel: {},
    currentUser: {}
}

const chatSlice = createSlice({
    name: 'chat',
    initialState: initialChatState,
    reducers: {
        addMessage(state, action) {
            console.log("Adding message", action.payload);
            const channelId = action.payload.channelId;
            const messages = action.payload.message;
            const isSocketMessage = action.payload.isSocketMessage;

            if (!state.channels[channelId] && isSocketMessage) {
                state.channels[channelId] = {
                    messages: {},
                    user: {
                        id: messages[0].baseUser.id,
                        firstName: messages[0].baseUser.firstName,
                        lastName: messages[0].baseUser.lastName,
                        email: messages[0].baseUser.email,
                    },
                    lastMessage: {
                        id: messages[0].id,
                        content: messages[0].content,
                        sentOn: messages[0].sentOn,
                        attachments: messages[0].attachments,
                    },
                    unreadMessageCount: 0,
                    channelId: channelId
                }
            }

            messages.forEach(msg => {
                console.log("Processing message:", msg);
                // Add message to messages object
                state.channels[channelId].messages[msg.id] = msg;
                
                // Update lastMessage
                if (!state.channels[channelId].lastMessage || 
                    new Date(msg.sentOn) > new Date(state.channels[channelId].lastMessage.sentOn)) {
                    state.channels[channelId].lastMessage = msg;
                }

                if (isSocketMessage) {
                    console.log("Updating unread message count for channel:", channelId);
                    console.log("Current unread message count:", state.channels[channelId].unreadMessageCount);
                    state.channels[channelId].unreadMessageCount = (Number(state.channels[channelId].unreadMessageCount) ?? 0) + 1;
                    console.log("Updated unread message count:", state.channels[channelId].unreadMessageCount);
                }
            });

            console.log("State after adding message:", JSON.parse(JSON.stringify(state.channels[channelId])));
        },
        addChannel(state, action) {
            const channels = action.payload;
            channels.forEach(channel => {
                state.channels[channel.channelId] = {
                    messages: {},
                    user: channel.toUser,
                    lastMessage: channel.lastMessage,
                    unreadMessageCount: Number(channel.unreadMessageCount),
                    channelId: channel.channelId
                }
            });
        },
        selectChannel(state, action) {
            const channel = action.payload;
            state.selectedChannel = {
                channelId: channel.channelId,
                messages: channel.messages,
                user: channel.toUser,
                lastMessage: channel.lastMessage,
                unreadMessageCount: Number(channel.unreadMessageCount)
            };
        },
        setCurrentUser(state, action) {
            state.currentUser = action.payload;
        },
        setMessageUnreadCount(state, action) {
            const channelId = action.payload.channelId;
            const unreadCount = action.payload.unreadCount;
            state.channels[channelId].unreadMessageCount = unreadCount;
        },
        resetChannels(state) {
            state.channels = {};
        }
    }
});

export const { addMessage, addChannel, selectChannel, setCurrentUser, setMessageUnreadCount, resetChannels } = chatSlice.actions;

export default chatSlice.reducer;