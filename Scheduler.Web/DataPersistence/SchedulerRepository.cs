using Scheduler.Web.Models;
using System.Collections.Concurrent;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

namespace Scheduler.Web.DataPersistence
{
    public class SchedulerRepository
    {
        private readonly SchedulerContext _context;

        public SchedulerRepository(SchedulerContext context)
        {
            _context = context;
        }

        public async Task<List<EventLog>> UpsertInstructorsAsync(IEnumerable<Instructor> instructors)
        {
            var eventLogs = new List<EventLog>();
            foreach (var instructor in instructors)
            {
                var existingInstructor = await _context.Instructors
                    .FirstOrDefaultAsync(i => i.Name == instructor.Name);

                if (existingInstructor == null)
                {
                    _context.Instructors.Add(instructor);
                    eventLogs.Add(new EventLog
                    {
                        Action = "ADD",
                        Name = instructor.Name,
                        Target = "INSTRUCTOR",
                        Detail = JsonSerializer.Serialize(new { department = instructor.Department, courseMin = instructor.CourseMin, courseMax = instructor.CourseMax })
                    });
                }
                else
                {
                    _context.Entry(existingInstructor).CurrentValues.SetValues(instructor);
                    eventLogs.Add(new EventLog
                    {
                        Action = "EDIT",
                        Name = instructor.Name,
                        Target = "INSTRUCTOR",
                        Detail = JsonSerializer.Serialize(new { department = instructor.Department, courseMin = instructor.CourseMin, courseMax = instructor.CourseMax })
                    });
                }
            }
            await _context.SaveChangesAsync();

            return eventLogs;
        }

        public async Task<(List<Room>, List<EventLog>)> UpsertRoomsAsync(List<Models.Room> rooms)
        {
            var insertedRooms = new List<Room>();
            var eventLogs = new List<EventLog>();
            foreach (var room in rooms)
            {
                var existingRoom = await _context.Rooms
                    .Include(r => r.PreferredDepartmentRooms)
                    .FirstOrDefaultAsync(r => r.Name == room.Name);

                if (existingRoom == null)
                {
                    var roomToInsert = new Room
                    {
                        Name = room.Name,
                        StudentCapacity = room.StudentCapacity,
                        PreferredDepartmentRooms = room.PermittedDepartments.Select(d =>
                            new PreferredDepartmentRoom
                            {
                                Department = d,
                            }
                        ).ToList()
                    };
                    eventLogs.Add(new EventLog
                    {
                        Action = "ADD",
                        Target = "ROOM",
                        Name = room.Name,
                        Detail = JsonSerializer.Serialize(new
                        {
                            capacity = room.StudentCapacity,
                            preferredDepartments = room.PermittedDepartments,
                        })
                    });
                    _context.Rooms.Add(roomToInsert);
                    insertedRooms.Add(roomToInsert);
                }
                else
                {
                    await UpdatePreferredDepartments(existingRoom, room.PermittedDepartments.Select(d => new PreferredDepartmentRoom
                    {
                        Department = d,
                        Room = existingRoom,
                        RoomId = existingRoom.Id,
                    }));
                    eventLogs.Add(new EventLog
                    {
                        Action = "EDIT",
                        Target = "ROOM",
                        Name = room.Name,
                        Detail = JsonSerializer.Serialize(new
                        {
                            capacity = room.StudentCapacity,
                            preferredDepartments = room.PermittedDepartments,
                        })
                    });
                    insertedRooms.Add(existingRoom);
                }
            }

            await _context.SaveChangesAsync();

            foreach (var room in insertedRooms)
            {
                await UpsertPreferredDepartmentsAsync(room.Id, room.PreferredDepartmentRooms);
            }

            return (insertedRooms, eventLogs);
        }

