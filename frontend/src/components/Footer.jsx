import { Box, Container, Grid, Typography, Link, IconButton } from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  const sections = [
    {
      title: 'Quick Links',
      links: [
        { name: 'Home', path: '/' },
        { name: 'Products', path: '/products' },
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
      ],
    },
    {
      title: 'Customer Service',
      links: [
        { name: 'My Account', path: '/profile' },
        { name: 'My Orders', path: '/orders' },
        { name: 'Shipping Policy', path: '/shipping' },
        { name: 'Return Policy', path: '/returns' },
      ],
    },
    {
      title: 'Contact Us',
      content: [
        'QuickComm Grocery',
        '123 Shopping Street',
        'Retail City, RC 12345',
        'Phone: (123) 456-7890',
        'Email: support@quickcomm.com',
      ],
    },
  ];

  const socialLinks = [
    { icon: <Facebook />, url: 'https://facebook.com' },
    { icon: <Twitter />, url: 'https://twitter.com' },
    { icon: <Instagram />, url: 'https://instagram.com' },
    { icon: <LinkedIn />, url: 'https://linkedin.com' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {sections.map((section) => (
            <Grid item xs={12} sm={4} key={section.title}>
              <Typography variant="h6" gutterBottom>
                {section.title}
              </Typography>
              {section.links ? (
                <Box>
                  {section.links.map((link) => (
                    <Link
                      key={link.name}
                      component={RouterLink}
                      to={link.path}
                      color="inherit"
                      sx={{
                        display: 'block',
                        mb: 1,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      {link.name}
                    </Link>
                  ))}
                </Box>
              ) : (
                <Box>
                  {section.content.map((line) => (
                    <Typography key={line} variant="body2" sx={{ mb: 1 }}>
                      {line}
                    </Typography>
                  ))}
                </Box>
              )}
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: 4,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'primary.light',
            textAlign: 'center',
          }}
        >
          <Box sx={{ mb: 2 }}>
            {socialLinks.map((social, index) => (
              <IconButton
                key={index}
                component="a"
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'white', mx: 1 }}
              >
                {social.icon}
              </IconButton>
            ))}
          </Box>
          <Typography variant="body2">
            © {new Date().getFullYear()} QuickComm. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 