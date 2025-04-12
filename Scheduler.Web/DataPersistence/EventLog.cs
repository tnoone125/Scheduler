using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scheduler.Web.DataPersistence
{
    [Keyless]
    [Table("eventLogs", Schema = "schdl")]
    public class EventLog
    {
        [Column(TypeName = "datetime2")]
        public DateTime Timestamp { get; set; }
        [StringLength(20)]
        public string Action { get; set; }
        [StringLength(25)]
        public string Target { get; set; }
        [StringLength(65)]
        public string? Name { get; set; }
        public string Detail { get; set; }
    }
}
