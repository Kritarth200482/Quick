import { Grid, TextField } from '@mui/material';

const AddressForm = ({ address, onChange, disabled = false }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({
      ...address,
      [name]: value,
    });
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          required
          fullWidth
          label="Street Address"
          name="street"
          value={address.street}
          onChange={handleChange}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="City"
          name="city"
          value={address.city}
          onChange={handleChange}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="State"
          name="state"
          value={address.state}
          onChange={handleChange}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="ZIP Code"
          name="zipCode"
          value={address.zipCode}
          onChange={handleChange}
          disabled={disabled}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          required
          fullWidth
          label="Country"
          name="country"
          value={address.country}
          onChange={handleChange}
          disabled={disabled}
        />
      </Grid>
    </Grid>
  );
};

export default AddressForm;