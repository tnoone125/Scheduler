using Scheduler.Web.DataPersistence;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scheduler.Web.DataPersistence
{
    [Table("timeslots", Schema = "schdl")]
    public class Timeslot
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int SlotId { get; set; }

        [Required]
        [StringLength(10)]
        public string Start { get; set; }

        [Required]
        [StringLength(10)]
        public string End { get; set; }

        [Required]
        [StringLength(10)]
        public string Day { get; set; }

        public ICollection<ExpressionTimeslot> ExpressionTimeslots { get; set; }
    }
}