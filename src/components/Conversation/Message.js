import { Box, CircularProgress, Stack, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react';
import { Chat_History } from '../../data'
import { DocMsg, LinkMsg, MediaMsg, ReplyMsg, TextMsg, TimeLine } from './MsgTypes';
import { socket } from '../../utils/socket';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import { addMessage, setMessageUnreadCount } from '../../redux/slices/chat';

const Message = ({ menu }) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const dispatch = useDispatch();
  const selectedChannel = useSelector(state => state.chat?.selectedChannel || {});
  const messageList = useSelector(state => {
    if (!selectedChannel?.channelId || !state.chat?.channels?.[selectedChannel.channelId]?.messages) {
      return [];
    }
    const messages = Object.values(state.chat.channels[selectedChannel.channelId].messages);
    // Sort messages by sentOn in descending order (newest first)
    return messages.sort((a, b) => new Date(b.sentOn) - new Date(a.sentOn));
  });

  console.log("Message list", messageList);

  useEffect(() => {
    console.log("Selected channel changed:", selectedChannel);
    if (selectedChannel?.channelId) {
      socket.emit("message:list", { channelId: selectedChannel?.channelId, page: 1, size: 10 }, (response) => {
        console.log("Initial message list:", response.data.rows);
        dispatch(addMessage({
          channelId: selectedChannel?.channelId,
          message: response.data.rows
        }))

        if (response.data.rows.length > 0) {
          socket.emit("message:ack", { channelId: selectedChannel?.channelId }, (response) => {
            console.log("Message ack:", response);
            dispatch(setMessageUnreadCount({
              channelId: selectedChannel?.channelId,
              unreadCount: 0
            }))
          })
        }
      });
    }
  }, [selectedChannel])

  const loadMore = () => {
    setPage(page + 1);
    socket.emit("message:list", { channelId: selectedChannel?.channelId, page: page + 1, size: 10 }, (response) => {
      console.log("Loading more messages:", response.data.rows);
      if (response.data.rows.length === 0) {
        setHasMore(false);
      } else {
        dispatch(addMessage({
          channelId: selectedChannel?.channelId,
          message: response.data.rows
        }))
      }
    });
  }

  return (
    <Box p={3}
      id="scrollableDiv"
      style={{
        height: "100%",
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse',
      }}>
      <InfiniteScroll
        dataLength={messageList?.length || 0}
        next={loadMore}
        hasMore={hasMore}
        inverse={true}
        scrollableTarget="scrollableDiv"
        // loader={
        //   hasMore && (
        //     <Box textAlign="center" py={2}>
        //       <CircularProgress size={20} />
        //     </Box>
        //   )
        // }
      >
        <Stack spacing={3} direction='column-reverse'>
          {messageList?.length > 0 ? (
            messageList.map(el => {
              let attachments = el.attachments;
              if (attachments) {
                try {
                  attachments = JSON.parse(attachments); 
                } catch (error) {
                  console.log("Error parsing attachments", error);
                }
              }
              if (attachments?.length > 0) {
                return <DocMsg key={el.id} el={el} menu={menu} />
              } else {
                return <TextMsg key={el.id} el={el} menu={menu} />
              }
            })
          ) : (
            <Box textAlign="center" py={2}>
              <Typography variant="body2" color="text.secondary">
                Send a message to start the conversation
              </Typography>
            </Box>
          )}
        </Stack>
      </InfiniteScroll>
    </Box>
  )
}

export default Message