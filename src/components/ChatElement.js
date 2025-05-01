import { Avatar, Badge, Box, Stack, Typography } from '@mui/material';
import {useTheme , styled} from '@mui/material/styles';
import StyledBadge from './StyledBadge';

//single chat element
const ChatElement = ({id,name, img, msg, time,online, unread, onClick}) => {
    const theme = useTheme();
    return (
      <Box sx={{
        width: "100%",
        borderRadius: 1,
        backgroundColor: theme.palette.mode === 'light'? "#fff" : theme.palette.background.default
      }}
        p={2} onClick={onClick}>
        <Stack direction="row" alignItems='center' justifyContent='space-between'>
          <Stack direction='row' spacing={2}>
            {online ? <StyledBadge overlap='circular' anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              variant="dot">
            <Avatar src={img} />
            </StyledBadge> : <Avatar src={img} /> }
            
            <Stack spacing={0.3}>
              <Typography variant='subtitle2'>
                {name}
              </Typography>
              {
                msg && (
                  <Typography variant='caption'>
                    {msg}
                  </Typography>
                )
              }
            </Stack>
            </Stack>
            <Stack spacing={2} alignItems='center'>
              <Typography sx={{fontWeight:600}} variant='caption'>
                {time}
              </Typography>
              {
                unread > 0 && (
                  <Badge color='primary' badgeContent={unread}>

                  </Badge>
                )
              }
            </Stack>
          
          
        </Stack>
  
  
      </Box>
    )
  };

  export default ChatElement