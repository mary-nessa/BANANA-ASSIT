# Web Frontend Integration Guide for Banana Plantation Management (Next.js)

## Overview
This guide details how to integrate banana plantation management features into the existing Next.js application, complementing the variety identification and disease diagnosis features.

## Browser Storage Requirements

### Authentication (localStorage)
```javascript
{
    "token": "JWT_TOKEN",
    "userId": "USER_ID",
    "username": "USERNAME",
    "tokenExpiry": "TIMESTAMP"
}
```

### Session Storage
```javascript
{
    "currentPlanting": {
        "id": "PLANTING_ID",
        "plotIdentifier": "PLOT-001",
        "stage": "LAND_PREPARATION"
    }
}
```

## API Integration

### Authentication
```typescript
interface LoginRequest {
    username: string;
    password: string;
}

interface AuthResponse {
    token: string;
    userId: string;
    username: string;
}

// Login endpoint
POST /api/users/login
```

### Plantation Management API

#### Create Planting
```typescript
interface PlantingCreateRequest {
    plotIdentifier: string;
    plantingDate: string; // YYYY-MM-DD
    numberOfPlants: number;
    bananaVariety: string;
}

POST /api/plantings
```

#### Get Active Plantings
```typescript
GET /api/plantings/active
Headers: {
    Authorization: `Bearer ${token}`
}

interface PlantingResponse {
    id: string;
    plotIdentifier: string;
    plantingDate: string;
    expectedHarvestDate: string;
    currentStage: string;
    daysFromPlanting: number;
    numberOfPlants: number;
    bananaVariety: string;
    upcomingTasks: Task[];
    completedTasksCount: number;
    totalTasksCount: number;
    progressPercentage: number;
}
```

#### Task Management
```typescript
// Complete task
POST /api/tasks/{taskId}/complete
Headers: {
    Authorization: `Bearer ${token}`
}
```

## Component Architecture

### 1. Dashboard Layout
```jsx
<DashboardLayout>
    <Sidebar>
        <UserInfo />
        <NavigationMenu />
    </Sidebar>
    <MainContent>
        <PlantingsOverview />
        <TasksTimeline />
    </MainContent>
</DashboardLayout>
```

### 2. Planting Management Components
```jsx
// Planting Card
<PlantingCard>
    <StageIndicator />
    <ProgressBar />
    <TasksList />
    <ActionButtons />
</PlantingCard>

// Task Components
<TaskItem 
    task={task}
    onComplete={handleTaskComplete}
    priority={task.priority}
/>

// Stage Progress
<StageProgress
    currentStage={planting.currentStage}
    stages={STAGES}
    progress={planting.progressPercentage}
/>
```

## State Management (Redux)

### Store Structure
```typescript
interface RootState {
    auth: {
        token: string | null;
        user: User | null;
        isAuthenticated: boolean;
    };
    plantings: {
        list: Planting[];
        selected: Planting | null;
        loading: boolean;
        error: string | null;
    };
    tasks: {
        pending: Task[];
        completed: Task[];
        loading: boolean;
    };
}
```

### Actions & Thunks
```typescript
// Action Creators
const fetchPlantings = () => async (dispatch, getState) => {
    try {
        dispatch(setLoading(true));
        const response = await api.getPlantings();
        dispatch(setPlantings(response.data));
    } catch (error) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};
```

## UI Implementation Guide

### 1. Dashboard View
- Grid layout for multiple plantings
- Task summary sidebar
- Quick action buttons
- Stage progress indicators

### 2. Planting Details Page
- Comprehensive stage information
- Task management interface
- Progress tracking
- Historical data

### 3. Task Management Interface
```jsx
function TaskManager({ planting }) {
    return (
        <div className="task-manager">
            <TaskFilters />
            <TaskList>
                {tasks.map(task => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        onComplete={handleComplete}
                    />
                ))}
            </TaskList>
            <TaskSummary />
        </div>
    );
}
```

## UX Considerations

### 1. Loading States
- Skeleton loaders for data fetching
- Progressive loading for task lists
- Optimistic updates for task completion

