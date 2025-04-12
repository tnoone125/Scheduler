using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scheduler.Web.DataPersistence
{
    [Table("preferredDepartmentRooms", Schema = "schdl")]
    public class PreferredDepartmentRoom
    {
        [Key, Column(Order = 0)]
        public int RoomId { get; set; }

        [ForeignKey("RoomId")]
        public Room Room { get; set; }

        [StringLength(55)]
        public string Department { get; set; }
    }
}