import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Box,
  Rating,
  Chip,
  TextField,
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { addToCart } from '../features/cart/cartSlice';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (value) => {
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

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {product.discount?.percentage > 0 && (
        <Chip
          label={`${product.discount.percentage}% OFF`}
          color="error"
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1,
          }}
        />
      )}
      <CardMedia
        component="img"
        height="200"
        image={product.image}
        alt={product.name}
        sx={{ objectFit: 'contain', p: 2 }}
        onClick={() => navigate(`/products/${product._id}`)}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div">
          {product.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {product.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography
            variant="h6"
            color="primary"
            sx={{ fontWeight: 'bold', mr: 1 }}
          >
            ${product.price.toFixed(2)}
          </Typography>
          {product.discount?.percentage > 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textDecoration: 'line-through' }}
            >
              $
              {(
                product.price /
                (1 - product.discount.percentage / 100)
              ).toFixed(2)}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={4.5} precision={0.5} readOnly size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            (24 reviews)
          </Typography>
        </Box>
        <Typography
          variant="body2"
          color={product.stock > 0 ? 'success.main' : 'error.main'}
        >
          {product.stock > 0
            ? `${product.stock} ${product.unit}s in stock`
            : 'Out of stock'}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <IconButton
              size="small"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <RemoveIcon />
            </IconButton>
            <TextField
              size="small"
              value={quantity}
              onChange={(e) => handleQuantityChange(Number(e.target.value))}
              inputProps={{ min: 1, max: product.stock, type: 'number' }}
              sx={{ width: 60, mx: 1 }}
            />
            <IconButton
              size="small"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= product.stock}
            >
              <AddIcon />
            </IconButton>
          </Box>
          <Button
            variant="contained"
            startIcon={<CartIcon />}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            fullWidth
          >
            Add to Cart
          </Button>
        </Box>
      </CardActions>
    </Card>
  );
};

export default ProductCard; 