### 2. Error Handling
- Toast notifications for errors
- Retry mechanisms for failed requests
- Offline indicators

### 3. Responsive Design
```css
/* Breakpoints */
@media (max-width: 768px) {
    .planting-grid {
        grid-template-columns: 1fr;
    }
}

@media (min-width: 769px) and (max-width: 1024px) {
    .planting-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
```

## Authentication Flow
1. User logs in
2. Store JWT in localStorage
3. Set up axios interceptor for token
4. Handle token expiration
5. Implement refresh token mechanism

## Security Implementation
```typescript
// Axios Interceptor
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Token Expiration Check
const isTokenExpired = () => {
    const expiry = localStorage.getItem('tokenExpiry');
    return expiry && Date.now() >= parseInt(expiry);
};
```

## Error Handling
```typescript
const errorHandler = (error: AxiosError) => {
    if (error.response?.status === 401) {
        // Handle unauthorized
        dispatch(logout());
        navigate('/login');
    }
    // Show error notification
    toast.error(error.message);
};
```

## Performance Optimization
1. Implement virtual scrolling for large lists
2. Use React.memo for pure components
3. Lazy load secondary features
4. Cache API responses

## Testing Strategy
- Unit tests for components
- Integration tests for API calls
- E2E tests for critical flows
- Performance testing

## Deployment Checklist
- [ ] Environment configuration
- [ ] API endpoint validation
- [ ] Error tracking setup
- [ ] Analytics integration
- [ ] Performance monitoring

# File Structure
```
src/
  app/
    dashboard/
      plantings/
        [id]/
          page.tsx         # Planting details page
          loading.tsx      # Loading UI
          error.tsx       # Error handling
        page.tsx          # Plantings list
    api/
      plantings/
        route.ts          # API routes
      tasks/
        route.ts
  components/
    plantings/
      PlantingCard.tsx
      StageProgress.tsx
      TaskList.tsx
  lib/
    api-client.ts        # API client with authentication
    store/              # State management
      slices/
        plantings.ts
        tasks.ts
```

## Integration with Existing Features

### 1. Variety ID & Disease Diagnosis Integration
```typescript
// pages/dashboard/plantings/[id].tsx
export default function PlantingDetailsPage() {
  return (
    <div>
      <PlantingDetails />
      {/* Quick access to diagnosis */}
      <QuickActionPanel>
        <DiagnosisButton 
          onDiagnosis={(result) => {
            // Log diagnosis for this planting
            createDiagnosisRecord(plantingId, result);
          }}
        />
        <VarietyCheckButton 
          onIdentify={(variety) => {
            // Update planting variety if needed
            updatePlantingVariety(plantingId, variety);
          }}
        />
      </QuickActionPanel>
    </div>
  );
}
```

### 2. Shared Components
```typescript
// components/shared/ImageUpload.tsx
export const ImageUpload = ({ 
  onUpload, 
  allowedTypes = ['disease', 'variety', 'growth']  // Extended for planting progress
}) => {
  // ...existing code...
};
```

## Next.js API Routes

```typescript
// app/api/plantings/route.ts
import { NextResponse } from 'next/server';
import { authMiddleware } from '@/lib/auth';

export async function GET(request: Request) {
  // Protect the route
  const auth = await authMiddleware(request);
  if (!auth.success) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const res = await fetch(`${process.env.API_URL}/api/plantings/active`, {
    headers: {
      'Authorization': `Bearer ${auth.token}`
    }
  });
  
  const data = await res.json();
  return NextResponse.json(data);
}
```

## Server Components vs. Client Components

### Server Components (Default)
```typescript
// app/dashboard/plantings/page.tsx
export default async function PlantingsPage() {
  const plantings = await fetchPlantings();  // Server-side fetch
  
  return (
    <div>
      <PlantingsList plantings={plantings} />
      <CreatePlantingButton />
    </div>
  );
}
```

