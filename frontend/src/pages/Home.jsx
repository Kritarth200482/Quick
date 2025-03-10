import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  CardMedia,
  IconButton,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Security as SecurityIcon,
  ThumbUp as QualityIcon,
  Support as SupportIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { getProducts, getCategories } from '../features/product/productSlice';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { products, categories, isLoading } = useSelector(
    (state) => state.product
  );

  useEffect(() => {
    dispatch(getCategories());
    dispatch(getProducts({ limit: 6, sort: 'createdAt:desc' }));
  }, [dispatch]);

  const features = [
    {
      icon: <ShippingIcon sx={{ fontSize: 40 }} />,
      title: 'Free Delivery',
      description: 'Free shipping on orders over $50',
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40 }} />,
      title: 'Secure Payment',
      description: '100% secure payment',
    },
    {
      icon: <QualityIcon sx={{ fontSize: 40 }} />,
      title: 'Quality Products',
      description: 'Handpicked quality products',
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40 }} />,
      title: '24/7 Support',
      description: 'Dedicated support team',
    },
  ];

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      {/* Hero Section */}
      <Paper
        sx={{
          position: 'relative',
          backgroundColor: 'grey.800',
          color: '#fff',
          mb: 4,
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundImage: 'url(https://source.unsplash.com/random?grocery)',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,.5)',
          }}
        />
        <Container>
          <Grid container>
            <Grid item md={6}>
              <Box
                sx={{
                  position: 'relative',
                  p: { xs: 3, md: 6 },
                  pr: { md: 0 },
                }}
              >
                <Typography
                  component="h1"
                  variant="h3"
                  color="inherit"
                  gutterBottom
                >
                  Fresh Groceries Delivered to Your Door
                </Typography>
                <Typography variant="h5" color="inherit" paragraph>
                  Shop from our wide selection of fresh produce, pantry staples,
                  and household essentials.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/products')}
                >
                  Shop Now
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* Features Section */}
      <Container sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                {feature.icon}
                <Typography variant="h6" sx={{ mt: 2 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Categories Section */}
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4">Shop by Category</Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/products')}
          >
            View All
          </Button>
        </Box>
        <Grid container spacing={3}>
          {categories.slice(0, 6).map((category) => (
            <Grid item xs={6} sm={4} md={2} key={category}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                }}
                onClick={() =>
                  navigate(`/products?category=${encodeURIComponent(category)}`)
                }
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={`https://source.unsplash.com/random?${category}`}
                  alt={category}
                />
                <CardContent>
                  <Typography variant="h6" align="center">
                    {category}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Featured Products Section */}
      <Container sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
          <Typography variant="h4">Featured Products</Typography>
          <Button
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate('/products')}
          >
            View All
          </Button>
        </Box>
        <Grid container spacing={3}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product._id}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Promotional Banner */}
      <Container sx={{ py: 4 }}>
        <Paper
          sx={{
            p: 4,
            backgroundColor: 'primary.main',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" gutterBottom>
            Get 10% Off Your First Order
          </Typography>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Use code: WELCOME10 at checkout
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/products')}
          >
            Start Shopping
          </Button>
        </Paper>
      </Container>
    </Box>
  );
};

export default Home; 