import { Navigate, Outlet, useSearchParams } from "react-router-dom";
import { Stack } from '@mui/material';
import SideBar from "./SideBar";
import { useEffect, useState } from "react";
import { socket } from "../../utils/socket";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "../../redux/slices/chat";
import { jwtDecode } from "jwt-decode";
const DashboardLayout = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isConnected, setIsConnected] = useState(socket.connected);
  const dispatch = useDispatch();
  console.log("TOKEN from query params", token);

  useEffect(() => {
    function onConnect() {
      console.log("Socket connected")
      setIsConnected(true);
    }

    function onDisconnect() {
      console.log("Socket disconnected")
      setIsConnected(false);
    }

    socket.connect();

    if (token) {
      const decodedToken = jwtDecode(token);
      console.log("Setting current user", decodedToken);
      dispatch(setCurrentUser({
        id: decodedToken.id,
        firstName: decodedToken.firstName,
        lastName: decodedToken.lastName,
        email: decodedToken.email
      }));
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, [token, dispatch])

  return (
    <Stack direction='row'>
      <SideBar/>
      <Outlet />
    </Stack>
    
  );
};

export default DashboardLayout;