### Client Components
```typescript
// components/plantings/TaskList.tsx
'use client';

export default function TaskList({ tasks }) {
  const [completedTasks, setCompletedTasks] = useState([]);
  
  async function handleTaskComplete(taskId) {
    // Optimistic update
    setCompletedTasks(prev => [...prev, taskId]);
    
    try {
      await completeTask(taskId);
    } catch (error) {
      // Revert optimistic update
      setCompletedTasks(prev => prev.filter(id => id !== taskId));
      toast.error('Failed to complete task');
    }
  }
  
  return (
    <div>
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          isCompleted={completedTasks.includes(task.id)}
          onComplete={handleTaskComplete}
        />
      ))}
    </div>
  );
}
```

## State Management with Redux Toolkit

```typescript
// lib/store/slices/plantings.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchPlantings = createAsyncThunk(
  'plantings/fetchPlantings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/plantings');
      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const plantingsSlice = createSlice({
  name: 'plantings',
  initialState,
  reducers: {
    // ...reducers
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlantings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPlantings.fulfilled, (state, action) => {
        state.plantings = action.payload;
        state.loading = false;
      });
  },
});

```

Tasks
Task management APIs for banana plantings



POST
/api/tasks/{taskId}/complete
Complete a task


Marks a planting task as completed. Only the task owner can complete their tasks.

Parameters
Try it out
Name	Description
taskId *
string
(path)
ID of the task to complete

taskId
Responses
Code	Description	Links
200	
Task marked as complete

Media type

*/*
Controls Accept header.
Example Value
Schema
{}
No links
403	
Not authorized to complete this task

Media type

*/*
Example Value
Schema
{}
No links
404	
Task not found

Media type

*/*
Example Value
Schema
{}
No links

GET
/api/tasks/upcoming
Get upcoming tasks


Retrieves all pending tasks for the authenticated user

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
List of pending tasks retrieved

Media type

*/*
Controls Accept header.
Example Value
Schema
[
  {
    "id": "string",
    "description": "string",
    "dueDate": "2025-05-08",
    "status": "PENDING",
    "priority": "HIGH",
    "category": "LAND_PREPARATION",
    "plantingId": "string",
    "plotIdentifier": "string"
  }
]
No links

GET
/api/tasks/today
Get today's tasks


Retrieves all tasks due today for the authenticated user

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
List of today's tasks retrieved

Media type

*/*
Controls Accept header.
Example Value
Schema
[
  {
    "id": "string",
    "description": "string",
    "dueDate": "2025-05-08",
    "status": "PENDING",
    "priority": "HIGH",
    "category": "LAND_PREPARATION",
    "plantingId": "string",
    "plotIdentifier": "string"
  }
]
No links

GET
/api/tasks/overdue
Get overdue tasks


Retrieves all overdue tasks for the authenticated user

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
List of overdue tasks retrieved

Media type

*/*
Controls Accept header.
Example Value
Schema
[
  {
    "id": "string",
    "description": "string",
    "dueDate": "2025-05-08",
    "status": "PENDING",
    "priority": "HIGH",
    "category": "LAND_PREPARATION",
    "plantingId": "string",
    "plotIdentifier": "string"
  }
]

Banana Planting
APIs for managing banana plantings and their lifecycle



POST
/api/plantings
Initialize new planting


Create a new banana planting with automated task generation

Parameters
Try it out
No parameters

Request body

application/json
Example Value
Schema
{
  "plotIdentifier": "string",
  "plantingDate": "2025-05-08",
  "numberOfPlants": 1073741824,
  "bananaVariety": "string"
}
Responses
Code	Description	Links
200	
OK

Media type

