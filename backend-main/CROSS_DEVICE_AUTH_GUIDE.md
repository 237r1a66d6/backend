# Cross-Device Authentication Guide

## Understanding How Authentication Works

### ✅ What's CORRECT (You're doing this right!)

**User Registration Data IS in the Database:**
- When a user registers, their data (name, email, password, etc.) is saved to your database
- This database is accessible via Render and connected to your Hostinger MySQL/phpMyAdmin
- The user data persists across all devices

**localStorage is CORRECT for storing login tokens:**
- localStorage is **supposed to be device-specific**
- Each device gets its own authentication token
- This is a security feature, not a bug!

### 🔍 How Cross-Device Login Should Work

```
Device 1 (Phone):                    Database:                     Device 2 (Laptop):
─────────────────                    ─────────                     ──────────────────
1. User registers                    → Saves user data             
   email: user@example.com              in database
   password: pass123                    
                                     
2. Gets JWT token                    ← Database validates          
   Stores in localStorage               credentials
   
   
3. [User switches to Device 2]
                                                                   4. User logs in
                                                                      email: user@example.com  
                                                                      password: pass123
                                                                   
                                     ← Database validates          5. Gets NEW JWT token
                                        credentials                   Stores in localStorage
                                                                      (different from Device 1)

Both devices can now access the dashboard using their respective tokens!
```

## What I Just Fixed

### 1. Created User Authentication Middleware ✅
**File:** `middleware/userAuth.js`

This middleware:
- Verifies JWT tokens sent from the frontend
- Protects routes that require authentication
- Returns user information from the token

### 2. Protected User Routes ✅
**File:** `routes/users.js`

Added authentication to these routes:
- `GET /api/users/me` - Get current logged-in user (**NEW**)
- `POST /api/users/verify` - Verify token and get user data (**NEW**)
- `GET /api/users/profile/:id` - Get user profile (now protected)
- `PUT /api/users/profile/:id` - Update user profile (now protected)

### 3. Added Authorization Checks ✅
Users can only:
- View their own profile
- Update their own profile
- Access their own dashboard data

## Frontend Implementation Guide

### Step 1: Store Token After Login/Registration

```javascript
// After successful login or registration
async function login(email, password) {
    const response = await fetch('https://your-render-url.com/api/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Store token in localStorage - THIS IS CORRECT!
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = '/dashboard';
    } else {
        alert(data.message);
    }
}
```

### Step 2: Send Token with Every Authenticated Request

```javascript
// Helper function to get token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Example: Fetch user profile
async function getUserProfile() {
    const token = getAuthToken();
    
    if (!token) {
        window.location.href = '/login';
        return;
    }
    
    const response = await fetch('https://your-render-url.com/api/users/me', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    
    if (data.success) {
        return data.user;
    } else if (response.status === 401) {
        // Token expired or invalid - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
}
```

### Step 3: Verify Token on Page Load

```javascript
// Add this to your dashboard page
async function verifyAuth() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        // No token - redirect to login
        window.location.href = '/login';
        return null;
    }
    
    try {
        const response = await fetch('https://your-render-url.com/api/users/verify', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Token valid - update user data
            localStorage.setItem('user', JSON.stringify(data.user));
            return data.user;
        } else {
            // Token invalid - clear and redirect
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return null;
        }
    } catch (error) {
        console.error('Auth verification failed:', error);
        window.location.href = '/login';
        return null;
    }
}

// Call this when dashboard loads
window.addEventListener('DOMContentLoaded', async () => {
    const user = await verifyAuth();
    
    if (user) {
        // Display user dashboard
        displayDashboard(user);
    }
});
```

### Step 4: Update User Profile

