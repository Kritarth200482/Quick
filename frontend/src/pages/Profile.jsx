import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Tab,
  Tabs,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import AddressForm from '../components/AddressForm';
import { updateProfile } from '../features/auth/authSlice';
import { toast } from 'react-toastify';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    address: user?.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (newAddress) => {
    setFormData((prev) => ({
      ...prev,
      address: newAddress,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      const userData = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      };

      if (formData.currentPassword && formData.newPassword) {
        userData.currentPassword = formData.currentPassword;
        userData.newPassword = formData.newPassword;
      }

      await dispatch(updateProfile(userData)).unwrap();
      toast.success('Profile updated successfully');

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const renderPersonalInfo = () => (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Avatar
            sx={{ width: 100, height: 100, fontSize: '3rem' }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </Avatar>
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            value={formData.email}
            disabled
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            loading={isLoading}
          >
            Update Profile
          </LoadingButton>
        </Grid>
      </Grid>
    </Box>
  );

  const renderAddress = () => (
    <Box component="form" onSubmit={handleSubmit}>
      <AddressForm
        address={formData.address}
        onChange={handleAddressChange}
      />
      <Box sx={{ mt: 3 }}>
        <LoadingButton
          type="submit"
          variant="contained"
          fullWidth
          loading={isLoading}
        >
          Update Address
        </LoadingButton>
      </Box>
    </Box>
  );

  const renderSecurity = () => (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Current Password"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </Grid>
        <Grid item xs={12}>
          <LoadingButton
            type="submit"
            variant="contained"
            fullWidth
            loading={isLoading}
            disabled={
              !formData.currentPassword ||
              !formData.newPassword ||
              !formData.confirmPassword
            }
          >
            Update Password
          </LoadingButton>
        </Grid>
      </Grid>
    </Box>
  );

  if (!user) {
    return null;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          My Profile
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
          >
            <Tab label="Personal Info" />
            <Tab label="Address" />
            <Tab label="Security" />
          </Tabs>
        </Box>
        {activeTab === 0 && renderPersonalInfo()}
        {activeTab === 1 && renderAddress()}
        {activeTab === 2 && renderSecurity()}
      </Paper>
    </Container>
  );
};

export default Profile; 