*/*
Controls Accept header.
Example Value
Schema
{
  "id": "string",
  "plotIdentifier": "string",
  "plantingDate": "2025-05-08",
  "expectedHarvestDate": "2025-05-08",
  "currentStage": "LAND_PREPARATION",
  "daysFromPlanting": 1073741824,
  "numberOfPlants": 1073741824,
  "bananaVariety": "string",
  "upcomingTasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "description": "Clear and prepare the land",
      "dueDate": "2025-05-15",
      "status": "PENDING",
      "priority": "HIGH",
      "category": "LAND_PREPARATION",
      "plantingId": "550e8400-e29b-41d4-a716-446655440000",
      "plotIdentifier": "PLOT-001"
    }
  ],
  "completedTasksCount": 1073741824,
  "totalTasksCount": 1073741824,
  "progressPercentage": 0.1
}
No links

GET
/api/plantings/{id}
Get planting details


Get detailed information about a specific planting

Parameters
Try it out
Name	Description
id *
string
(path)
id
Responses
Code	Description	Links
200	
OK

Media type

*/*
Controls Accept header.
Example Value
Schema
{
  "id": "string",
  "plotIdentifier": "string",
  "plantingDate": "2025-05-08",
  "expectedHarvestDate": "2025-05-08",
  "currentStage": "LAND_PREPARATION",
  "daysFromPlanting": 1073741824,
  "numberOfPlants": 1073741824,
  "bananaVariety": "string",
  "upcomingTasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "description": "Clear and prepare the land",
      "dueDate": "2025-05-15",
      "status": "PENDING",
      "priority": "HIGH",
      "category": "LAND_PREPARATION",
      "plantingId": "550e8400-e29b-41d4-a716-446655440000",
      "plotIdentifier": "PLOT-001"
    }
  ],
  "completedTasksCount": 1073741824,
  "totalTasksCount": 1073741824,
  "progressPercentage": 0.1
}
No links

GET
/api/plantings/{id}/tasks
Get planting tasks


Get all tasks for a specific planting

Parameters
Try it out
Name	Description
id *
string
(path)
id
Responses
Code	Description	Links
200	
OK

Media type

*/*
Controls Accept header.
Example Value
Schema
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "description": "Clear and prepare the land",
    "dueDate": "2025-05-15",
    "status": "PENDING",
    "priority": "HIGH",
    "category": "LAND_PREPARATION",
    "plantingId": "550e8400-e29b-41d4-a716-446655440000",
    "plotIdentifier": "PLOT-001"
  }
]
No links

GET
/api/plantings/{id}/progress
Get planting progress


Get progress details for a specific planting

Parameters
Try it out
Name	Description
id *
string
(path)
id
Responses
Code	Description	Links
200	
OK

Media type

*/*
Controls Accept header.
Example Value
Schema
{
  "id": "string",
  "plotIdentifier": "string",
  "plantingDate": "2025-05-08",
  "expectedHarvestDate": "2025-05-08",
  "currentStage": "LAND_PREPARATION",
  "daysFromPlanting": 1073741824,
  "numberOfPlants": 1073741824,
  "bananaVariety": "string",
  "upcomingTasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "description": "Clear and prepare the land",
      "dueDate": "2025-05-15",
      "status": "PENDING",
      "priority": "HIGH",
      "category": "LAND_PREPARATION",
      "plantingId": "550e8400-e29b-41d4-a716-446655440000",
      "plotIdentifier": "PLOT-001"
    }
  ],
  "completedTasksCount": 1073741824,
  "totalTasksCount": 1073741824,
  "progressPercentage": 0.1
}
No links

GET
/api/plantings/active
Get user's active plantings


Retrieve all active banana plantings for the authenticated user

Parameters
Try it out
No parameters

Responses
Code	Description	Links
200	
OK

Media type

*/*
Controls Accept header.
Example Value
Schema
[
  {
    "id": "string",
    "plotIdentifier": "string",
    "plantingDate": "2025-05-08",
    "expectedHarvestDate": "2025-05-08",
    "currentStage": "LAND_PREPARATION",
    "daysFromPlanting": 1073741824,
    "numberOfPlants": 1073741824,
    "bananaVariety": "string",
    "upcomingTasks": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "description": "Clear and prepare the land",
        "dueDate": "2025-05-15",
        "status": "PENDING",
        "priority": "HIGH",
        "category": "LAND_PREPARATION",
        "plantingId": "550e8400-e29b-41d4-a716-446655440000",
        "plotIdentifier": "PLOT-001"
      }
    ],
    "completedTasksCount": 1073741824,
    "totalTasksCount": 1073741824,
    "progressPercentage": 0.1
  }
]
