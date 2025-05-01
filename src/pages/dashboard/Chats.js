import { Box, IconButton, Stack, Typography, InputBase, Button, Divider, Avatar, Badge, CircularProgress, Modal } from
  '@mui/material'
import { ArchiveBox, CircleDashed, MagnifyingGlass, Plus } from 'phosphor-react';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { faker } from '@faker-js/faker';
import { ChatList } from '../../data';
import { Search, SearchIconWrapper, StyledInputBase } from '../../components/Search';
import ChatElement from '../../components/ChatElement';
import { socket } from '../../utils/socket';
import { formatTimeShort, ucFirst } from '../../utils/utility';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import { selectChannel, addChannel, resetChannels } from '../../redux/slices/chat';

const Chats = () => {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [pageUsers, setPageUsers] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [search, setSearch] = useState('');
  const selectedChannel = useSelector(state => state.chat?.selectedChannel || {});
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const dispatch = useDispatch();
  const channels = useSelector(state => {
    if (!state.chat?.channels) {
      return [];
    }
    return Object.values(state.chat.channels);
  });

  console.log("channels values", channels);

  const loadMore = () => {
    setPage(page + 1);
    socket.emit("channel:list", { page: page + 1, size: 10, search: search }, (response) => {
      console.log("channel list", response.data.rows);
      if (response.data.rows.length === 0) {
        setHasMore(false);
      } else {
        dispatch(addChannel(response.data.rows));
      }
    });
  }

  const loadMoreUsers = () => {
    setPageUsers(pageUsers + 1);
    socket.emit("user:list", { page: pageUsers + 1, size: 10, search: search }, (response) => {
      console.log("user list", response.data.rows);
      if (response.data.rows.length === 0) {
        setHasMoreUsers(false);
      } else {
        setUsers(response.data.rows);
      }
    });
  } 

  useEffect(() => {
    socket.emit("channel:list", { page: 1, size: 10, search: search }, (response) => {
      console.log("channel list", response.data.rows);
        dispatch(resetChannels());
        dispatch(addChannel(response.data.rows || []));
    });
  }, [search])

  useEffect(() => {
    socket.emit("channel:list", { page: 1, size: 10 }, (response) => {
      console.log("channel list", response.data.rows);
      dispatch(addChannel(response.data.rows));
      if (response.data.rows?.length > 0) {
        console.log('selecting channel onload', response.data.rows[0]);
        dispatch(selectChannel(response.data.rows[0]));
      }
    });
  }, [])

  useEffect(() => {
    if (open) {
      socket.emit("user:list", {page: 1, size: 10}, (response) => {
        console.log("user list", response.data.rows);
        setUsers(response.data.rows);
      });
    }
  }, [open])


  // Only update the selected channel if its not already the selected channel 
  const onChatClick = (channel) => {
    // if (channel?.channelId !== selectedChannel?.channelId) {
      console.log("Dispatching channel", channel);
      dispatch(selectChannel({
        channelId: channel.channelId,
        messages: channel.messages,
        toUser: channel.user,
        lastMessage: channel.lastMessage,
        unreadMessageCount: Number(channel.unreadMessageCount)
      }));
    // }
  }

  const onUserClick = (user) => {
    console.log("User clicked", user);
    // emit user:reach with the user id
    socket.emit("user:reach", {userId: user.id}, (response) => {
      console.log("user:reach", response);
      if (response.success) {
        dispatch(addChannel([{
          channelId: response.data.channelId,
          messages: [],
          toUser: user,
          lastMessage: null,
          unreadMessageCount: 0
        }]));
        setOpen(false);
      }
    });
  }

  return (
    <Box sx={{
      position: "relative", width: 320,
      backgroundColor: theme.palette.mode === 'light' ? "#F8FAFF" : theme.palette.background.paper,
      boxShadow: '0px 0px 2px rgba(0,0,0,0.25)'
    }}>
      <Stack p={3} spacing={2} sx={{ height: "100vh" }}>
        <Stack direction="row" alignItems='center' justifyContent='space-between'>
          <Typography variant='h5'>
            Chats
          </Typography>
          <IconButton>
            <CircleDashed />
          </IconButton>
        </Stack>

        <Stack sx={{ width: "100%" }} direction='row-reverse' alignItems='center' spacing={2}>
         {/* Open a modal to add a new chat */}
         <Modal open={open} onClose={()=>setOpen(false)}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            height: 500,
            backgroundColor: 'white',
            padding: 2,
            borderRadius: 2
          }}>
            <Typography variant='h6'>Start a new chat</Typography>
            {/* Style the input to look like a search input */}
            <InputBase placeholder='Search...' sx={{
              width: '100%',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              padding: 1,
              margin: 1
            }} />
            <Stack className='scrollbar' spacing={2} direction='column' sx={{ flexGrow: 1, overflow: 'scroll', height: '100%' }}>
              <InfiniteScroll
                dataLength={users.length}
                next={loadMoreUsers}
                hasMore={hasMoreUsers}
                inverse={true}
                scrollableTarget="scrollableUsersList"
              >
                {/* Add proper spacing between the users in the list */}
                {users.map((user)=>{
                  return <Stack onClick={()=>onUserClick(user)} key={user.id} direction='row' alignItems='center' spacing={2}>
                  <Avatar src={user.avatar} />
                  <Typography variant='body1'>{ucFirst(user.firstName)} {ucFirst(user.lastName)}</Typography>
                </Stack>
                })}
              </InfiniteScroll>
            </Stack>
          </Box>
         </Modal>
          <IconButton onClick={()=>setOpen(true)}>
            <Plus />
          </IconButton>
          <Search>
            <SearchIconWrapper>
              <MagnifyingGlass color="#709CE6" />
            </SearchIconWrapper>
            <StyledInputBase value={search} onChange={(e)=>setSearch(e.target.value)} placeholder='Search...' inputProps={{ "aria-label": "search" }} />
          </Search>
        </Stack>

        {/* <Stack spacing={1}>
          <Stack direction='row' alignItems='center' spacing={1.5}>
            <ArchiveBox size={24} />
            <Button>
              Archive
            </Button>
          </Stack>
          <Divider />
        </Stack> */}

        <Stack className='scrollbar' spacing={2} direction='column' sx={{ flexGrow: 1, overflow: 'scroll', height: '100%' }}>

          {/* <Stack spacing={2.4}>
              <Typography variant='subtitle2' sx={{color:"#676767"}}>
                Pinned
              </Typography>
              {ChatList.filter((el)=> el.pinned).map((el)=>{
                return <ChatElement  {...el}/>
              })}
              
            </Stack> */}

          <Stack spacing={2.4}
            id="scrollableChatList"
            style={{
              height: "100%",
              overflow: 'auto',
              display: 'flex',
            }}>
            <Typography variant='subtitle2' sx={{ color: "#676767" }}>
              All Chats
            </Typography>
            <InfiniteScroll
              dataLength={channels.length}
              next={loadMore}
              hasMore={hasMore}
              inverse={true}
              scrollableTarget="scrollableChatList"
            >
              {channels.filter((el) => el?.channelId).map((el) => {
                return <ChatElement onClick={() => onChatClick(el)} id={el?.channelId} msg={el?.lastMessage?.content} name={ucFirst(el?.user?.firstName)} time={formatTimeShort(el?.lastMessage?.sentOn)} unread={el?.unreadMessageCount} />
              })}
              {/* {hasMore && (
                <Box textAlign="center">
                  <CircularProgress size={20} />
                </Box>
              )} */}
            </InfiniteScroll>

          </Stack>

        </Stack>
      </Stack>

    </Box>
  )
}

export default Chats