using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scheduler.Web.DataPersistence
{
    [Table("expressionTimeslots", Schema = "schdl")]
    public class ExpressionTimeslot
    {
        [Key, Column(Order = 0)]
        public int ExpressionId { get; set; }

        [ForeignKey("ExpressionId")]
        public Expression Expression { get; set; }

        [Key, Column(Order = 1)]
        public int SlotId { get; set; }

        [ForeignKey("SlotId")]
        public Timeslot Timeslot { get; set; }
    }
}