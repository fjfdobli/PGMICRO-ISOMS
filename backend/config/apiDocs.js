const endpoints = [
  {
    id: 'health',
    name: 'Health Check',
    category: 'System',
    method: 'GET',
    path: '/api/health',
    description: 'Verify server availability and operational status. Returns server timestamp and health status indicator. Use this endpoint for monitoring and uptime checks.',
    requiresAuth: false,
    parameters: [],
    headers: [],
    requestBody: null,
    exampleResponse: {
      status: 'Server is running!',
      timestamp: '2025-11-11T10:30:00.000Z'
    }
  },

  {
    id: 'bootstrap',
    name: 'Bootstrap Check',
    category: 'Authentication & Authorization',
    method: 'GET',
    path: '/api/auth/bootstrap-check',
    description: 'Determine if the system requires initial setup. Returns a flag indicating whether an administrative account exists. Critical for first-time system initialization.',
    requiresAuth: false,
    parameters: [],
    headers: [],
    requestBody: null,
    exampleResponse: {
      needsBootstrap: true,
      message: 'No admin account found. Please create initial admin account.'
    }
  },
  {
    id: 'register',
    name: 'Register User',
    category: 'Authentication & Authorization',
    method: 'POST',
    path: '/api/auth/register',
    description: 'Create a new user account in the system. The first registered user automatically receives administrative privileges. Subsequent users are assigned standard user roles.',
    requiresAuth: false,
    parameters: [
      {
        name: 'username',
        type: 'string',
        required: true,
        description: 'Unique username for the account (alphanumeric, min 3 characters)'
      },
      {
        name: 'email',
        type: 'string',
        required: true,
        description: 'Valid email address for account recovery and notifications'
      },
      {
        name: 'password',
        type: 'string',
        required: true,
        description: 'Strong password (minimum 6 characters, recommended 12+)'
      },
      {
        name: 'fullName',
        type: 'string',
        required: true,
        description: 'User\'s complete name for display and identification'
      }
    ],
    headers: [],
    requestBody: {
      username: 'admin',
      email: 'admin@pgmicro.com',
      password: 'admin123',
      fullName: 'System Administrator'
    },
    exampleResponse: {
      message: 'User registered successfully',
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@pgmicro.com',
        fullName: 'System Administrator',
        role: 'admin'
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  },
  {
    id: 'login',
    name: 'User Login',
    category: 'Authentication & Authorization',
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticate user credentials and establish a session. Returns a JWT token for authorization in subsequent API requests. Token should be included in the Authorization header as Bearer token.',
    requiresAuth: false,
    parameters: [
      {
        name: 'username',
        type: 'string',
        required: true,
        description: 'Username or email address associated with the account'
      },
      {
        name: 'password',
        type: 'string',
        required: true,
        description: 'Account password for authentication'
      }
    ],
    headers: [],
    requestBody: {
      username: 'admin',
      password: 'admin123'
    },
    exampleResponse: {
      message: 'Login successful',
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@pgmicro.com',
        fullName: 'System Administrator',
        role: 'admin'
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  },
  {
    id: 'me',
    name: 'Get Current User',
    category: 'Authentication & Authorization',
    method: 'GET',
    path: '/api/auth/me',
    description: 'Retrieve the authenticated user\'s profile information. Requires a valid JWT token in the Authorization header. Returns comprehensive user data including role and permissions.',
    requiresAuth: true,
    parameters: [],
    headers: [
      {
        name: 'Authorization',
        value: 'Bearer YOUR_TOKEN_HERE',
        required: true
      }
    ],
    requestBody: null,
    exampleResponse: {
      id: 1,
      username: 'admin',
      email: 'admin@pgmicro.com',
      fullName: 'System Administrator',
      role: 'admin',
      createdAt: '2025-11-11T10:00:00.000Z'
    }
  },
  {
    id: 'logout',
    name: 'Logout',
    category: 'Authentication & Authorization',
    method: 'POST',
    path: '/api/auth/logout',
    description: 'Terminate the current user session and invalidate the authentication token. Requires valid JWT token. Upon successful logout, client should remove stored token.',
    requiresAuth: true,
    parameters: [],
    headers: [
      {
        name: 'Authorization',
        value: 'Bearer YOUR_TOKEN_HERE',
        required: true
      }
    ],
    requestBody: null,
    exampleResponse: {
      message: 'Logout successful'
    }
  },

  {
    id: 'placeholder-customers',
    name: 'Customer Management',
    category: 'Customer Management',
    method: 'GET',
    path: '/api/customers',
    description: 'Coming soon...',
    requiresAuth: true,
    parameters: [],
    headers: [],
    requestBody: null,
    exampleResponse: {}
  },
  {
    id: 'placeholder-inventory',
    name: 'Inventory Management',
    category: 'Inventory Management',
    method: 'GET',
    path: '/api/inventory',
    description: 'Coming soon...',
    requiresAuth: true,
    parameters: [],
    headers: [],
    requestBody: null,
    exampleResponse: {}
  },
  {
    id: 'placeholder-suppliers',
    name: 'Supplier Management',
    category: 'Supplier Management',
    method: 'GET',
    path: '/api/suppliers',
    description: 'Coming soon...',
    requiresAuth: true,
    parameters: [],
    headers: [],
    requestBody: null,
    exampleResponse: {}
  },
  {
    id: 'placeholder-orders',
    name: 'Order Management',
    category: 'Order Management',
    method: 'GET',
    path: '/api/orders',
    description: 'Coming soon...',
    requiresAuth: true,
    parameters: [],
    headers: [],
    requestBody: null,
    exampleResponse: {}
  }
];

const activeEndpoints = endpoints.filter(ep => !ep.id.startsWith('placeholder-'));

const stats = {
  totalEndpoints: activeEndpoints.length,
  authEndpoints: activeEndpoints.filter(ep => ep.category === 'Authentication & Authorization').length,
  systemEndpoints: activeEndpoints.filter(ep => ep.category === 'System').length
};

module.exports = {
  endpoints,
  activeEndpoints,
  stats
};
