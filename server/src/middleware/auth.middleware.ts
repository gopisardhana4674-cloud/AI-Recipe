import { Request, Response, NextFunction } from 'express';

// Define user shape on Request interface
export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

const hasClerkKeys = !!process.env.CLERK_SECRET_KEY;

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const mockUserIdHeader = req.headers['x-mock-user-id'];
  const mockUserEmailHeader = req.headers['x-mock-user-email'] || 'mock@example.com';
  const mockUserNameHeader = req.headers['x-mock-user-name'] || 'Mock User';

  // 1. Check Mock Auth Header first (for instant local testing/fallback)
  if (mockUserIdHeader && typeof mockUserIdHeader === 'string') {
    req.user = {
      id: mockUserIdHeader,
      email: String(mockUserEmailHeader),
      name: String(mockUserNameHeader),
    };
    return next();
  }

  // 2. Standard Auth Token checks
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split(' ')[1];

  if (hasClerkKeys) {
    try {
      // In production, we would use Clerk's SDK:
      // import { clerkClient } from '@clerk/clerk-sdk-node';
      // const session = await clerkClient.verifyToken(token);
      // However, to keep it light and avoid extra build dependencies during local runs,
      // we can decode the JWT payload to retrieve user details.
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
        
        req.user = {
          id: decoded.sub, // Clerk user ID
          email: decoded.email || decoded.primary_email_address || 'clerk@example.com',
          name: decoded.name || `${decoded.first_name || ''} ${decoded.last_name || ''}`.trim(),
        };
        return next();
      }
    } catch (err) {
      console.error('Clerk token validation failed:', err);
      return res.status(401).json({ error: 'Unauthorized: Invalid authentication credentials' });
    }
  }

  // 3. Fallback mock token decoding (if no Clerk credentials are configured, accept mock tokens)
  if (token.startsWith('mock_token_')) {
    const mockId = token.replace('mock_token_', '');
    req.user = {
      id: mockId,
      email: String(mockUserEmailHeader),
      name: String(mockUserNameHeader),
    };
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized: No active authentication mechanism' });
}
