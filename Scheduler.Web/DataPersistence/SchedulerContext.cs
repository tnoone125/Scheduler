using Scheduler.Web.Models;
using Microsoft.EntityFrameworkCore;

namespace Scheduler.Web.DataPersistence
{
    public class SchedulerContext : DbContext
    {
        public SchedulerContext(DbContextOptions<SchedulerContext> options)
                : base(options)
        {
        }

        public DbSet<Course> Courses { get; set; }
        public DbSet<Expression> Expressions { get; set; }
        public DbSet<ExpressionTimeslot> ExpressionTimeslots { get; set; }
        public DbSet<Instructor> Instructors { get; set; }
        public DbSet<PreferredCourseExpression> PreferredCourseExpressions { get; set; }
        public DbSet<PreferredDepartmentRoom> PreferredDepartmentRooms { get; set; }
        public DbSet<Room> Rooms { get; set; }
        public DbSet<Timeslot> Timeslots { get; set; }
        public DbSet<EventLog> EventLogs { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Instructor>()
                .HasKey(i => i.Name);

            modelBuilder.Entity<ExpressionTimeslot>()
                .HasKey(et => new { et.ExpressionId, et.SlotId });

            modelBuilder.Entity<PreferredCourseExpression>()
                .HasKey(pce => new { pce.CourseId, pce.ExpressionId });

            modelBuilder.Entity<PreferredDepartmentRoom>()
                .HasKey(pdr => new { pdr.RoomId, pdr.Department });

            modelBuilder.Entity<EventLog>()
                .HasNoKey();

            modelBuilder.Entity<PreferredDepartmentRoom>()
                .HasOne(pdr => pdr.Room)
                .WithMany(r => r.PreferredDepartmentRooms)
                .HasForeignKey(pdr => pdr.RoomId);

            modelBuilder.Entity<Course>()
                .HasMany(c => c.PreferredCourseExpressions)
                .WithOne(pce => pce.Course)
                .HasForeignKey(pce => pce.CourseId);

            modelBuilder.Entity<Expression>()
                .HasMany(e => e.PreferredCourseExpressions)
                .WithOne(pce => pce.Expression)
                .HasForeignKey(pce => pce.ExpressionId);

            base.OnModelCreating(modelBuilder);
        }
    }
}