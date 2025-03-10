import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Rating,
  TextField,
  Button,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { getProduct } from '../features/product/productSlice';
import { createReview } from '../features/review/reviewSlice';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const ReviewForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { product, isLoading: productLoading } = useSelector(
    (state) => state.product
  );
  const { isLoading: reviewLoading } = useSelector((state) => state.review);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(getProduct(id));
  }, [dispatch, id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      await dispatch(
        createReview({
          productId: id,
          ...formData,
        })
      ).unwrap();
      toast.success('Review submitted successfully');
      navigate(`/products/${id}`);
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (productLoading || !product) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Write a Review
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            {product.name}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2,
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'contain',
              }}
            />
            <Typography variant="body1" color="text.secondary">
              {product.description}
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Typography component="legend" gutterBottom>
              Your Rating
            </Typography>
            <Rating
              name="rating"
              value={formData.rating}
              size="large"
              onChange={(event, newValue) => {
                setFormData((prev) => ({
                  ...prev,
                  rating: newValue,
                }));
              }}
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Your Review"
            value={formData.comment}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                comment: e.target.value,
              }))
            }
            sx={{ mb: 3 }}
          />

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(`/products/${id}`)}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={reviewLoading}
            >
              Submit Review
            </LoadingButton>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default ReviewForm; 