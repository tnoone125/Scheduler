namespace Scheduler.Web.Models
{
    public class Expression
    {
        public List<DaySlot> Slots { get; set; }

        public static bool ExpressionsClash(Expression expression1, Expression expression2)
        {
            foreach (var daySlot in expression1.Slots)
            {
                var sameDaySlots = expression2.Slots.Where(s => s.Day == daySlot.Day);
                foreach (var timeslot in daySlot.TimeSlots)
                {
                    bool hasClashing = sameDaySlots.Any(s =>
                        s.TimeSlots.Any(t => timeslot.Start < t.End && t.Start < timeslot.End));
                    if (hasClashing)
                    {
                        return true;
                    }
                }
            }
            return false;
        }
    }
}
