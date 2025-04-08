namespace Scheduler.Web.Models
{
    public enum Day
    {
        MONDAY = 1,
        TUESDAY = 2,
        WEDNESDAY = 3,
        THURSDAY = 4,
        FRIDAY = 5,
        SATURDAY = 6,
        SUNDAY = 7,
    }

    public class TimeSlot
    {
        public TimeOnly Start { get; set; }
        public TimeOnly End { get; set; }
    }

    public class DaySlot
    {
        public Day Day { get; set; }
        public List<TimeSlot> TimeSlots { get; set; }
    }
}
