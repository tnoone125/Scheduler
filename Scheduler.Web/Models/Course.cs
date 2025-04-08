namespace Scheduler.Web.Models
{
    public class Course
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public string Department { get; set; }
        public int Enrollment { get; set; }
        public int NumberOfSections { get; set; }
        public List<int> PreferredTimeslots { get; set; }
    }
}
