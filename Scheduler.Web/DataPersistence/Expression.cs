using Scheduler.Web.DataPersistence;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Scheduler.Web.DataPersistence
{
    [Table("expressions", Schema = "schdl")]
    public class Expression
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ExpressionId { get; set; }

        public ICollection<ExpressionTimeslot> ExpressionTimeslots { get; set; }
        public ICollection<PreferredCourseExpression> PreferredCourseExpressions { get; set; }
    }
}