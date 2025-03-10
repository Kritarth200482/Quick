import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Box,
  TextField,
  MenuItem,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { getProducts, getCategories } from '../features/product/productSlice';
import ProductCard from '../components/ProductCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Products = () => {
  const dispatch = useDispatch();
  const { products, categories, isLoading } = useSelector(
    (state) => state.product
  );

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: [0, 1000],
    sort: 'createdAt:desc',
  });

  useEffect(() => {
    dispatch(getCategories());
  }, [dispatch]);

  useEffect(() => {
    const queryParams = {
      search: filters.search,
      category: filters.category,
      minPrice: filters.priceRange[0],
      maxPrice: filters.priceRange[1],
      sort: filters.sort,
    };
    dispatch(getProducts(queryParams));
  }, [dispatch, filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePriceChange = (event, newValue) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: newValue,
    }));
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container>
      <Grid container spacing={3}>
        {/* Filters */}
        <Grid item xs={12} md={3}>
          <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <TextField
              fullWidth
              label="Search"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                name="category"
                value={filters.category}
                label="Category"
                onChange={handleFilterChange}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mb: 2 }}>
              <Typography gutterBottom>Price Range</Typography>
              <Slider
                value={filters.priceRange}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">
                  ${filters.priceRange[0]}
                </Typography>
                <Typography variant="body2">
                  ${filters.priceRange[1]}
                </Typography>
              </Box>
            </Box>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                name="sort"
                value={filters.sort}
                label="Sort By"
                onChange={handleFilterChange}
              >
                <MenuItem value="createdAt:desc">Newest</MenuItem>
                <MenuItem value="price:asc">Price: Low to High</MenuItem>
                <MenuItem value="price:desc">Price: High to Low</MenuItem>
                <MenuItem value="name:asc">Name: A to Z</MenuItem>
                <MenuItem value="name:desc">Name: Z to A</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Grid>

        {/* Products Grid */}
        <Grid item xs={12} md={9}>
          <Grid container spacing={3}>
            {products.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="h6" textAlign="center">
                  No products found
                </Typography>
              </Grid>
            ) : (
              products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product._id}>
                  <ProductCard product={product} />
                </Grid>
              ))
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Products; 