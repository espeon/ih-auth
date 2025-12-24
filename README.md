# at-auth

Authentication manager for AT Protocol applications.

## Usage

### Running Locally

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:3000`.

### Integration

To integrate authentication into your application, redirect users to the auth page:

```
https://your-domain.com/auth?redirect_uri=https://your-app.com/callback&nonce=YOUR_NONCE
```

**Query Parameters:**
- `redirect_uri` (required): URL to redirect to after successful authentication
- `nonce` (required): A nonce that will be returned 

### Authentication Flow

1. User visits your auth page with `redirect_uri` and `nonce` parameters
2. User enters their AT Protocol handle (e.g., `alice.bsky.social`) or PDS URL
3. The app enriches the handle to resolve the PDS URL
4. User is redirected to your `redirect_uri` with parameter `hint`
  - Hint will either be a PDS url, or a ATProto handle.

### Building

```bash
npm run build
```

### Testing

```bash
npm run test
```
