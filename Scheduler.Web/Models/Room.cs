namespace Scheduler.Web.Models
{
    public class Room
    {
        public string Name { get; set; }
        public List<string> PermittedDepartments { get; set; }
        public int StudentCapacity { get; set; }
    }
}
