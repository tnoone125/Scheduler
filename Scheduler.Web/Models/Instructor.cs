using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace Scheduler.Web.Models
{
    [Table("instructors", Schema = "schdl")]
    public class Instructor
    {
        [Key]
        [StringLength(55)]
        public string Name { get; set; }

        [Required]
        [StringLength(55)]
        public string Department { get; set; }

        public int? CourseMin { get; set; }

        public int? CourseMax { get; set; }
    }
}
