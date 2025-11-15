# PG Micro ISOMS API Documentation System

## Overview

Professional, enterprise-grade API documentation built with **EJS templating engine**. This system provides dynamic, interactive documentation for all backend endpoints with full testing capabilities.

## Structure

```
backend/
├── views/
│   ├── layouts/
│   │   └── main.ejs             
│   ├── partials/
│   │   ├── header.ejs            
│   │   ├── sidebar.ejs           
│   │   ├── styles.ejs            
│   │   └── scripts.ejs           
│   └── pages/
│       └── index.ejs             
├── config/
│   └── apiDocs.js                
└── server.js                     
```

## Features

### Dynamic Content
- **Auto-generated stats** - Endpoint counts calculated from config
- **Version from package.json** - Always up-to-date versioning
- **Environment badges** - Shows DEV/STAGING/PRODUCTION
- **Live server status** - Real-time connection indicator

### Interactive Testing
- **Built-in API tester** - Test endpoints without external tools
- **Authorization support** - JWT token input for protected routes
- **Request body editor** - Modify JSON payloads
- **Live response display** - Real-time results with status codes

### Professional Design
- **Enterprise aesthetics** - Clean, minimal, corporate design
- **Responsive layout** - Works on all screen sizes
- **Custom scrollbars** - Polished appearance
- **Smooth animations** - Professional transitions

### Developer Experience
- **Search functionality** - Quick endpoint filtering
- **Copy buttons** - One-click code/URL copying
- **Tabbed interface** - Organized information display
- **Syntax highlighting** - Beautiful code blocks

## Adding New Endpoints

Edit `backend/config/apiDocs.js`:

```javascript
{
  id: 'unique-endpoint-id',
  name: 'Endpoint Display Name',
  category: 'Category Name',
  method: 'GET|POST|PUT|DELETE',
  path: '/api/your/path',
  description: 'Detailed description...',
  requiresAuth: true|false,
  parameters: [
    {
      name: 'paramName',
      type: 'string|number|boolean|object',
      required: true|false,
      description: 'Parameter description'
    }
  ],
  headers: [
    {
      name: 'Authorization',
      value: 'Bearer TOKEN',
      required: true
    }
  ],
  requestBody: {
    // Example request body object
  },
  exampleResponse: {
    // Example response object
  }
}
```

The documentation **automatically updates** - no need to modify templates!

## Customization

### Changing Colors
Edit CSS variables in `views/layouts/main.ejs`:
```css
:root {
  --primary-500: #667eea; 
  --gray-900: #171717;     
  /* ... more variables */
}
```

### Adding New Sections
Create new partials in `views/partials/` and include them in layouts:
```ejs
<%- include('../partials/your-section') %>
```

### Modifying Layout
Edit `views/layouts/main.ejs` to change overall page structure.

## Statistics

Stats are automatically calculated from your endpoints:
- **Total Endpoints** - Active endpoints (excludes placeholders)
- **Auth Endpoints** - Authentication & Authorization category
- **System Endpoints** - System category

Add more stats in `config/apiDocs.js`:
```javascript
const stats = {
  totalEndpoints: activeEndpoints.length,
  customStat: endpoints.filter(ep => ep.category === 'Custom').length
};
```

## Configuration

### Environment Variables
```env
NODE_ENV=development|production
PORT=3002
```

### Server Setup
Server automatically:
- Reads version from `package.json`
- Enriches endpoints with full URLs
- Serves EJS templates
- Provides fallback routes

## Routes

- `GET /` - Home page with welcome screen
- `GET /docs/:endpointId` - Specific endpoint documentation
- `GET /api` - JSON API information
- `GET /api/health` - Health check endpoint

## Development

### Start Server
```bash
npm run dev  
npm start    
```

### Edit Documentation
1. Update `config/apiDocs.js`
2. Refresh browser
3. Changes appear immediately!

### Add New Template
1. Create `.ejs` file in `views/pages/` or `views/partials/`
2. Include in layout or render from route
3. Use EJS syntax: `<%= variable %>` or `<%- html %>`

## Best Practices

1. **Keep descriptions clear** - Write for developers
2. **Provide real examples** - Use actual response structures
3. **Mark auth requirements** - Set `requiresAuth: true`
4. **Categorize properly** - Organize endpoints logically
5. **Update regularly** - Keep docs in sync with code

## Production Deployment

1. Set `NODE_ENV=production`
2. Environment badge will disappear
3. Error messages become generic
4. Performance optimizations enabled

## EJS Syntax Reference

- `<%= expression %>` - Output escaped HTML
- `<%- expression %>` - Output raw HTML (for includes)
- `<% code %>` - Execute JavaScript code
- `<%# comment %>` - Comment (not rendered)

## Design Philosophy

- **Minimal** - No unnecessary elements
- **Professional** - Enterprise-ready aesthetics
- **Functional** - Everything works perfectly
- **Scalable** - Easy to extend and maintain

---

Built for PG Micro ISOMS | Enterprise Resource Planning System