        public async Task<ConcurrentDictionary<int, int>> InsertExpressionsAsync(IEnumerable<Models.Expression> expressions)
        {
            var expressionIndexToExpressionId = new ConcurrentDictionary<int, int>();

            foreach (var (expression, i) in expressions.Select((expression, i) => (expression, i)))
            {
                var newExpression = new Expression
                {
                    ExpressionTimeslots = new List<ExpressionTimeslot>(),
                };

                _context.Expressions.Add(newExpression);
                await _context.SaveChangesAsync();

                expressionIndexToExpressionId.TryAdd(i + 1, newExpression.ExpressionId);

                var timeslotsToInsert = expression.Slots.SelectMany(s => s.TimeSlots.Select(t => new Timeslot
                {
                    Start = t.Start.ToString(),
                    End = t.End.ToString(),
                    Day = s.Day.ToString(),
                    ExpressionTimeslots = new List<ExpressionTimeslot>(),
                })).ToList();

                var expressionTimeSlots = new List<ExpressionTimeslot>();
                foreach (var t in timeslotsToInsert)
                {
                    var expressionTimeSlot = new ExpressionTimeslot
                    {
                        Expression = newExpression,
                        Timeslot = t,
                    };
                    expressionTimeSlots.Add(expressionTimeSlot);
                    t.ExpressionTimeslots.Add(expressionTimeSlot);
                    newExpression.ExpressionTimeslots.Add(expressionTimeSlot);
                }
                _context.Timeslots.AddRange(timeslotsToInsert);
                _context.ExpressionTimeslots.AddRange(expressionTimeSlots);

                await _context.SaveChangesAsync();
            }

            return expressionIndexToExpressionId;
        }

        public async Task InsertCompletedScheduleRunAsync(bool success, string errorMessage)
        {
            var query = $@"
                INSERT INTO schdl.eventLogs (action, target, detail)
                VALUES
                (@action, @target, @detail)";
            var successStr = success ? "true" : "false";
            var messageStr = success ? "" : $"\"error\": {errorMessage}";

            var parameters = new SqlParameter[]
            {
                new SqlParameter("@action", "RUN"),
                new SqlParameter("@target", "SCHEDULE CREATION"),
                new SqlParameter("@detail", $"{{ \"success\": \"{successStr}\" {messageStr}}}")
            };

            await _context.Database.ExecuteSqlRawAsync(query, parameters);
        }

        public async Task InsertUserLoginAsync(string userName, bool loginSuccessful, bool isLogout)
        {
            var query = $@"
                INSERT INTO schdl.eventLogs (action, target, detail)
                VALUES
                (@action, @target, @detail)";
            var action = isLogout ? "LOGOUT" : "LOGIN";
            var target = userName;
            var success = isLogout || loginSuccessful ? "true" : "false";
            var details = $"{{ \"success\": {success} }}";

            var parameters = new SqlParameter[]
            {
                new SqlParameter("@action", action),
                new SqlParameter("@target", target),
                new SqlParameter("@detail", details)
            };
            await _context.Database.ExecuteSqlRawAsync(query, parameters);
        }

        public async Task<List<LoginEvent>> GetSignedInUsersAsync()
        {
            var query = $@"
                WITH RecentLoginEvents AS (
                    SELECT
                        target AS username,
                        MAX(timestamp) AS lastLogin
                    FROM schdl.eventLogs
                    WHERE action = 'LOGIN'
                        AND timestamp >= DATEADD(MINUTE, -30, GETDATE())
                    GROUP BY target
                ),
                RecentLogoutEvents AS (
                    SELECT
                        target AS username,
                        MAX(timestamp) AS lastLogout
                    FROM schdl.eventLogs
                    WHERE action = 'LOGOUT'
                        AND timestamp >= DATEADD(MINUTE, -30, GETDATE())
                    GROUP BY target
                )
                SELECT
                    rle.username,
                    rle.lastLogin
                FROM RecentLoginEvents rle
                LEFT JOIN RecentLogoutEvents rlo
                    ON rle.username = rlo.username
                    AND rlo.lastLogout > rle.lastLogin
                WHERE rlo.username IS NULL;";

            return await _context.Database.SqlQueryRaw<LoginEvent>(query).ToListAsync();
        }

