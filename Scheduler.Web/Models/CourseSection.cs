namespace Scheduler.Web.Models
{
    public class CourseSection
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
        public int SectionNum { get; set; }
        public string SectionDisplayName => $"{DisplayName}.{SectionNum}";
        public string Department { get; set; }
        public int StudentEnrollment { get; set; }
        public List<int> PreferredTimeslots { get; set; }
    }
}
