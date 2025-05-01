using System.ComponentModel.DataAnnotations;

namespace Scheduler.Web.Models
{
    public class EventLogModel
    {
        public string Timestamp { get; set; }

        public string Action { get; set; }
        
        public string Target { get; set; }

        public string? Name { get; set; }

        public string Detail { get; set; }
    }
}
