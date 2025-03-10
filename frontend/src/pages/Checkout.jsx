import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Divider,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import AddressForm from '../components/AddressForm';
import { getCart } from '../features/cart/cartSlice';
import { createOrder } from '../features/order/orderSlice';
import { toast } from 'react-toastify';

const steps = ['Shipping', 'Payment', 'Review'];

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { isLoading } = useSelector((state) => state.order);

  const [activeStep, setActiveStep] = useState(0);
  const [shippingAddress, setShippingAddress] = useState(user?.address || {
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(getCart());
  }, [dispatch, user, navigate]);

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handlePlaceOrder();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      const orderData = {
        items,
        shippingAddress,
        shippingMethod,
        paymentMethod,
        totalAmount: calculateTotal(),
      };
      
      const result = await dispatch(createOrder(orderData)).unwrap();
      navigate(`/orders/${result._id}`);
      toast.success('Order placed successfully!');
    } catch (error) {
      toast.error('Failed to place order');
    }
  };

  const calculateShipping = () => {
    return totalAmount >= 50 ? 0 : 5;
  };

  const calculateTotal = () => {
    return totalAmount + calculateShipping();
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0:
        return (
          shippingAddress.street &&
          shippingAddress.city &&
          shippingAddress.state &&
          shippingAddress.zipCode &&
          shippingAddress.country
        );
      case 1:
        if (paymentMethod === 'card') {
          return (
            cardDetails.number &&
            cardDetails.name &&
            cardDetails.expiry &&
            cardDetails.cvv
          );
        }
        return true;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Shipping Address
            </Typography>
            <AddressForm
              address={shippingAddress}
              onChange={setShippingAddress}
            />
            <Box sx={{ mt: 3 }}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Shipping Method</FormLabel>
                <RadioGroup
                  value={shippingMethod}
                  onChange={(e) => setShippingMethod(e.target.value)}
                >
                  <FormControlLabel
                    value="standard"
                    control={<Radio />}
                    label={`Standard Shipping (${
                      totalAmount >= 50 ? 'FREE' : '$5.00'
                    })`}
                  />
                  <FormControlLabel
                    value="express"
                    control={<Radio />}
                    label="Express Shipping ($15.00)"
                    disabled
                  />
                </RadioGroup>
              </FormControl>
            </Box>
          </>
        );
      case 1:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            <FormControl component="fieldset">
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="card"
                  control={<Radio />}
                  label="Credit/Debit Card"
                />
                <FormControlLabel
                  value="paypal"
                  control={<Radio />}
                  label="PayPal"
                  disabled
                />
              </RadioGroup>
            </FormControl>
            {paymentMethod === 'card' && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Card Number"
                    value={cardDetails.number}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, number: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    label="Cardholder Name"
                    value={cardDetails.name}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, name: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Expiry Date"
                    placeholder="MM/YY"
                    value={cardDetails.expiry}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, expiry: e.target.value })
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="CVV"
                    value={cardDetails.cvv}
                    onChange={(e) =>
                      setCardDetails({ ...cardDetails, cvv: e.target.value })
                    }
                  />
                </Grid>
              </Grid>
            )}
          </>
        );
      case 2:
        return (
          <>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Box sx={{ mb: 3 }}>
              {items.map((item) => (
                <Box
                  key={item.product._id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography>
                    {item.product.name} x {item.quantity}
                  </Typography>
                  <Typography>
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography>Subtotal</Typography>
                <Typography>${totalAmount.toFixed(2)}</Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography>Shipping</Typography>
                <Typography>
                  {calculateShipping() === 0 ? 'FREE' : `$${calculateShipping().toFixed(2)}`}
                </Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography variant="h6">Total</Typography>
                <Typography variant="h6">
                  ${calculateTotal().toFixed(2)}
                </Typography>
              </Box>
            </Box>
            <Typography variant="h6" gutterBottom>
              Shipping Details
            </Typography>
            <Typography gutterBottom>
              {shippingAddress.street}
              <br />
              {shippingAddress.city}, {shippingAddress.state}{' '}
              {shippingAddress.zipCode}
              <br />
              {shippingAddress.country}
            </Typography>
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Payment Details
            </Typography>
            <Typography>
              {paymentMethod === 'card'
                ? `Card ending in ${cardDetails.number.slice(-4)}`
                : 'PayPal'}
            </Typography>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Checkout
        </Typography>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStepContent()}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          {activeStep !== 0 && (
            <Button onClick={handleBack} sx={{ mr: 1 }}>
              Back
            </Button>
          )}
          <LoadingButton
            variant="contained"
            onClick={handleNext}
            loading={isLoading}
            disabled={!isStepValid()}
          >
            {activeStep === steps.length - 1 ? 'Place Order' : 'Next'}
          </LoadingButton>
        </Box>
      </Paper>
    </Container>
  );
};

export default Checkout; 