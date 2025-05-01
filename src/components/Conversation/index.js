import {  Box, Stack} from '@mui/material';
import React, { useState } from 'react';
import { useTheme } from "@mui/material/styles";
import Header from './Header';
import Footer from './Footer';
import Message from './Message';
import { useSelector } from 'react-redux';

const Conversation = () => {
  const theme = useTheme();

  const selectedChannel = useSelector(state => state.chat?.selectedChannel || {});
  console.log("Selected channel in canvwr", selectedChannel);
  
  return (
    <Stack height={'100%'} maxHeight={'100vh'} width={'auto'}>

        {/* Chat header */}
        <Header firstName={selectedChannel?.user?.firstName} lastName={selectedChannel?.user?.lastName}/>
        {/* Msg */}
        <Box className='scrollbar' width={"100%"} sx={{flexGrow:1, height:'100%', overflowY:'scroll'}}>
        <Message menu={true}/>
        </Box>
        {/* Chat footer */}
       <Footer/>
    </Stack>
  )
}

export default Conversation