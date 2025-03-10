import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  LocalShipping as ShippingIcon,
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { getOrders } from '../features/order/orderSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

const orderSteps = ['Placed', 'Confirmed', 'Shipped', 'Delivered'];

const statusColors = {
  pending: 'warning',
  confirmed: 'info',
  shipped: 'primary',
  delivered: 'success',
  cancelled: 'error',
};

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders, isLoading } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(getOrders());

    // Initialize socket connection
    const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: user.token,
      },
    });

    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('orderStatusUpdate', (data) => {
      toast.info(`Order #${data.orderId} status updated to ${data.status}`);
      dispatch(getOrders());
    });

    newSocket.on('deliveryLocationUpdate', (data) => {
      toast.info(`Order #${data.orderId} delivery location updated`);
      dispatch(getOrders());
    });

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [dispatch, user, navigate]);

  const getStepIcon = (step) => {
    switch (step) {
      case 'Placed':
        return <ScheduleIcon />;
      case 'Confirmed':
        return <InventoryIcon />;
      case 'Shipped':
        return <ShippingIcon />;
      case 'Delivered':
        return <CheckCircleIcon />;
      default:
        return null;
    }
  };

  const getActiveStep = (status) => {
    return orderSteps.findIndex((step) => step.toLowerCase() === status.toLowerCase());
  };

  const filterOrders = (orders) => {
    switch (activeTab) {
      case 0: // All orders
        return orders;
      case 1: // Active orders
        return orders.filter(
          (order) => !['delivered', 'cancelled'].includes(order.status)
        );
      case 2: // Completed orders
        return orders.filter((order) => order.status === 'delivered');
      case 3: // Cancelled orders
        return orders.filter((order) => order.status === 'cancelled');
      default:
        return orders;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Orders
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="All Orders" />
          <Tab label="Active" />
          <Tab label="Completed" />
          <Tab label="Cancelled" />
        </Tabs>
      </Box>

      {filterOrders(orders).length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No orders found
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
            sx={{ mt: 2 }}
          >
            Start Shopping
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filterOrders(orders).map((order) => (
            <Grid item xs={12} key={order._id}>
              <Paper sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">
                    Order #{order._id.slice(-8).toUpperCase()}
                  </Typography>
                  <Chip
                    label={order.status.toUpperCase()}
                    color={statusColors[order.status]}
                  />
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Order Status
                      </Typography>
                      <Stepper
                        activeStep={getActiveStep(order.status)}
                        alternativeLabel
                      >
                        {orderSteps.map((label) => (
                          <Step key={label}>
                            <StepLabel
                              StepIconComponent={() => getStepIcon(label)}
                            >
                              {label}
                            </StepLabel>
                          </Step>
                        ))}
                      </Stepper>
                    </Box>

                    <Typography variant="subtitle2" color="text.secondary">
                      Order Timeline
                    </Typography>
                    <Timeline>
                      {order.timeline.map((event, index) => (
                        <TimelineItem key={index}>
                          <TimelineSeparator>
                            <TimelineDot color={statusColors[event.status]} />
                            {index < order.timeline.length - 1 && (
                              <TimelineConnector />
                            )}
                          </TimelineSeparator>
                          <TimelineContent>
                            <Typography variant="subtitle2">
                              {event.status.toUpperCase()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {new Date(event.timestamp).toLocaleString()}
                            </Typography>
                            {event.location && (
                              <Typography variant="body2">
                                Location: {event.location}
                              </Typography>
                            )}
                          </TimelineContent>
                        </TimelineItem>
                      ))}
                    </Timeline>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Order Summary
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {order.items.map((item) => (
                        <Box
                          key={item.product._id}
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            mb: 1,
                          }}
                        >
                          <Typography variant="body2">
                            {item.product.name} x {item.quantity}
                          </Typography>
                          <Typography variant="body2">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Box>
                      ))}
                      <Divider sx={{ my: 1 }} />
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mb: 1,
                        }}
                      >
                        <Typography variant="subtitle2">Total</Typography>
                        <Typography variant="subtitle2">
                          ${order.totalAmount.toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Shipping Address
                      </Typography>
                      <Typography variant="body2">
                        {order.shippingAddress.street}
                        <br />
                        {order.shippingAddress.city},{' '}
                        {order.shippingAddress.state}{' '}
                        {order.shippingAddress.zipCode}
                        <br />
                        {order.shippingAddress.country}
                      </Typography>
                    </Box>

                    {order.status !== 'cancelled' && (
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => navigate(`/orders/${order._id}`)}
                      >
                        View Details
                      </Button>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Orders; 