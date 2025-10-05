# Database Schema Mapping - SISFOTJKT2

## Overview
This document maps all API routes to their corresponding database tables and provides a comprehensive overview of the database schema.

## Database Tables

### Core Tables

| Table | Description | Primary Key |
|-------|-------------|-------------|
| `users` | User accounts (students, teachers, admins) | `id` (UUID) |
| `faces` | Face recognition data for users | `id` (UUID) |
| `classes` | Class information and management | `id` (UUID) |
| `class_students` | Student-class enrollment relationships | `id` (UUID) |

### Academic Tables

| Table | Description | Primary Key |
|-------|-------------|-------------|
| `grades` | Student grades and assignments | `id` (UUID) |
| `exams` | Exam definitions and settings | `id` (UUID) |
| `questions` | Exam questions | `id` (UUID) |
| `answers` | Student responses to questions | `id` (UUID) |
| `exam_results` | Student exam results and scores | `id` (UUID) |

### Attendance Tables

| Table | Description | Primary Key |
|-------|-------------|-------------|
| `attendance` | Daily attendance records | `id` (UUID) |
| `attendance_settings` | Attendance time and rule settings | `id` (UUID) |
| `attendance_periods` | Attendance time periods | `id` (UUID) |
| `attendance_summary` | Daily attendance summaries | `id` (UUID) |
| `holidays` | Holiday and non-school days | `id` (UUID) |

### Communication Tables

| Table | Description | Primary Key |
|-------|-------------|-------------|
| `pengumuman` | Announcements and notices | `id` (UUID) |
| `notifications` | User notifications | `id` (UUID) |

### System Tables

| Table | Description | Primary Key |
|-------|-------------|-------------|
| `system_logs` | System activity and error logs | `id` (UUID) |

## API Routes to Database Mapping

### Authentication & Users

| API Route | Method | Table | Operation | Description |
|-----------|--------|-------|-----------|-------------|
| `/api/auth/login` | POST | `users` | SELECT | User authentication |
| `/api/users/list` | GET | `users` | SELECT | List users with filtering |

### Face Recognition

| API Route | Method | Table | Operation | Description |
|-----------|--------|-------|-----------|-------------|
| `/api/faces/register` | POST | `faces` | INSERT | Register face data |
| `/api/faces/recognize` | POST | `faces` | SELECT | Recognize faces |

### Attendance Management

| API Route | Method | Table | Operation | Description |
|-----------|--------|-------|-----------|-------------|
| `/api/attendance/list` | GET | `attendance` | SELECT | Get attendance records |
| `/api/attendance/mark` | POST | `attendance` | INSERT/UPDATE | Mark attendance |
| `/api/attendance/settings` | GET/PUT | `attendance_settings` | SELECT/UPDATE | Manage attendance settings |

### Academic Management

| API Route | Method | Table | Operation | Description |
|-----------|--------|-------|-----------|-------------|
| `/api/grades/list` | GET/POST | `grades` | SELECT/INSERT | Manage student grades |
| `/api/grades/[id]` | PUT/DELETE | `grades` | UPDATE/DELETE | Update/delete grades |
| `/api/exams/list` | GET | `exams` | SELECT | List exams |
| `/api/exams/create` | POST | `exams` | INSERT | Create new exam |
| `/api/exams/[id]` | GET/PUT | `exams` | SELECT/UPDATE | Get/update exam |

### Communication

| API Route | Method | Table | Operation | Description |
|-----------|--------|-------|-----------|-------------|
| `/api/announcements/list` | GET | `pengumuman` | SELECT | Get announcements |

### System

| API Route | Method | Table | Operation | Description |
|-----------|--------|-------|-----------|-------------|
| `/api/system/log` | GET/POST | `system_logs` | SELECT/INSERT | System logging |
| `/api/test-db` | GET | Multiple | SELECT | Database connectivity test |

## Table Relationships

### User Relationships
```
users (1) ──── (N) faces
users (1) ──── (N) attendance
users (1) ──── (N) grades (as student)
users (1) ──── (N) grades (as teacher)
users (1) ──── (N) exam_results
users (1) ──── (N) class_students (as student)
users (1) ──── (N) pengumuman (as author)
users (1) ──── (N) notifications
```

### Class Relationships
```
classes (1) ──── (N) class_students
classes (1) ──── (N) attendance_summary
```

### Exam Relationships
```
exams (1) ──── (N) questions
exams (1) ──── (N) exam_results
exams (1) ──── (N) answers
```

### Grade Relationships
```
users (teacher) (1) ──── (N) grades
users (student) (1) ──── (N) grades
```

## Data Flow Architecture

### Authentication Flow
1. User logs in via `/api/auth/login`
2. System validates credentials against `users` table
3. Returns user data with role-based permissions
4. Frontend stores user data in localStorage for session management

### Face Recognition Flow
1. User registers face via `/api/faces/register`
2. Face data stored in `faces` table linked to user
3. During attendance, `/api/faces/recognize` matches against stored faces
4. Attendance record created in `attendance` table

### Academic Management Flow
1. Teachers create grades via `/api/grades/list` (POST)
2. Grades stored in `grades` table with teacher-student relationship
3. Students can view their grades via the same endpoint with filtering
4. Teachers can update/delete grades via `/api/grades/[id]`

### Attendance Flow
1. Teachers mark attendance via `/api/attendance/mark`
2. Records stored in `attendance` table
3. System automatically updates `attendance_summary` for reporting
4. Students/teachers can view attendance via `/api/attendance/list`

## Security Implementation

### Row Level Security (RLS)
- All tables have RLS enabled
- Policies ensure users can only access appropriate data
- Role-based access control implemented

### Data Validation
- Database constraints ensure data integrity
- Foreign key relationships maintain referential integrity
- Check constraints validate data formats

### Audit Trail
- `system_logs` table tracks all important activities
- User actions are logged for security and compliance
- Automatic triggers capture data changes

## Performance Optimization

### Indexes Created
- Primary indexes on all ID fields
- Composite indexes for common query patterns
- Partial indexes for active records
- Foreign key indexes for relationship queries

### Query Optimization
- Views created for complex reporting queries
- Proper index usage for filtering and sorting
- Pagination support for large datasets

## Deployment Considerations

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup
1. Run the SQL schema in Supabase SQL Editor
2. Verify all tables are created
3. Check RLS policies are active
4. Test API endpoints

### Backup Strategy
- Supabase automatic backups enabled
- Point-in-time recovery available
- Schema versioning maintained

## Troubleshooting

### Common Issues

**API Connection Errors**
- Verify Supabase credentials in environment variables
- Check network connectivity
- Ensure database is accessible

**Permission Errors**
- Verify RLS policies are correctly configured
- Check user roles and permissions
- Ensure proper authentication

**Data Not Appearing**
- Check if data exists in correct tables
- Verify foreign key relationships
- Check for proper filtering in API calls

**Performance Issues**
- Verify indexes are created
- Check query execution plans
- Monitor database load

## Schema Version History

- **v2.0**: Complete schema with all features
- Added grades table for academic management
- Enhanced indexing for better performance
- Comprehensive RLS policies implemented

## Support

For technical support or questions about this schema:
- Check the API route implementations
- Review the database relationships
- Test with the provided test endpoints
