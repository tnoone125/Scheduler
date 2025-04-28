using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scheduler.Web.DataPersistence
{
    [Table("preferredDepartmentRooms", Schema = "schdl")]
    public class PreferredDepartmentRoom
    {
        [Key]
        public int RoomId { get; set; }

        [Key]
        [StringLength(55)]
        public string Department { get; set; }

        [ForeignKey("RoomId")]
        public Room Room { get; set; }
    }
}