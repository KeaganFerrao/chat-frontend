import { Box, Fab, IconButton, InputAdornment, Stack, TextField, Tooltip, Typography, Chip } from '@mui/material';
import React, { useState } from 'react';
import { styled, useTheme } from "@mui/material/styles";
import { LinkSimple, PaperPlaneTilt, Smiley, Camera, File, Image, Sticker, User, X } from 'phosphor-react';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { socket } from '../../utils/socket';
import { useSelector, useDispatch } from 'react-redux';
import { addMessage } from '../../redux/slices/chat';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
const StyledInput = styled(TextField)(({ theme }) => ({
    "& .MuiInputBase-input": {
      paddingTop: '12px',
      paddingBottom: '12px',
    }  
  }));

  const Actions = [
    // {
    //     color:'#4da5fe',
    //     icon: <Image size={24}/>,
    //     y:102,
    //     title:'Photo/Video'
    // },
    // {
    //     color:'#1b8cfe',
    //     icon: <Sticker size={24}/>,
    //     y:172,
    //     title:'Stickers'
    // },
    // {
    //     color:'#0172e4',
    //     icon: <Camera size={24}/>,
    //     y:242,
    //     title:'Image'
    // },
    {
        color:'#0159b2',
        icon: <File size={24}/>,
        y:102,
        title:'Document'
    },
    // {
    //     color:'#013f7f',
    //     icon: <User size={24}/>,
    //     y:382,
    //     title:'Contact'
    // }
  ];

const ChatInput = ({setOpenPicker, text, setText, selectedFile, setSelectedFile}) =>{
    const [openAction, setOpenAction] = useState(false);

    const handleFileSelect = () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = (e) => {
            const file = e.target.files[0]; 
            setSelectedFile(file);
        }
        fileInput.click();
    }
    
    return (
        <Stack spacing={1}>
            {selectedFile && (
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Chip
                        label={selectedFile.name}
                        onDelete={() => setSelectedFile(null)}
                        deleteIcon={<X size={16} />}
                    />
                </Stack>
            )}
            <StyledInput 
                onChange={(e) => setText(e.target.value)} 
                value={text} 
                fullWidth 
                placeholder='Write a message...' 
                variant='filled' 
                InputProps={{
                    disableUnderline: true,
                    startAdornment: 
                    <Stack sx={{width:'max-content'}}>
                        <Stack sx={{position:'relative', display: openAction ? 'inline-block' : 'none'}}>
                            {Actions.map((el)=>(
                                <Tooltip placement='right' title={el.title}>
                                    <Fab sx={{position:'absolute', top: -el.y, backgroundColor: el.color}}>
                                        {el.icon}
                                    </Fab>
                                </Tooltip>
                            ))}
                        </Stack>
                        <InputAdornment>
                            <IconButton onClick={handleFileSelect}>
                                <LinkSimple/>
                            </IconButton>
                        </InputAdornment>
                    </Stack>
                    ,
                    endAdornment: <InputAdornment>
                    <IconButton onClick={()=>{
                        setOpenPicker((prev)=> !prev);
                    }}>
                        <Smiley/>
                    </IconButton>
                    </InputAdornment>
                }}
            />
        </Stack>
    )
}

const Footer = () => {
    const theme = useTheme();
    const [openPicker, setOpenPicker] = useState(false);
    const [text, setText] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const selectedChannel = useSelector(state => state.chat?.selectedChannel || {});
    const dispatch = useDispatch();
    const currentUser = useSelector(state => state.chat.currentUser);
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const onMessageSend = () => {
        if (!selectedChannel?.channelId || !selectedChannel?.user?.id) {
            console.error("No channel selected or invalid user data");
            return;
        }
        const channelId = selectedChannel.channelId;

        socket.emit("message:send", {
            channelId,
            content: text,
            attachments: selectedFile ? [selectedFile.name] : []
        }, (response) => {
            if (response.success) {
                const newMessage = {
                    baseUser: {
                        id: currentUser.id,
                        firstName: currentUser.firstName,
                        lastName: currentUser.lastName,
                        email: currentUser.email,
                    },
                    content: text,
                    attachments: JSON.stringify(response.data.attachments),
                    sentOn: new Date().toISOString(),
                    id: response.data.messageId
                };

                // Attachments will give ids using those ids we need to call uplaod attachment api
                if (selectedFile) {
                    const attachmentIds = response.data.attachments;
                    console.log("Attachment IDs:", attachmentIds.map(attachment => attachment.id));
                    const formData = new FormData();
                    
                    if (Array.isArray(selectedFile)) {
                        selectedFile.forEach(file => {
                            formData.append('attachments', file);
                        });
                    } else {
                        formData.append('attachments', selectedFile);
                    }
                    formData.append('ids', attachmentIds.map(attachment => attachment.id));
                    
                    axios.post("https://35.170.246.241/api/v1/upload-attachment", formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    .then(async response => await response.json())
                    .then(data => {
                        console.log("File uploaded successfully:", data);
                        setSelectedFile(null);
                    })
                    .catch(error => {
                        console.error("Error uploading file:", error);
                    });
                }
                
                console.log("Adding message after upload", newMessage)
                
                dispatch(addMessage({
                    channelId,
                    message: [newMessage]
                }));
                setText('');
                setSelectedFile(null);
            } else {
                console.error("Failed to send message:", response.error);
            }
        });
    }

    return (
        <Box p={2} sx={{ width:'100%', backgroundColor: theme.palette.mode === 'light' ? '#F8FAFF' :
         theme.palette.background.paper, boxShadow:'0px 0px 2px rgba(0,0,0,0.25)'}}>
        <Stack direction='row' alignItems={'center'} spacing={3}>
            <Stack sx={{width:'100%'}}> 
                <Box sx={{ display: openPicker ? 'inline' : 'none' , zIndex:10, position:'fixed',bottom:81, right:100}}>
                    <Picker theme={theme.palette.mode} data={data} onEmojiSelect={console.log}/>
                </Box> 
                <ChatInput 
                    text={text} 
                    setText={setText} 
                    setOpenPicker={setOpenPicker}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                />
            </Stack>
            
            <Box sx={{height:48, width: 48, backgroundColor:theme.palette.primary.main, 
            borderRadius: 1.5}}>
                <Stack sx={{height:'100%', width:'100%', alignItems:'center', justifyContent:'center'}}>
                    <IconButton onClick={onMessageSend}>
                        <PaperPlaneTilt color='#fff'/>
                    </IconButton>
                </Stack>
            </Box>
        </Stack>
    </Box>
    )
}

export default Footer