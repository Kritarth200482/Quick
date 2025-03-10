import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Rating,
  Divider,
  IconButton,
  TextField,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { getProduct } from '../features/product/productSlice';
import { addToCart } from '../features/cart/cartSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { product, isLoading } = useSelector((state) => state.product);
  const { user } = useSelector((state) => state.auth);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    dispatch(getProduct(id));
  }, [dispatch, id]);

  const handleQuantityChange = (value) => {
    if (!product) return;
    const newQuantity = Math.max(1, Math.min(product.stock, value));
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      toast.success('Added to cart');
    } catch (error) {
      toast.error(error);
    }
  };

  if (isLoading || !product) {
    return <LoadingSpinner />;
  }

  return (
    <Container sx={{ py: 4 }}>
      <Grid container spacing={4}>
        {/* Product Images */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
            <img
              src={product.images?.[selectedImage] || product.image}
              alt={product.name}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '400px',
                objectFit: 'contain',
              }}
            />
          </Paper>
          {product.images && product.images.length > 1 && (
            <Grid container spacing={1}>
              {product.images.map((img, index) => (
                <Grid item key={index}>
                  <Paper
                    elevation={selectedImage === index ? 3 : 1}
                    sx={{
                      p: 0.5,
                      cursor: 'pointer',
                      border: selectedImage === index ? 2 : 0,
                      borderColor: 'primary.main',
                    }}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      style={{
                        width: '60px',
                        height: '60px',
                        objectFit: 'contain',
                      }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Product Info */}
        <Grid item xs={12} md={6}>
          <Box>
            <Typography variant="h4" gutterBottom>
              {product.name}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Rating value={product.rating || 4.5} precision={0.5} readOnly />
              <Typography variant="body2" sx={{ ml: 1 }}>
                ({product.numReviews || 0} reviews)
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                ${product.price.toFixed(2)}
              </Typography>
              {product.discount?.percentage > 0 && (
                <>
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ textDecoration: 'line-through' }}
                  >
                    $
                    {(
                      product.price /
                      (1 - product.discount.percentage / 100)
                    ).toFixed(2)}
                  </Typography>
                  <Chip
                    label={`${product.discount.percentage}% OFF`}
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </>
              )}
            </Box>

            <Typography variant="body1" sx={{ mb: 2 }}>
              {product.description}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography
                variant="body1"
                color={product.stock > 0 ? 'success.main' : 'error.main'}
                sx={{ fontWeight: 'bold' }}
              >
                {product.stock > 0
                  ? `${product.stock} ${product.unit}s in stock`
                  : 'Out of stock'}
              </Typography>
            </Box>

            {product.stock > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconButton
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    size="small"
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(Number(e.target.value))
                    }
                    inputProps={{
                      min: 1,
                      max: product.stock,
                      type: 'number',
                      style: { textAlign: 'center' },
                    }}
                    sx={{ width: 80, mx: 2 }}
                  />
                  <IconButton
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<CartIcon />}
                  onClick={handleAddToCart}
                  fullWidth
                >
                  Add to Cart
                </Button>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Additional Information */}
            <List>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ShippingIcon sx={{ mr: 1 }} />
                      <Typography variant="body1">Free Delivery</Typography>
                    </Box>
                  }
                  secondary="Orders over $50 qualify for free delivery"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SecurityIcon sx={{ mr: 1 }} />
                      <Typography variant="body1">Secure Payment</Typography>
                    </Box>
                  }
                  secondary="We ensure secure payment with PCI DSS standards"
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ mr: 1 }} />
                      <Typography variant="body1">Quality Guarantee</Typography>
                    </Box>
                  }
                  secondary="Not satisfied? Get a refund within 30 days"
                />
              </ListItem>
            </List>
          </Box>
        </Grid>

        {/* Reviews Section */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Customer Reviews
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {product.reviews?.length > 0 ? (
            product.reviews.map((review) => (
              <Paper key={review._id} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ mr: 2 }}>{review.name[0]}</Avatar>
                  <Box>
                    <Typography variant="subtitle1">{review.name}</Typography>
                    <Rating value={review.rating} size="small" readOnly />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 'auto' }}
                  >
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Typography variant="body1">{review.comment}</Typography>
              </Paper>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary">
              No reviews yet. Be the first to review this product!
            </Typography>
          )}
          {user && (
            <Button
              variant="outlined"
              onClick={() => navigate(`/products/${id}/review`)}
              sx={{ mt: 2 }}
            >
              Write a Review
            </Button>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductDetail; 