```javascript
async function updateProfile(userId, updates) {
    const token = getAuthToken();
    
    const response = await fetch(`https://your-render-url.com/api/users/profile/${userId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
    });
    
    const data = await response.json();
    
    if (data.success) {
        // Update localStorage with new user data
        localStorage.setItem('user', JSON.stringify(data.user));
        return data.user;
    } else {
        throw new Error(data.message);
    }
}
```

### Step 5: Logout Function

```javascript
function logout() {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = '/login';
}
```

## New API Endpoints Available

### 1. Verify Token
**Endpoint:** `POST /api/users/verify`  
**Headers:** `Authorization: Bearer <token>`  
**Response:**
```json
{
    "success": true,
    "user": {
        "id": 1,
        "fullName": "John Doe",
        "email": "john@example.com",
        "phoneNumber": "1234567890",
        "qualification": "B.Ed",
        "progress": 0,
        "enrolledCourses": 0,
        "completedCourses": 0,
        "inProgressCourses": 0,
        "status": "active"
    }
}
```

### 2. Get Current User
**Endpoint:** `GET /api/users/me`  
**Headers:** `Authorization: Bearer <token>`  
**Response:** Same as verify

### 3. Get User Profile (Protected)
**Endpoint:** `GET /api/users/profile/:id`  
**Headers:** `Authorization: Bearer <token>`  
**Response:** User profile data

### 4. Update User Profile (Protected)
**Endpoint:** `PUT /api/users/profile/:id`  
**Headers:** `Authorization: Bearer <token>`  
**Body:**
```json
{
    "fullName": "Updated Name",
    "phoneNumber": "9876543210",
    "qualification": "M.Ed"
}
```

## Common Scenarios

### Scenario 1: User Registers on Phone
1. ✅ User data saved to database
2. ✅ JWT token generated and sent to phone
3. ✅ Phone stores token in localStorage
4. ✅ User can access dashboard on phone

### Scenario 2: User Logs In on Laptop
1. ✅ User enters email/password on laptop
2. ✅ Backend checks database (user exists!)
3. ✅ Backend generates NEW token for laptop
4. ✅ Laptop stores token in localStorage
5. ✅ User can access dashboard on laptop
6. ✅ Phone still works with its own token

### Scenario 3: Token Expires
1. ⚠️ User tries to access dashboard
2. ⚠️ Backend returns 401 Unauthorized
3. ✅ Frontend clears localStorage
4. ✅ Frontend redirects to login page
5. ✅ User logs in again and gets new token

## Testing Cross-Device Login

### Test 1: Register on One Device
```powershell
# Register a user
$registerBody = @{
    fullName = "Test User"
    phoneNumber = "1234567890"
    qualification = "B.Ed"
    email = "crossdevice@example.com"
    password = "SecurePass123"
} | ConvertTo-Json

$result = Invoke-RestMethod -Uri "https://your-render-url.com/api/users/register" `
    -Method POST -Body $registerBody -ContentType "application/json"

# Save the token (simulating localStorage)
$token1 = $result.token
Write-Host "Device 1 Token: $token1"
```

### Test 2: Login on Second Device
```powershell
# Login with same credentials (different device)
$loginBody = @{
    email = "crossdevice@example.com"
    password = "SecurePass123"
} | ConvertTo-Json

$result2 = Invoke-RestMethod -Uri "https://your-render-url.com/api/users/login" `
    -Method POST -Body $loginBody -ContentType "application/json"

# Save the token (simulating localStorage on device 2)
$token2 = $result2.token
Write-Host "Device 2 Token: $token2"
```

### Test 3: Both Devices Can Access Dashboard
```powershell
# Device 1 accesses dashboard
$headers1 = @{
    "Authorization" = "Bearer $token1"
    "Content-Type" = "application/json"
}
$user1 = Invoke-RestMethod -Uri "https://your-render-url.com/api/users/me" `
    -Method GET -Headers $headers1
Write-Host "Device 1 User: $($user1.user.fullName)"

# Device 2 accesses dashboard
$headers2 = @{
    "Authorization" = "Bearer $token2"
    "Content-Type" = "application/json"
}
$user2 = Invoke-RestMethod -Uri "https://your-render-url.com/api/users/me" `
    -Method GET -Headers $headers2
Write-Host "Device 2 User: $($user2.user.fullName)"
```

## Important Notes

### ✅ This is CORRECT Behavior:
- localStorage is device-specific (security feature)
- Each device has its own token
- User data is shared (in database)
- Users must login on each new device

### ❌ This is WRONG:
- Expecting same token to work across devices (security risk)
- Storing password in localStorage (never do this!)
- Sharing tokens between devices (security vulnerability)

### 🔐 Security Best Practices:
1. ✅ Tokens expire after 30 days (configurable)
2. ✅ Passwords are hashed in database
3. ✅ Tokens are verified on every protected request
4. ✅ Users can only access their own data
5. ✅ Invalid tokens redirect to login

## Summary

**Your system is working correctly!** 

The user data **IS** in the database and accessible from all devices. The token **SHOULD** be device-specific. When a user logs in on a new device:

1. They enter their email/password
2. Backend verifies against database
3. Backend sends a new token for that device
4. Device stores token in localStorage
5. Device uses token to access protected routes

This is standard JWT authentication and is the correct way to implement cross-device login! 🎉