        public async Task<List<EventLog>> InsertCoursesAsync(List<Models.Course> courses, ConcurrentDictionary<int, int> expressionIndexToExpressionId)
        {
            var eventLogs = new List<EventLog>();
            foreach (var c in courses)
            {
                var course = new Course
                {
                    Name = c.Name,
                    DisplayName = c.DisplayName,
                    Department = c.Department,
                    NumberOfSections = c.NumberOfSections,
                    Enrollment = c.Enrollment,
                    PreferredCourseExpressions = c.PreferredTimeslots.Select(p => new PreferredCourseExpression
                    {
                        ExpressionId = expressionIndexToExpressionId[p]
                    }).ToList(),
                };

                _context.Courses.Add(course);
                _context.PreferredCourseExpressions.AddRange(course.PreferredCourseExpressions);
                eventLogs.Add(new EventLog
                {
                    Action = "ADD",
                    Target = "COURSE",
                    Name = course.Name,
                    Detail = JsonSerializer.Serialize(new
                    {
                        department = course.Department,
                        displayName = course.DisplayName,
                        numberOfSections = course.NumberOfSections,
                        enrollment = course.Enrollment,
                    })
                });
                await _context.SaveChangesAsync();
            }
            return eventLogs;
        }

        public async Task<List<EventLog>> FetchEventLogPageAsync(int page = 1, int pageSize = 15)
        {
            var offset = (page - 1) * pageSize;
            var query = $@"
                SELECT timestamp, action, target, name, detail
                FROM schdl.eventLogs
                ORDER BY timestamp DESC
                OFFSET @offset ROWS
                FETCH NEXT @pageSize ROWS ONLY";
            var parameters = new SqlParameter[]
            {
                new SqlParameter("@offset", offset),
                new SqlParameter("@pageSize", pageSize)
            };

            return await _context.Database.SqlQueryRaw<EventLog>(query, parameters).ToListAsync();
        }

        public async Task InsertEventLogsAsync(IEnumerable<EventLog> logs)
        {
            var query = $@"
                INSERT INTO schdl.eventLogs (action, target, name, detail)
                VALUES
                {string.Join(",", logs.Select((l, i) => $"(@action{i}, @target{i}, @name{i}, @detail{i})"))}
            ";
            var parameters = logs.SelectMany((l, i) => new List<SqlParameter>()
                {
                    new SqlParameter($"@action{i}", l.Action),
                    new SqlParameter($"@target{i}", l.Target),
                    new SqlParameter($"@name{i}", l.Name),
                    new SqlParameter($"@detail{i}", l.Detail)
                });
            await _context.Database.ExecuteSqlRawAsync(query, parameters);
        }

        public async Task<int> GetTotalPagesAsync(int pageSize)
        {
            if (pageSize == 0)
            {
                throw new System.InvalidOperationException("Page size cannot be zero.");
            }
            var query = @"
                SELECT COUNT(*)
                FROM schdl.eventLogs";

            var entries = await _context.Database.ExecuteSqlRawAsync(query);
            return (int)Math.Ceiling(entries / (double)pageSize);

        }

        private async Task UpdatePreferredDepartments(Room existingRoom, IEnumerable<PreferredDepartmentRoom> newDepartments)
        {
            // Remove departments that are no longer associated
            foreach (var existingDept in existingRoom.PreferredDepartmentRooms.ToList())
            {
                if (!newDepartments.Any(d => d.Department == existingDept.Department))
                {
                    _context.PreferredDepartmentRooms.Remove(existingDept);
                }
            }

            foreach (var newDept in newDepartments)
            {
                var existingDept = existingRoom.PreferredDepartmentRooms
                    .FirstOrDefault(d => d.Department == newDept.Department);

                if (existingDept == null)
                {
                    existingRoom.PreferredDepartmentRooms.Add(newDept);
                }
                else
                {
                    _context.Entry(existingDept).CurrentValues.SetValues(newDept);
                }
            }
            await _context.SaveChangesAsync();
        }

        // Upsert PreferredDepartments for a specific Room ID
        private async Task UpsertPreferredDepartmentsAsync(int roomId, IEnumerable<PreferredDepartmentRoom> departments)
        {
            // Delete all old preferred departments for this room
            var oldDepts = _context.PreferredDepartmentRooms.Where(d => d.RoomId == roomId);
            _context.PreferredDepartmentRooms.RemoveRange(oldDepts);
            await _context.SaveChangesAsync();

            // Add new ones
            foreach (var dept in departments)
            {
                dept.RoomId = roomId;
                _context.PreferredDepartmentRooms.Add(dept);
            }

            await _context.SaveChangesAsync();
        }
    }
}
